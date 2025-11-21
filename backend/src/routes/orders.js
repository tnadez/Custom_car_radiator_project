const express = require('express');
const router = express.Router();
const orderService = require('../services/orderService');

// List orders
router.get('/', async (req, res, next) => {
    try {
        const orders = await orderService.listOrders();
        res.json(orders);
    } catch (err) {
        next(err);
    }
});

// Get order
router.get('/:id', async (req, res, next) => {
    try {
        const order = await orderService.getOrder(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
