# Checkout System Architecture

## Component Hierarchy

```
App.jsx (RouterProvider + CartProvider)
├── Navbar
│   └── CartIcon (opens CartDrawer)
│       └── CartDrawer (NEW)
│           └── Checkout Button → /checkout
│
└── Routes
    ├── / (Home)
    ├── /products (Products list)
    │   └── ProductCard
    │       └── Add to Cart button
    │
    ├── /products/:id (ProductsDetail - NEW CART INTEGRATION)
    │   └── Add to Cart button
    │
    ├── /custom-design (CustomDesign)
    │   └── Add to Cart button
    │
    ├── /checkout (NEW - Checkout page)
    │   ├── Order Summary (items, prices, tax, total)
    │   └── Stripe Pay Button
    │
    ├── /success (NEW - Success page)
    │   └── Confirmation message
    │
    ├── /cancel (NEW - Cancel page)
    │   └── Cancellation message
    │
    └── /contact (Contact)

CartContext
├── cartItems: []
├── cartCount: number
├── addToCart(item)
├── removeFromCart(id)
├── updateQuantity(id, qty)
└── clearCart()
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ProductsDetail.jsx ──→ ProductCard.jsx                     │
│         │                      │                             │
│         └──→ Add to Cart ──────┘                            │
│              │                                               │
│              ↓                                               │
│         CartContext (State)                                 │
│         - cartItems: [{...}]                                │
│         - cartCount: 3                                       │
│              │                                               │
│              ↓                                               │
│         Navbar (cart badge)                                 │
│              │                                               │
│              ↓                                               │
│         CartDrawer.jsx                                       │
│         - List items                                         │
│         - Update quantity                                    │
│         - "Checkout" button                                  │
│              │                                               │
│              ↓ (navigate to /checkout)                       │
│         Checkout.jsx                                         │
│         - Show items + prices                               │
│         - Calculate: subtotal → tax → total                │
│         - "Pay with Stripe" button                          │
│              │                                               │
│              ↓ (POST to /api/checkout)                       │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ HTTP Request
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (Express)                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  POST /api/checkout                                         │
│  (receives: items[], success_url, cancel_url)              │
│       │                                                      │
│       ↓                                                      │
│  OrderService.createOrder(items)                            │
│       │                                                      │
│       ├─→ Insert into orders table                          │
│       │   (id, status: 'pending', created_at)              │
│       │                                                      │
│       └─→ Insert into order_items table                     │
│           (order_id, product_id, qty, price)               │
│       │                                                      │
│       ↓                                                      │
│  PaymentService.createCheckoutSession(items)               │
│       │                                                      │
│       └─→ Stripe.checkout.sessions.create({                │
│           line_items: [...],                                │
│           payment_method_types: ['card','promptpay'],       │
│           currency: 'thb',                                  │
│           success_url,                                      │
│           cancel_url,                                       │
│           metadata: { order_id }                            │
│       })                                                     │
│       │                                                      │
│       ↓ (Stripe API call)                                    │
│  Response:                                                   │
│  {                                                           │
│    id: 'cs_live_...',                                       │
│    url: 'https://checkout.stripe.com/pay/...'             │
│  }                                                           │
│       │                                                      │
│       ↓                                                      │
│  OrderService.attachStripeSession(order_id, session_id)    │
│  (Update order.stripe_session_id)                           │
│       │                                                      │
│       ↓                                                      │
│  Return { url, order }                                      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ HTTP Response
                         ↓
┌─────────────────────────────────────────────────────────────┐
│               STRIPE HOSTED CHECKOUT                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  https://checkout.stripe.com/pay/cs_live_...               │
│       │                                                      │
│       ├─→ User enters card details                          │
│       │   (4242 4242 4242 4242 or PromptPay QR)           │
│       │                                                      │
│       └─→ User clicks "Pay"                                 │
│       │                                                      │
│       ↓ (Stripe processes payment)                          │
│       │                                                      │
│       ├─→ SUCCESS ──→ Redirect to success_url              │
│       │   (/success?session_id=...)                        │
│       │                                                      │
│       └─→ CANCELLED ─→ Redirect to cancel_url              │
│           (/cancel)                                         │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                         │
                ┌────────┴────────┐
                │                 │
                ↓ (Success)        ↓ (Cancel)
┌──────────────────────────────┐  ┌──────────────────┐
│   Success.jsx                │  │  Cancel.jsx      │
│   - Clear cart               │  │  - Keep cart     │
│   - Show confirmation        │  │  - Show message  │
│   - Offer continue shopping  │  │  - Offer retry   │
└──────────────────────────────┘  └──────────────────┘
```

## Database Schema (Relevant Tables)

```sql
-- Products table (already exists)
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table (created by db.init())
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    stripe_session_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',  -- 'pending', 'paid', 'shipped', 'completed'
    customer_email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order Items table (created by db.init())
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id),
    product_id INTEGER NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    price_at_purchase DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Payment Flow Sequence

```
Time    Frontend              Backend               Stripe              Database
────    ────────              ───────               ──────              ────────
t0      User adds items
        to cart
        (CartContext)

