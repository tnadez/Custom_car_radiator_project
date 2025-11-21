const productModel = require('../models/productModel');

exports.list = async () => await productModel.findAll();

exports.getById = async (id) => await productModel.findById(id);

exports.create = async (data) => {
    const product = {
        name: data.name || 'Unnamed product',
        price: data.price != null ? Number(data.price) : 0,
        description: data.description || ''
    };
    return await productModel.insert(product);
};

exports.update = async (id, data) => await productModel.update(id, data);

exports.remove = async (id) => await productModel.remove(id);
