const pool = require('../db/pool');

const ESTADOS_VALIDOS = ['pendiente', 'preparando', 'entregado', 'cancelado'];

// GET /pedidos
const getAll = async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT p.*, cl.nombre AS cliente_nombre
      FROM pedidos p
      JOIN clientes cl ON cl.id = p.cliente_id
      ORDER BY p.id DESC
    `);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// GET /pedidos/:id — con detalle completo
const getById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Pedido + cliente
    const pedidoRes = await pool.query(`
      SELECT p.*, cl.nombre AS cliente_nombre, cl.email AS cliente_email,
             cl.telefono AS cliente_telefono, cl.direccion AS cliente_direccion
      FROM pedidos p
      JOIN clientes cl ON cl.id = p.cliente_id
      WHERE p.id = $1
    `, [id]);

    if (pedidoRes.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    // Detalle con productos
    const detalleRes = await pool.query(`
      SELECT d.id, d.producto_id, pr.nombre AS producto_nombre,
             d.cantidad, d.precio_unitario,
             (d.cantidad * d.precio_unitario) AS subtotal
      FROM detalle_pedido d
      JOIN productos pr ON pr.id = d.producto_id
      WHERE d.pedido_id = $1
      ORDER BY d.id
    `, [id]);

    const pedido = pedidoRes.rows[0];
    pedido.items = detalleRes.rows;

    res.json(pedido);
  } catch (err) {
    next(err);
  }
};

// POST /pedidos — transaccional
const create = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { cliente_id, items } = req.body;

    // Validaciones básicas
    if (!cliente_id) {
      return res.status(400).json({ error: 'cliente_id es obligatorio' });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'items debe ser un array con al menos un elemento' });
    }
    for (const item of items) {
      if (!item.producto_id || !item.cantidad || item.cantidad <= 0) {
        return res.status(400).json({ error: 'Cada item debe tener producto_id y cantidad > 0' });
      }
    }

    await client.query('BEGIN');

    // Verificar que el cliente existe
    const clienteRes = await client.query('SELECT id FROM clientes WHERE id = $1', [cliente_id]);
    if (clienteRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'El cliente no existe' });
    }

    // Crear el pedido con total = 0 (se actualiza luego)
    const pedidoRes = await client.query(
      `INSERT INTO pedidos (cliente_id, estado, total)
       VALUES ($1, 'pendiente', 0)
       RETURNING *`,
      [cliente_id]
    );
    const pedido = pedidoRes.rows[0];

    let total = 0;
    const detalles = [];

    for (const item of items) {
      // Obtener producto y verificar disponibilidad
      const prodRes = await client.query(
        'SELECT id, nombre, precio, disponible FROM productos WHERE id = $1',
        [item.producto_id]
      );

      if (prodRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          error: `El producto con id ${item.producto_id} no existe`
        });
      }

      const producto = prodRes.rows[0];
      if (!producto.disponible) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          error: `El producto "${producto.nombre}" no está disponible`
        });
      }

      const precioUnitario = parseFloat(producto.precio);
      const subtotal = precioUnitario * item.cantidad;
      total += subtotal;

      // Insertar detalle
      const detalleRes = await client.query(
        `INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, precio_unitario)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [pedido.id, item.producto_id, item.cantidad, precioUnitario]
      );

      detalles.push({
        ...detalleRes.rows[0],
        producto_nombre: producto.nombre,
        subtotal,
      });
    }

    // Actualizar total del pedido
    await client.query(
      'UPDATE pedidos SET total = $1 WHERE id = $2',
      [total, pedido.id]
    );

    await client.query('COMMIT');

    pedido.total = total.toFixed(2);
    pedido.items = detalles;

    res.status(201).json(pedido);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

// PATCH /pedidos/:id/estado
const updateEstado = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!estado) {
      return res.status(400).json({ error: 'estado es obligatorio' });
    }
    if (!ESTADOS_VALIDOS.includes(estado)) {
      return res.status(400).json({
        error: `estado debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}`
      });
    }

    const { rows, rowCount } = await pool.query(
      'UPDATE pedidos SET estado = $1 WHERE id = $2 RETURNING *',
      [estado, id]
    );

    if (rowCount === 0) return res.status(404).json({ error: 'Pedido no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, create, updateEstado };

