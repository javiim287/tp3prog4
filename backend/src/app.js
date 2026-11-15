require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { verificarConexion } = require('./config/db');

// App principal de Express. Las rutas de cada entidad se montan acá
// a medida que se implementan (vehículos, conductores, viajes, usuarios).
const app = express();

// Middleware de base
app.use(cors());
app.use(express.json());

// Ruta de prueba: verifica que el backend está corriendo y que MySQL responde
app.get('/api/health', async (_req, res) => {
  try {
    await verificarConexion();
    res.json({ ok: true, mensaje: 'Backend del TP3 funcionando', base_datos: 'conectada' });
  } catch (_error) {
    // El backend sigue levantado aunque MySQL no responda
    res.json({ ok: true, mensaje: 'Backend del TP3 funcionando', base_datos: 'sin conexión' });
  }
});

// Rutas de la API (una por entidad)
app.use('/api/usuarios', require('./routes/users'));
app.use('/api/vehiculos', require('./routes/vehicles'));
app.use('/api/conductores', require('./routes/drivers'));
app.use('/api/viajes', require('./routes/trips'));

// 404 para rutas de la API que no existen
app.use('/api', require('./middleware/errorHandler').notFoundHandler);

// Manejo central de errores: responde JSON con el código HTTP correcto
app.use(require('./middleware/errorHandler').errorHandler);

module.exports = app;
