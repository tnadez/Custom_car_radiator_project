# Stripe Checkout Integration Guide

## Overview

The e-commerce platform now includes a complete Stripe checkout flow:

1. **Frontend**: Product pages → Add to Cart → Cart Drawer → Checkout Page
2. **Backend**: Create order in DB → Stripe Checkout Session → Webhook handling
3. **Payment**: Stripe Hosted Checkout (Card + PromptPay)
4. **Confirmation**: Success/Cancel pages with order tracking

---

## Flow Diagram

```
User Actions:
  Add to Cart (ProductsDetail/Products)
    ↓
  Click Checkout (CartDrawer)
    ↓
  Review Order (Checkout page)
    ↓
  Pay with Stripe (Card/PromptPay)
    ↓
  Redirect to Success/Cancel

Backend:
  POST /api/checkout
    ↓
  1. Create Order in DB
  2. Create Stripe Session
  3. Attach Session ID to Order
    ↓
  Return { url, sessionId }
    ↓
  Stripe Webhook → Mark Order as Paid
```

---

## Frontend Setup

### Files Created/Updated

1. **`src/pages/Checkout.jsx`** - Main checkout page

   - Displays cart items and order summary
   - Calls `/api/checkout` to create Stripe session
   - Redirects to Stripe Hosted Checkout
   - Supports success/cancel URL fallback

2. **`src/pages/Success.jsx`** - Payment success page

   - Shows confirmation message
   - Clears cart on mount
   - Links to continue shopping or home

3. **`src/pages/Cancel.jsx`** - Payment cancelled page

   - Shows cancellation message
   - Keeps items in cart
   - Links back to checkout or home

4. **`src/components/CartDrawer.jsx`** - Updated

   - Added `useNavigate` hook
   - Checkout button now navigates to `/checkout`

5. **`src/App.jsx`** - Updated routes

   - `/checkout` → Checkout page
   - `/success` → Success page
   - `/cancel` → Cancel page

6. **`.env.local`** - Frontend environment
   ```
   VITE_API_URL=http://localhost:3000
   ```

### Running Frontend

```powershell
cd .\CustomizeRadiator\
npm install
npm run dev
```

The app will be available at `http://localhost:5173` (or next available port).

---

## Backend Verification

### Existing Endpoints

1. **POST `/api/checkout`** - Create Stripe session

   ```json
   Request body:
   {
     "items": [
       {
         "id": 1,
         "title": "ALUMINUM RADIATOR",
         "price": 199,
         "quantity": 1,
         "image": "..."
       }
     ],
     "success_url": "http://localhost:5173/success",
     "cancel_url": "http://localhost:5173/cancel"
   }

   Response:
   {
     "id": "cs_live_...",
     "url": "https://checkout.stripe.com/pay/cs_live_...",
     "order": {
       "id": 123,
       "status": "pending",
       "stripe_session_id": "cs_live_..."
     }
   }
   ```

2. **POST `/webhook`** - Stripe webhook

   - Listens for `checkout.session.completed`
   - Marks order as `paid`
   - Requires raw body parsing

3. **GET `/api/orders`** - List all orders
4. **GET `/api/orders/:id`** - Get order details

### Environment Variables (.env)

```
DATABASE_URL=postgres://admin:admin123@localhost:5432/mydatabase
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
PORT=3000
```

### Running Backend

```powershell
cd .\backend\
npm install
npm start
```

Backend listens on `http://localhost:3000`.

---

## Testing the Checkout Flow

### Quick Test (Without Real Payment)

1. **Start Backend**:

   ```powershell
   cd .\backend\
   npm start
   # Output: "Server listening on port 3000"
   ```

2. **Start Frontend** (new terminal):

   ```powershell
   cd .\CustomizeRadiator\
   npm run dev
   # Output: "Local: http://localhost:5173"
   ```

3. **Test Add to Cart**:

   - Go to `/products` or `/products/1`
   - Click "ADD TO CART"
   - Verify cart badge increments in navbar
   - Verify item appears in cart drawer

4. **Test Checkout Page**:

   - Click cart icon → "Checkout"
   - Verify all cart items are listed
   - Verify subtotal, tax (7%), and total calculations
   - Click "Pay with Stripe"

5. **Test Stripe Checkout** (Test Mode):

   - Redirect to Stripe Hosted Checkout page
   - Use Stripe test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC
   - Click "Pay"

