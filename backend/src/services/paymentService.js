require('dotenv').config();
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.createCheckoutSession = async (items = [], successUrl, cancelUrl, metadata = {}) => {
    // items: [{ title, price, quantity }]
    const line_items = items.map((it) => ({
        price_data: {
            currency: 'thb', // เปลี่ยนสกุลเงินเป็นบาท
            product_data: { name: it.title || it.name },
            unit_amount: Math.round(Number(it.price) * 100)
        },
        quantity: it.quantity || 1
    }));

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items,
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata,
        //     payment_intent_data: {
        //         payment_method_options: {
        //             promptpay: {
        //                 setup_future_usage: 'off'
        //             }
        //         }
        //     }
        //     // currency: 'thb' // เปลี่ยนสกุลเงินเป็นบาท
    });

    return session;
};
