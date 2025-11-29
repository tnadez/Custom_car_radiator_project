const { pool } = require('../config/db');

exports.create = async ({ items = [], total = 0, customer_email = null, customer_name = null, customer_phone = null, address = null, status = 'pending', stripe_session_id = null }) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        // coerce total to a Number (Postgres numeric will accept a JS number)
        const safeTotal = Number(total) || 0;
        const res = await client.query(
            'INSERT INTO orders(total, customer_email, customer_name, customer_phone, address, status, stripe_session_id) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *',
            [safeTotal, customer_email, customer_name, customer_phone, address, status, stripe_session_id]
        );
        const order = res.rows[0];

        for (const it of items) {
            // Normalize / validate fields to avoid DB type errors
            const rawPid = it.product_id ?? it.id ?? null;
            let productId = null;
            if (rawPid !== null && rawPid !== undefined) {
                const n = Number(rawPid);
                if (Number.isFinite(n) && n > 0) { // Must be positive and valid
                    const truncated = Math.trunc(n);
                    // 32-bit signed integer safe range for Postgres `integer` type
                    if (truncated >= 1 && truncated <= 2147483647) {
                        // Verify product exists in products table before using as FK
                        const checkProduct = await client.query(
                            'SELECT id FROM products WHERE id = $1',
                            [truncated]
                        );
                        if (checkProduct.rows.length > 0) {
                            productId = truncated;
                        }
                        // If product doesn't exist, leave productId as null
                    }
                }
            }

            const name = String(it.title ?? it.name ?? 'Product');
            const unitPrice = Number(it.price) || 0;
            const quantity = Number.isFinite(Number(it.quantity)) ? Math.trunc(Number(it.quantity)) : 1;

            await client.query(
                'INSERT INTO order_items(order_id, product_id, name, unit_price, quantity) VALUES($1,$2,$3,$4,$5)',
                [order.id, productId, name, unitPrice, quantity]
            );
        }

        await client.query('COMMIT');
        return await exports.findById(order.id);
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

exports.findById = async (id) => {
    const res = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
    const order = res.rows[0];
    if (!order) return null;
    const items = (await pool.query('SELECT * FROM order_items WHERE order_id = $1', [id])).rows;
    return { ...order, items };
};

exports.findByStripeSessionId = async (stripeSessionId) => {
    const res = await pool.query('SELECT * FROM orders WHERE stripe_session_id = $1', [stripeSessionId]);
    const order = res.rows[0];
    if (!order) return null;
    const items = (await pool.query('SELECT * FROM order_items WHERE order_id = $1', [order.id])).rows;
    return { ...order, items };
};

exports.updateStatus = async (id, status, stripe_session_id = null) => {
    const res = await pool.query('UPDATE orders SET status=$1, stripe_session_id = COALESCE($2, stripe_session_id) WHERE id=$3 RETURNING *', [status, stripe_session_id, id]);
    return res.rows[0];
};

exports.attachStripeSession = async (id, stripeSessionId) => {
    const res = await pool.query('UPDATE orders SET stripe_session_id=$1 WHERE id=$2 RETURNING *', [stripeSessionId, id]);
    return res.rows[0];
};

exports.list = async () => {
    const res = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    const rows = res.rows;
    for (const r of rows) {
        r.items = (await pool.query('SELECT * FROM order_items WHERE order_id = $1', [r.id])).rows;
    }
    return rows;
};
