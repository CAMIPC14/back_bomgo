const pool = require('../db/pool');

// GET /reportes/mas-vendidos
const masVendidos = async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT pr.id, pr.nombre, SUM(d.cantidad)::int AS total_vendido
      FROM detalle_pedido d
      JOIN productos pr ON pr.id = d.producto_id
      GROUP BY pr.id, pr.nombre
      ORDER BY total_vendido DESC
    `);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

module.exports = { masVendidos };

