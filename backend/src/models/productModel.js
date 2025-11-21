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
        'INSERT INTO products(name, price, description) VALUES($1, $2, $3) RETURNING *',
        [product.name, product.price, product.description]
    );
    return res.rows[0];
};

exports.update = async (id, data) => {
    const current = await exports.findById(id);
    if (!current) return null;
    const name = data.name != null ? data.name : current.name;
    const price = data.price != null ? Number(data.price) : current.price;
    const description = data.description != null ? data.description : current.description;
    const res = await pool.query(
        'UPDATE products SET name=$1, price=$2, description=$3 WHERE id=$4 RETURNING *',
        [name, price, description, id]
    );
    return res.rows[0];
};

exports.remove = async (id) => {
    const res = await pool.query('DELETE FROM products WHERE id = $1', [id]);
    return res.rowCount > 0;
};
