require('dotenv').config();
const express = require('express');
const cors = require('cors');
const productsRouter = require('./src/routes/products');
const checkoutRouter = require('./src/routes/checkout');
const ordersRouter = require('./src/routes/orders');
const webhookRouter = require('./src/routes/webhook');
const errorHandler = require('./src/middleware/errorHandler');
const db = require('./src/config/db');

const app = express();

// CORS configuration
const corsOptions = {
    origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost:5174',
        'http://127.0.0.1:5173'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// JSON parser for normal routes
app.use(express.json());

app.use('/api/products', productsRouter);
app.use('/api/checkout', checkoutRouter);
app.use('/api/orders', ordersRouter);

// Stripe webhook endpoint requires raw body for signature verification
app.use('/webhook', express.raw({ type: 'application/json' }), webhookRouter);

app.get('/', (req, res) => res.send({ ok: true, msg: 'E-commerce example API' }));

// Error handler (must be after routes)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

(async () => {
    try {
        await db.init();
        app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
    } catch (err) {
        console.error('Failed to initialize DB', err);
        process.exit(1);
    }
})();