6. **Test Success/Cancel**:
   - After payment, redirect to `/success`
   - If cancelled, redirect to `/cancel`
   - Cart should be cleared on success

### Testing with Stripe CLI (Webhook Verification)

1. **Install Stripe CLI** (Download from https://stripe.com/docs/stripe-cli)

2. **Login to Stripe**:

   ```powershell
   stripe login
   # Follow browser prompt to authenticate
   ```

3. **Forward webhook events**:

   ```powershell
   stripe listen --forward-to localhost:3000/webhook
   # Output: "Webhook signing secret: whsec_..."
   ```

4. **Update `.env`**:

   ```
   STRIPE_WEBHOOK_SECRET=whsec_... (from above)
   ```

5. **Complete a test checkout** and observe:
   - Backend receives webhook
   - Order status updates to `paid`

---

## Stripe Test Cards

| Type           | Card Number         | Result             |
| -------------- | ------------------- | ------------------ |
| Visa           | 4242 4242 4242 4242 | Successful payment |
| Visa (Decline) | 4000 0000 0000 0002 | Payment declined   |
| 3D Secure      | 4000 0025 0000 3155 | 3D Secure prompt   |

**Expiry**: Any future date (e.g., 12/25)  
**CVC**: Any 3 digits (e.g., 123)

---

## Production Deployment

### Prerequisites

- Stripe production keys (apply for account upgrade)
- Set `NODE_ENV=production`
- Update Stripe webhook endpoint URL to your production domain
- Set frontend API URL to production backend:
  ```
  VITE_API_URL=https://api.yourdomain.com
  ```

### Steps

1. Update `.env` with production keys
2. Deploy backend (Heroku, AWS, etc.)
3. Deploy frontend (Vercel, Netlify, etc.)
4. Register webhook endpoint in Stripe Dashboard:
   - Go to Developers → Webhooks
   - Add endpoint: `https://api.yourdomain.com/webhook`
   - Select events: `checkout.session.completed`

---

## Troubleshooting

### Issue: "Failed to create checkout session"

**Solution**:

- Verify Stripe keys are correct in `.env`
- Check backend is running on port 3000
- Check network tab for API error details

### Issue: "Cannot find module '@stripe/react-stripe-js'"

**Solution**:

```powershell
cd .\backend\
npm install stripe
```

### Issue: Webhook not triggering

**Solution**:

- Ensure `stripe listen` is running
- Check webhook signing secret matches `STRIPE_WEBHOOK_SECRET`
- Verify firewall allows localhost:3000

### Issue: Cart drawer not closing after checkout

**Solution**:

- The `onClose` is called before navigation
- Verify `useNavigate` is imported in `CartDrawer.jsx`

---

## Next Steps (Optional Enhancements)

1. **Email Notifications**: Send order confirmation emails via SendGrid
2. **Order History**: Display past orders in customer dashboard
3. **Refunds**: Handle refund requests via Stripe API
4. **Coupon Codes**: Integrate coupon/discount logic
5. **Payment Methods**: Add saved payment methods
6. **Wallet Integration**: Add Apple Pay, Google Pay

---

## Architecture Summary

```
CustomizeRadiator/
├── src/
│   ├── pages/
│   │   ├── Checkout.jsx       (NEW - checkout page)
│   │   ├── Success.jsx        (NEW - success page)
│   │   └── Cancel.jsx         (NEW - cancel page)
│   ├── components/
│   │   └── CartDrawer.jsx     (UPDATED - navigate to checkout)
│   ├── contexts/
│   │   └── CartContext.tsx    (provides addToCart, clearCart)
│   └── App.jsx                (UPDATED - added routes)
├── .env.local                 (NEW - API URL config)
└── vite.config.js

backend/
├── src/
│   ├── routes/
│   │   ├── checkout.js        (EXISTING - creates session)
│   │   ├── webhook.js         (EXISTING - validates webhook)
│   │   └── orders.js          (EXISTING - list/get orders)
│   ├── services/
│   │   ├── paymentService.js  (UPDATED - support title field)
│   │   └── orderService.js    (EXISTING - create order)
│   └── models/
│       └── orderModel.js      (EXISTING - order CRUD)
├── .env                       (Stripe keys)
└── index.js
```

---

## Questions?

Refer to Stripe documentation: https://stripe.com/docs/checkout/hosted-page
