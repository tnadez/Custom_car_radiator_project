const orderModel = require('../models/orderModel');

exports.createOrder = async ({ items = [], customer_email = null }) => {
    // compute total
    const total = items.reduce((s, it) => s + (Number(it.price) || 0) * (it.quantity || 1), 0);
    const order = await orderModel.create({ items, total, customer_email, status: 'pending' });
    return order;
};

exports.getOrder = async (id) => await orderModel.findById(id);

exports.listOrders = async () => await orderModel.list();

exports.markPaid = async (id, stripeSessionId) => await orderModel.updateStatus(id, 'paid', stripeSessionId);

exports.attachStripeSession = async (id, sessionId) => await orderModel.attachStripeSession(id, sessionId);
