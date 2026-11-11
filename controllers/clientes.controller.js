const pool = require('../db/pool');

// GET /clientes
const getAll = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM clientes ORDER BY id'
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// GET /clientes/:id
const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      'SELECT * FROM clientes WHERE id = $1', [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// POST /clientes
const create = async (req, res, next) => {
  try {
    const { nombre, email, telefono, direccion } = req.body;

    if (!nombre || !email) {
      return res.status(400).json({ error: 'nombre y email son obligatorios' });
    }

    const { rows } = await pool.query(
      `INSERT INTO clientes (nombre, email, telefono, direccion)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [nombre, email, telefono || null, direccion || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }
    next(err);
  }
};

// PUT /clientes/:id
const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, email, telefono, direccion } = req.body;

    if (!nombre || !email) {
      return res.status(400).json({ error: 'nombre y email son obligatorios' });
    }

    const { rows, rowCount } = await pool.query(
      `UPDATE clientes
       SET nombre = $1, email = $2, telefono = $3, direccion = $4
       WHERE id = $5
       RETURNING *`,
      [nombre, email, telefono || null, direccion || null, id]
    );
    if (rowCount === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }
    next(err);
  }
};

// DELETE /clientes/:id
const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rowCount } = await pool.query(
      'DELETE FROM clientes WHERE id = $1', [id]
    );
    if (rowCount === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json({ message: 'Cliente eliminado' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, create, update, remove };

