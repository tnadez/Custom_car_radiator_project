const orderModel = require('../models/orderModel');
const productModel = require('../models/productModel');
const { pool } = require('../config/db');

exports.createOrder = async ({ items = [], customer_email = null, customer_name = null, customer_phone = null, address = null }) => {
    // compute total
    const total = items.reduce((s, it) => s + (Number(it.price) || 0) * (it.quantity || 1), 0);
    const order = await orderModel.create({ items, total, customer_email, customer_name, customer_phone, address, status: 'pending' });
    return order;
};

exports.getOrder = async (id) => await orderModel.findById(id);

exports.listOrders = async () => await orderModel.list();

// Mark order paid and atomically decrement product stock for each order item.
exports.markPaid = async (id, stripeSessionId) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Lock order and its items (simplified by re-reading after potential concurrent changes)
        const order = await orderModel.findById(id);
        if (!order) throw new Error('Order not found');

        // Decrement stock for each item referencing a product.
        for (const it of order.items) {
            if (it.product_id) {
                const updatedRow = await productModel.decrementQuantity(client, it.product_id, it.quantity);
                if (!updatedRow) {
                    throw new Error(`Insufficient stock for product ${it.product_id}`);
                }
            }
        }

        // Update order status
        await client.query(
            'UPDATE orders SET status=$1, stripe_session_id = COALESCE($2, stripe_session_id) WHERE id=$3',
            ['paid', stripeSessionId, id]
        );

        await client.query('COMMIT');
        // Return full order with items
        return await orderModel.findById(id);
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

exports.attachStripeSession = async (id, sessionId) => await orderModel.attachStripeSession(id, sessionId);
