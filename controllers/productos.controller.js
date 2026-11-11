const pool = require('../db/pool');

// GET /productos — con filtro opcional por categoria_id, incluye nombre de categoría
const getAll = async (req, res, next) => {
  try {
    const { categoria_id } = req.query;

    let query = `
      SELECT p.*, c.nombre AS categoria_nombre
      FROM productos p
      JOIN categorias c ON c.id = p.categoria_id
    `;
    const params = [];

    if (categoria_id) {
      query += ' WHERE p.categoria_id = $1';
      params.push(categoria_id);
    }

    query += ' ORDER BY p.id';

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// GET /productos/:id
const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      `SELECT p.*, c.nombre AS categoria_nombre
       FROM productos p
       JOIN categorias c ON c.id = p.categoria_id
       WHERE p.id = $1`,
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// POST /productos
const create = async (req, res, next) => {
  try {
    const { categoria_id, nombre, precio, disponible } = req.body;

    if (!categoria_id || !nombre || precio == null) {
      return res.status(400).json({ error: 'categoria_id, nombre y precio son obligatorios' });
    }
    if (Number(precio) <= 0) {
      return res.status(400).json({ error: 'El precio debe ser mayor a 0' });
    }

    // Verificar que la categoría existe
    const cat = await pool.query('SELECT id FROM categorias WHERE id = $1', [categoria_id]);
    if (cat.rows.length === 0) {
      return res.status(400).json({ error: 'La categoría indicada no existe' });
    }

    const { rows } = await pool.query(
      `INSERT INTO productos (categoria_id, nombre, precio, disponible)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [categoria_id, nombre, precio, disponible !== undefined ? disponible : true]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// PUT /productos/:id
const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { categoria_id, nombre, precio, disponible } = req.body;

    if (!categoria_id || !nombre || precio == null) {
      return res.status(400).json({ error: 'categoria_id, nombre y precio son obligatorios' });
    }
    if (Number(precio) <= 0) {
      return res.status(400).json({ error: 'El precio debe ser mayor a 0' });
    }

    const { rows, rowCount } = await pool.query(
      `UPDATE productos
       SET categoria_id = $1, nombre = $2, precio = $3, disponible = $4
       WHERE id = $5
       RETURNING *`,
      [categoria_id, nombre, precio, disponible !== undefined ? disponible : true, id]
    );
    if (rowCount === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// DELETE /productos/:id
const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rowCount } = await pool.query(
      'DELETE FROM productos WHERE id = $1', [id]
    );
    if (rowCount === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({ message: 'Producto eliminado' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, create, update, remove };

