const pool = require('../db/pool');

// GET /categorias
const getAll = async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM categorias ORDER BY id');
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// GET /categorias/:id
const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      'SELECT * FROM categorias WHERE id = $1', [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Categoría no encontrada' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// POST /categorias
const create = async (req, res, next) => {
  try {
    const { nombre } = req.body;
    if (!nombre) return res.status(400).json({ error: 'nombre es obligatorio' });

    const { rows } = await pool.query(
      'INSERT INTO categorias (nombre) VALUES ($1) RETURNING *',
      [nombre]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'La categoría ya existe' });
    }
    next(err);
  }
};

// PUT /categorias/:id
const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;
    if (!nombre) return res.status(400).json({ error: 'nombre es obligatorio' });

    const { rows, rowCount } = await pool.query(
      'UPDATE categorias SET nombre = $1 WHERE id = $2 RETURNING *',
      [nombre, id]
    );
    if (rowCount === 0) return res.status(404).json({ error: 'Categoría no encontrada' });
    res.json(rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'La categoría ya existe' });
    }
    next(err);
  }
};

// DELETE /categorias/:id
const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rowCount } = await pool.query(
      'DELETE FROM categorias WHERE id = $1', [id]
    );
    if (rowCount === 0) return res.status(404).json({ error: 'Categoría no encontrada' });
    res.json({ message: 'Categoría eliminada' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, create, update, remove };

