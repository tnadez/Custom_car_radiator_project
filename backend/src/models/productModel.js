const { pool } = require('../config/db');


exports.findAll = async () => {
    const res = await pool.query('SELECT * FROM products ORDER BY id');
    return res.rows;
};


exports.findById = async (id) => {
    const res = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    return res.rows[0];
};


exports.insert = async (product) => {
    const res = await pool.query(
        `INSERT INTO products
        (product_id, name, price, description, brand, material, quantity, image, specifications)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        RETURNING *`,
        [
            product.product_id || null,
            product.name,
            product.price,
            product.description || '',
            product.brand || '',
            product.material || '',
            product.quantity != null ? Number(product.quantity) : 0,
            product.image || '',
            Array.isArray(product.specifications) ? product.specifications : (product.specifications ? [product.specifications] : [])
        ]
    );
    return res.rows[0];
};


exports.update = async (id, data) => {
    const current = await exports.findById(id);
    if (!current) return null;
    const fields = {
        product_id: data.product_id != null ? data.product_id : current.product_id,
        name: data.name != null ? data.name : current.name,
        price: data.price != null ? Number(data.price) : current.price,
        description: data.description != null ? data.description : current.description,
        brand: data.brand != null ? data.brand : current.brand,
        material: data.material != null ? data.material : current.material,
        quantity: data.quantity != null ? Number(data.quantity) : current.quantity,
        image: data.image != null ? data.image : current.image,
        specifications: data.specifications != null ? data.specifications : current.specifications
    };
    const res = await pool.query(
        `UPDATE products SET
            product_id=$1,
            name=$2,
            price=$3,
            description=$4,
            brand=$5,
            material=$6,
            quantity=$7,
            image=$8,
            specifications=$9
        WHERE id=$10 RETURNING *`,
        [
            fields.product_id,
            fields.name,
            fields.price,
            fields.description,
            fields.brand,
            fields.material,
            fields.quantity,
            fields.image,
            Array.isArray(fields.specifications) ? fields.specifications : (fields.specifications ? [fields.specifications] : []),
            id
        ]
    );
    return res.rows[0];
};

exports.remove = async (id) => {
    const res = await pool.query('DELETE FROM products WHERE id = $1', [id]);
    return res.rowCount > 0;
};

// Decrement product quantity safely within an existing transaction client.
// Returns the updated row { id, quantity } or null if insufficient stock.
exports.decrementQuantity = async (client, productId, qty) => {
    if (!Number.isFinite(Number(qty)) || qty <= 0) return null;
    const res = await client.query(
        'UPDATE products SET quantity = quantity - $2 WHERE id = $1 AND quantity >= $2 RETURNING id, quantity',
        [productId, qty]
    );
    return res.rows[0] || null;
};
