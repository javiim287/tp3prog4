// Controlador de vehículos: CRUD sobre la tabla vehiculo.
// El formato y los rangos se validan en las rutas con express-validator
// (backend/src/validators/vehicleValidators.js); acá quedan los controles
// que requieren consultar la base: patente duplicada y existencia.
const pool = require('../config/db');
const { HttpError, asyncHandler } = require('../middleware/errorHandler');

// GET /api/vehiculos
const listar = asyncHandler(async (_req, res) => {
  const [filas] = await pool.query('SELECT * FROM vehiculo ORDER BY id');
  res.json({ ok: true, datos: filas });
});

// GET /api/vehiculos/:id
const obtener = asyncHandler(async (req, res) => {
  const [filas] = await pool.query('SELECT * FROM vehiculo WHERE id = ?', [req.params.id]);
  if (filas.length === 0) {
    throw new HttpError(404, 'Vehículo no encontrado.');
  }
  res.json({ ok: true, datos: filas[0] });
});

// POST /api/vehiculos
const crear = asyncHandler(async (req, res) => {
  const { marca, modelo, patente, anio, capacidad_carga } = req.body;

  // Control previo de patente duplicada para dar un mensaje claro (409).
  const [duplicada] = await pool.query('SELECT id FROM vehiculo WHERE patente = ?', [patente]);
  if (duplicada.length > 0) {
    throw new HttpError(409, 'Ya existe un vehículo con esa patente.');
  }

  const [resultado] = await pool.query(
    'INSERT INTO vehiculo (marca, modelo, patente, anio, capacidad_carga) VALUES (?, ?, ?, ?, ?)',
    [marca, modelo, patente, anio, capacidad_carga]
  );

  const [creado] = await pool.query('SELECT * FROM vehiculo WHERE id = ?', [resultado.insertId]);
  res.status(201).json({ ok: true, mensaje: 'Vehículo creado.', datos: creado[0] });
});

// PUT /api/vehiculos/:id
const actualizar = asyncHandler(async (req, res) => {
  const [existentes] = await pool.query('SELECT id FROM vehiculo WHERE id = ?', [req.params.id]);
  if (existentes.length === 0) {
    throw new HttpError(404, 'Vehículo no encontrado.');
  }

  const { marca, modelo, patente, anio, capacidad_carga } = req.body;

  const [duplicada] = await pool.query(
    'SELECT id FROM vehiculo WHERE patente = ? AND id <> ?',
    [patente, req.params.id]
  );
  if (duplicada.length > 0) {
    throw new HttpError(409, 'Ya existe otro vehículo con esa patente.');
  }

  await pool.query(
    'UPDATE vehiculo SET marca = ?, modelo = ?, patente = ?, anio = ?, capacidad_carga = ? WHERE id = ?',
    [marca, modelo, patente, anio, capacidad_carga, req.params.id]
  );

  const [actualizado] = await pool.query('SELECT * FROM vehiculo WHERE id = ?', [req.params.id]);
  res.json({ ok: true, mensaje: 'Vehículo actualizado.', datos: actualizado[0] });
});

// DELETE /api/vehiculos/:id
// Si el vehículo tiene viajes asociados la FK (ON DELETE RESTRICT) lo impide
// y el middleware central responde 409.
const eliminar = asyncHandler(async (req, res) => {
  const [existentes] = await pool.query('SELECT id FROM vehiculo WHERE id = ?', [req.params.id]);
  if (existentes.length === 0) {
    throw new HttpError(404, 'Vehículo no encontrado.');
  }

  await pool.query('DELETE FROM vehiculo WHERE id = ?', [req.params.id]);
  res.json({ ok: true, mensaje: 'Vehículo eliminado.' });
});

module.exports = { listar, obtener, crear, actualizar, eliminar };
