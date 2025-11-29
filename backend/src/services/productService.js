const productModel = require('../models/productModel');

exports.list = async () => await productModel.findAll();

exports.getById = async (id) => await productModel.findById(id);


exports.create = async (data) => {
    // Accept all fields for product
    const product = {
        product_id: data.product_id,
        name: data.name || 'Unnamed product',
        price: data.price != null ? Number(data.price) : 0,
        description: data.description || '',
        brand: data.brand || '',
        material: data.material || '',
        quantity: data.quantity != null ? Number(data.quantity) : 0,
        image: data.image || '',
        specifications: Array.isArray(data.specifications) ? data.specifications : (data.specifications ? [data.specifications] : [])
    };
    return await productModel.insert(product);
};

exports.update = async (id, data) => await productModel.update(id, data);

exports.remove = async (id) => await productModel.remove(id);
