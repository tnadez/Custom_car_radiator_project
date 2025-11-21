# 🚀 Quick Start Guide

## Prerequisites

- Node.js (v14+)
- npm or yarn
- Postgres running (port 5432)
- Stripe account (https://stripe.com)

---

## One-Command Setup

### Backend

```powershell
# Terminal 1: Backend Setup
cd .\backend\
npm install
npm start
```

Output should show:

```
Server listening on port 3000
Database initialized successfully
```

### Frontend

```powershell
# Terminal 2: Frontend Setup
cd .\CustomizeRadiator\
npm install
npm run dev
```

Output should show:

```
Local:   http://localhost:5173
Press r + enter to reload
Press q + enter to quit
```

---

## Test the Checkout Flow (2 minutes)

1. **Open in Browser**

   ```
   http://localhost:5173/products
   ```

2. **Add Item to Cart**

   - Click "ADD TO CART" on any product
   - See cart badge increment in navbar

3. **Open Cart Drawer**

   - Click cart icon in navbar
   - Verify item appears with quantity controls

4. **Go to Checkout**

   - Click "Checkout" button in drawer
   - Review order summary

5. **Make Test Payment**

   - Click "Pay with Stripe"
   - Use card: `4242 4242 4242 4242`
   - Expiry: `12/25` (or any future date)
   - CVC: `123` (any 3 digits)
   - Click "Pay"

6. **See Success Page**
   - Should redirect to `/success`
   - See confirmation message
   - Cart should be empty

---

## Test Different Scenarios

### ❌ Declined Card

```
Card: 4000 0000 0000 0002
Expiry: 12/25
CVC: 123
Result: Payment declined → redirects to /cancel
```

### 3D Secure (Requires Additional Authentication)

```
Card: 4000 0025 0000 3155
Expiry: 12/25
CVC: 123
Result: 3D Secure popup → complete auth
```

### Multiple Items

1. Add several items with different quantities
2. Go through checkout
3. Verify all items and calculations on checkout page
4. Complete payment

---

## Environment Configuration

### Frontend (.env.local)

Already created. Contains:

```
VITE_API_URL=http://localhost:3000
```

For production, update to your API URL:

```
VITE_API_URL=https://api.yourdomain.com
```

### Backend (.env)

Already configured. Contains:

```
DATABASE_URL=postgres://admin:admin123@localhost:5432/mydatabase
STRIPE_SECRET_KEY=sk_test_51SIRVjEPyRs5YBm3...
STRIPE_WEBHOOK_SECRET=whsec_2160cab4a773...
PORT=3000
```

**Never commit `.env` with real keys!** ⚠️

---

## Common Issues & Solutions

### Issue: "Cannot POST /api/checkout"

**Cause**: Backend not running

**Solution**:

```powershell
# Check if backend is running
netstat -ano | findstr :3000

# If not, start it
cd .\backend\
npm start
```

### Issue: "Network request failed"

**Cause**: Frontend can't reach backend

**Solution**:

```powershell
# Verify backend is running on port 3000
# Verify VITE_API_URL in .env.local is correct
# Check firewall isn't blocking localhost:3000
```

### Issue: "Database connection error"

**Cause**: Postgres not running or connection string wrong

**Solution**:

```powershell
# Check Postgres is running
docker ps | findstr postgres

# If not running, start it
docker-compose up -d postgres

# Verify DATABASE_URL in .env
```

### Issue: Cart not persisting after page refresh

**Current Behavior**: This is expected. Cart is stored in React state.

**To Fix**: Add localStorage persistence (see next section)

---

## Enhancement: Persist Cart to LocalStorage

To make cart survive page refreshes, update `CartContext.tsx`:

```tsx
// Add this import
import { useEffect } from "react";

// Add localStorage sync
useEffect(() => {
  localStorage.setItem("cartItems", JSON.stringify(cartItems));
}, [cartItems]);

// Load from localStorage on mount
const [cartItems, setCartItems] = useState(() => {
  const saved = localStorage.getItem("cartItems");
  return saved ? JSON.parse(saved) : [];
});
```

---

## File Locations Reference

| What               | Where                            |
| ------------------ | -------------------------------- |
| Frontend main page | `http://localhost:5173`          |
| Backend API        | `http://localhost:3000/api`      |
| Checkout page      | `http://localhost:5173/checkout` |
| Products page      | `http://localhost:5173/products` |
| Stripe Dashboard   | `https://dashboard.stripe.com`   |
| Backend code       | `./backend/src/`                 |
| Frontend code      | `./CustomizeRadiator/src/`       |

---

## Verify Everything is Working

Run this checklist:

- [ ] Backend starts without errors
- [ ] Frontend loads at http://localhost:5173
- [ ] Can navigate to /products
- [ ] Can click "ADD TO CART"
- [ ] Cart badge appears in navbar
- [ ] Cart drawer shows items
- [ ] Can navigate to /checkout
- [ ] Checkout page shows order summary
- [ ] Can complete test payment with Stripe
- [ ] Redirects to /success
- [ ] Can see "Continue Shopping" button

All ✅? **Great! Checkout is ready to use!**

---

## Next Steps

1. **Test Webhook** (Optional):

   ```powershell
   stripe listen --forward-to localhost:3000/webhook
   ```

2. **Add Email Notifications**:

   - Integrate SendGrid or similar service
   - Send order confirmation emails

3. **Order History**:

   - Create `/orders` page
   - Show past orders for users

4. **Deploy**:
   - Push to GitHub
   - Deploy frontend to Vercel/Netlify
   - Deploy backend to Heroku/Railway

---

## Getting Help

- **Stripe Docs**: https://stripe.com/docs/checkout
- **React Docs**: https://react.dev
- **Express Docs**: https://expressjs.com
- **Postgres Docs**: https://www.postgresql.org/docs

---

**Happy checkout! 🎉**

Last Updated: November 18, 2025
