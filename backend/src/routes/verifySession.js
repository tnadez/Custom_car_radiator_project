const express = require('express');
const router = express.Router();
require('dotenv').config();
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const orderService = require('../services/orderService');
const emailService = require('../services/emailService');

// Verify Stripe session and update order status
router.post('/', async (req, res, next) => {
    try {
        const { session_id } = req.body;

        console.log('=== VERIFY SESSION REQUEST ===');
        console.log('Session ID:', session_id);

        if (!session_id) {
            console.log('ERROR: session_id is missing');
            return res.status(400).json({ error: 'session_id is required' });
        }

        // Retrieve the session from Stripe
        const session = await stripe.checkout.sessions.retrieve(session_id);
        console.log('Stripe Session Retrieved:', {
            id: session.id,
            payment_status: session.payment_status,
            metadata: session.metadata
        });

        if (!session) {
            console.log('ERROR: Session not found');
            return res.status(404).json({ error: 'Session not found' });
        }

        // Check if payment was successful
        if (session.payment_status === 'paid') {
            const orderId = session.metadata && session.metadata.order_id;
            console.log('Payment is PAID. Order ID:', orderId);

            if (orderId) {
                // Idempotency: if order already paid, don't send email again
                const existing = await orderService.getOrder(orderId);
                if (existing && String(existing.status).toLowerCase() === 'paid') {
                    console.log('Order already paid. Skipping update/email.');
                    return res.json({ success: true, order: existing, payment_status: session.payment_status });
                }

                // Update order status to paid
                console.log('Updating order status to paid...');
                const updatedOrder = await orderService.markPaid(orderId, session.id);
                console.log('Order updated successfully:', updatedOrder);

                // Send payment confirmation email
                try {
                    console.log('Sending payment confirmation email...');
                    const emailResult = await emailService.sendPaymentConfirmation({
                        orderId: updatedOrder.id,
                        customerName: updatedOrder.customer_name || 'Customer',
                        customerEmail: updatedOrder.customer_email,
                        total: updatedOrder.total,
                        items: updatedOrder.items || [],
                        address: updatedOrder.address,
                        createdAt: updatedOrder.created_at,
                    });
                    console.log('Email send result:', emailResult);
                } catch (emailError) {
                    console.error('Failed to send email, but order was updated:', emailError);
                }

                return res.json({
                    success: true,
                    order: updatedOrder,
                    payment_status: session.payment_status
                });
            } else {
                console.log('ERROR: Order ID not found in metadata');
                return res.status(400).json({ error: 'Order ID not found in session metadata' });
            }
        } else {
            console.log('Payment not completed. Status:', session.payment_status);
            // Try to send payment failed email if possible
            try {
                const orderId = session.metadata && session.metadata.order_id;
                if (orderId) {
                    const order = await orderService.getOrder(orderId);
                    if (order && order.customer_email) {
                        // Generate retry payment URL (Stripe session URL is not reusable, so frontend should create a new session)
                        // For now, link back to frontend cart or payment page
                        const retryUrl = `http://localhost:5173/cart?retryOrder=${orderId}`;
                        await emailService.sendPaymentFailed({
                            orderId: order.id,
                            customerName: order.customer_name || 'Customer',
                            customerEmail: order.customer_email
                        }, retryUrl);
                    }
                }
            } catch (failEmailErr) {
                console.error('Failed to send payment failed email:', failEmailErr);
            }
            return res.json({
                success: false,
                payment_status: session.payment_status,
                message: 'Payment not completed yet'
            });
        }
    } catch (err) {
        console.error('Verify session error:', err);
        next(err);
    }
});

module.exports = router;
