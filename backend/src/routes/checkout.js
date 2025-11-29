const express = require('express');
const router = express.Router();
const paymentService = require('../services/paymentService');
const orderService = require('../services/orderService');

// Create a Stripe Checkout session for provided items
router.post('/', async (req, res, next) => {
    try {
        const { items, success_url, cancel_url } = req.body;
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'items required (array)' });
        }
        // create an order in DB first
        const customer_email = req.body.customerEmail || req.body.customer_email || null;
        const customer_name = req.body.customerName || req.body.customer_name || null;
        const customer_phone = req.body.customerPhone || req.body.customer_phone || null;
        const address = req.body.address || null;
        const order = await orderService.createOrder({ items, customer_email, customer_name, customer_phone, address });

        const session = await paymentService.createCheckoutSession(
            items,
            success_url || `${req.protocol}://${req.get('host')}/success`,
            cancel_url || `${req.protocol}://${req.get('host')}/cancel`,
            { order_id: String(order.id) }
        );

        // attach stripe session id to order
        await orderService.attachStripeSession(order.id, session.id);

        res.json({ id: session.id, url: session.url, order });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
