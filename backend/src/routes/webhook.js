const express = require('express');
const router = express.Router();
require('dotenv').config();
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const orderService = require('../services/orderService');

// This route expects raw body (mounted with express.raw in index.js)
router.post('/', async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        console.error('Webhook signature verification failed.', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            const orderId = session.metadata && session.metadata.order_id;
            if (orderId) {
                try {
                    await orderService.markPaid(orderId, session.id);
                } catch (err) {
                    console.error('Failed to mark order paid', err);
                }
            }
            break;
        default:
            // Unhandled event types
            break;
    }

    res.json({ received: true });
});

module.exports = router;
