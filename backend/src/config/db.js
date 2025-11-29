const { Pool } = require('pg');
require('dotenv').config();

// Use DATABASE_URL if provided (e.g., from Heroku) or individual parts
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function init() {
  // Create products table with full schema if not exists
  await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        product_id TEXT UNIQUE,
        name TEXT NOT NULL,
        price NUMERIC(10,2) NOT NULL DEFAULT 0,
        description TEXT,
        brand TEXT,
        material TEXT,
        quantity INTEGER NOT NULL DEFAULT 0,
        image TEXT,
        specifications TEXT[]
      );
    `);

  // Orders table
  await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        total NUMERIC(10,2) NOT NULL DEFAULT 0,
        customer_email TEXT,
        customer_name TEXT,
        customer_phone TEXT,
        address TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        stripe_session_id TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

  // Add columns if they don't exist (for existing databases)
  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='customer_name') THEN
        ALTER TABLE orders ADD COLUMN customer_name TEXT;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='customer_phone') THEN
        ALTER TABLE orders ADD COLUMN customer_phone TEXT;
      END IF;
    END $$;
  `);

  await pool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id),
        name TEXT NOT NULL,
        unit_price NUMERIC(10,2) NOT NULL DEFAULT 0,
        quantity INTEGER NOT NULL DEFAULT 1
      );
    `);

}

module.exports = {
  pool,
  init,
};
