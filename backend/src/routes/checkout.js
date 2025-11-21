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
        const customer_email = req.body.customer_email || null;
        const order = await orderService.createOrder({ items, customer_email });

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
