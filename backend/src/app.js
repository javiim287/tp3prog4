require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('./config/passport');
const { verificarConexion } = require('./config/db');

const app = express();

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

app.get('/api/health', async (_req, res) => {
  try {
    await verificarConexion();
    res.json({ ok: true, mensaje: 'Backend del TP3 funcionando', base_datos: 'conectada' });
  } catch (_error) {
    res.json({ ok: true, mensaje: 'Backend del TP3 funcionando', base_datos: 'sin conexión' });
  }
});

app.use('/api/usuarios', require('./routes/users'));
app.use('/api/vehiculos', require('./routes/vehicles'));
app.use('/api/conductores', require('./routes/drivers'));
app.use('/api/viajes', require('./routes/trips'));

app.use('/api', require('./middleware/errorHandler').notFoundHandler);

app.use(require('./middleware/errorHandler').errorHandler);

module.exports = app;
