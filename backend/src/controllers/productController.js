const productService = require('../services/productService');

exports.listProducts = async (req, res, next) => {
    try {
        const products = await productService.list();
        res.json(products);
    } catch (err) {
        next(err);
    }
};

exports.getProduct = async (req, res, next) => {
    try {
        const product = await productService.getById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (err) {
        next(err);
    }
};

exports.createProduct = async (req, res, next) => {
    try {
        const { name, price, description } = req.body;
        const created = await productService.create({ name, price, description });
        res.status(201).json(created);
    } catch (err) {
        next(err);
    }
};

exports.updateProduct = async (req, res, next) => {
    try {
        const updated = await productService.update(req.params.id, req.body);
        if (!updated) return res.status(404).json({ message: 'Product not found' });
        res.json(updated);
    } catch (err) {
        next(err);
    }
};

exports.deleteProduct = async (req, res, next) => {
    try {
        const removed = await productService.remove(req.params.id);
        if (!removed) return res.status(404).json({ message: 'Product not found' });
        res.status(204).end();
    } catch (err) {
        next(err);
    }
};
