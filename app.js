require('dotenv').config();
const express = require('express');
const cors = require('cors');

const clientesRoutes    = require('./routes/clientes.routes');
const categoriasRoutes  = require('./routes/categorias.routes');
const productosRoutes   = require('./routes/productos.routes');
const pedidosRoutes     = require('./routes/pedidos.routes');
const reportesRoutes    = require('./routes/reportes.routes');

const app = express();

// ── Middlewares globales ──
app.use(cors());
app.use(express.json());

// ── Rutas ──
app.use('/clientes',   clientesRoutes);
app.use('/categorias', categoriasRoutes);
app.use('/productos',  productosRoutes);
app.use('/pedidos',    pedidosRoutes);
app.use('/reportes',   reportesRoutes);

// ── Ruta raíz ──
app.get('/', (req, res) => {
  res.json({
    message: '🍔 API Fast Food funcionando',
    endpoints: [
      '/clientes',
      '/categorias',
      '/productos',
      '/pedidos',
      '/reportes/mas-vendidos',
    ],
  });
});

// ── Ruta no encontrada ──
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// ── Middleware central de errores ──
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// ── Iniciar servidor ──
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

