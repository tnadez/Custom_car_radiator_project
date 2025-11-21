const { Pool } = require('pg');
require('dotenv').config();

// Use DATABASE_URL if provided (e.g., from Heroku) or individual parts
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function init() {
    // Note: products table already exists in the database with full schema
    // (id, name, price, description, brand, material, quantity, image, specifications)
    // We only create orders and order_items tables
    
    // Orders table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        total NUMERIC(10,2) NOT NULL DEFAULT 0,
        customer_email TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        stripe_session_id TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
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
