# E-commerce Example (Node.js + Express)

This is a minimal example project structure for a simple e-commerce API using Node.js and Express. It uses an in-memory data store for demonstration.

How to run:

1. cd into the folder:

   ```powershell
   cd c:\Users\Thanadech\Desktop\Project\ecommerce-example
   ```

2. Install dependencies:

   ```powershell
   npm install
   ```

3. Start server:

   ```powershell
   npm start
   ```

The server will listen on port 3000 by default.

What's included:

- `index.js` - app bootstrap
- `src/routes/products.js` - routes for products
- `src/controllers/productController.js` - controllers
- `src/services/productService.js` - business logic
- `src/models/productModel.js` - in-memory model
- `src/middleware/errorHandler.js` - simple error handler

## Environment

This example now supports Postgres and Stripe. Create a `.env` file at the project root (or set environment variables) with these values (see `.env.example`):

- `DATABASE_URL` - Postgres connection string (e.g. `postgres://user:pass@localhost:5432/dbname`)
- `STRIPE_SECRET_KEY` - your Stripe secret key (starts with `sk_test_...`)

Run `npm install` after updating `package.json` to install new deps.

This is a minimal skeleton intended for learning and quick prototyping.