t1      User navigates
        to /checkout

t2      User clicks
        "Pay with Stripe"

t3                            POST /api/checkout
                              receives items

t4                            Create order
                              in DB
                                                                        ├─ INSERT orders
                                                                        │  (status='pending')
                                                                        └─ INSERT order_items

t5                            Create Stripe
                              session
                                                    Stripe session
                                                    created

t6                            Return session.url

t7      Redirect to
        Stripe checkout
        page

t8                                                 User enters
                                                    payment info

t9                                                 Stripe charges
                                                    card/promptpay

t10                                                Success/Failure

t11     Redirect to
        /success (or)
        /cancel

        (on success:
         clearCart())

t12+    (Webhook Event - Later)
                              POST /webhook
                              (from Stripe)

                              Verify webhook
                              signature
                                                                        ├─ UPDATE orders
                                                                        │  status='paid'
                                                                        └─ COMMIT
```

## API Endpoints

### POST /api/checkout

**Request:**

```json
{
  "items": [
    {
      "id": 1,
      "title": "ALUMINUM RADIATOR",
      "price": 199,
      "quantity": 2,
      "image": "https://..."
    }
  ],
  "success_url": "http://localhost:5173/success",
  "cancel_url": "http://localhost:5173/cancel"
}
```

**Response:**

```json
{
  "id": "cs_live_51SIRVjEPyRs5YBm3...",
  "url": "https://checkout.stripe.com/pay/cs_live_51SIRVjEPyRs5YBm3...",
  "order": {
    "id": 42,
    "stripe_session_id": "cs_live_51SIRVjEPyRs5YBm3...",
    "status": "pending",
    "created_at": "2025-11-18T12:00:00Z"
  }
}
```

### POST /webhook

**Stripe sends (not user request):**

```json
{
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "id": "cs_live_51SIRVjEPyRs5YBm3...",
      "metadata": {
        "order_id": "42"
      }
    }
  }
}
```

**Backend:**

- Verifies webhook signature
- Updates order status to 'paid'
- Optionally sends email confirmation

## State Management

```
App.jsx
│
└─→ CartProvider
    │
    └─→ CartContext
        ├─ State:
        │  ├─ cartItems: CartItem[]
        │  │  └─ CartItem:
        │  │     ├─ id: number
        │  │     ├─ title: string
        │  │     ├─ price: number (or string)
        │  │     ├─ image: string
        │  │     └─ quantity: number
        │  │
        │  └─ cartCount: number (sum of quantities)
        │
        ├─ Actions:
        │  ├─ addToCart(item)
        │  ├─ removeFromCart(id)
        │  ├─ updateQuantity(id, qty)
        │  └─ clearCart()
        │
        └─ Used by:
           ├─ ProductsDetail.jsx
           ├─ ProductCard.jsx
           ├─ Navbar.jsx
           ├─ CartDrawer.jsx
           └─ Checkout.jsx
           └─ Success.jsx
```

## File Structure Summary

```
Project/
├── CustomizeRadiator/          (Frontend - React + Vite)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Checkout.jsx           (NEW)
│   │   │   ├── Success.jsx            (NEW)
│   │   │   ├── Cancel.jsx             (NEW)
│   │   │   ├── ProductsDetail.jsx     (UPDATED)
│   │   │   ├── Products.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── CustomDesign.jsx
│   │   │   └── Contact.jsx
│   │   ├── components/
│   │   │   ├── Navbar.jsx             (UPDATED)
│   │   │   ├── CartDrawer.jsx         (UPDATED)
│   │   │   ├── ProductCard.jsx
│   │   │   └── Footer.jsx
│   │   ├── contexts/
│   │   │   └── CartContext.tsx        (EXISTING)
│   │   └── App.jsx                    (UPDATED)
│   ├── .env.local                     (NEW)
│   ├── vite.config.js
│   └── package.json
│
├── backend/                    (Express + Stripe + Postgres)
│   ├── src/
│   │   ├── routes/
│   │   │   ├── checkout.js            (EXISTING)
│   │   │   ├── webhook.js             (EXISTING)
│   │   │   ├── orders.js              (EXISTING)
│   │   │   └── products.js
│   │   ├── services/
│   │   │   ├── paymentService.js      (UPDATED)
│   │   │   ├── orderService.js        (EXISTING)
│   │   │   └── productService.js
│   │   ├── models/
│   │   │   ├── orderModel.js          (EXISTING)
│   │   │   └── productModel.js
│   │   ├── config/
│   │   │   └── db.js                  (EXISTING)
│   │   └── middleware/
│   │       └── errorHandler.js
│   ├── .env                           (EXISTING)
│   ├── index.js
│   ├── package.json
│   └── README.md
│
├── CHECKOUT_GUIDE.md           (NEW - Comprehensive guide)
├── IMPLEMENTATION_SUMMARY.md   (NEW - Quick reference)
├── VERIFICATION_CHECKLIST.md   (NEW - Testing checklist)
└── SYSTEM_ARCHITECTURE.md      (NEW - This file)
```

---

**Last Updated:** November 18, 2025
