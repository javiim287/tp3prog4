const pool = require('../config/db');
const { HttpError, asyncHandler } = require('../middleware/errorHandler');

const listar = asyncHandler(async (_req, res) => {
  const [filas] = await pool.query('SELECT * FROM vehiculo ORDER BY id');
  res.json({ ok: true, datos: filas });
});

const obtener = asyncHandler(async (req, res) => {
  const [filas] = await pool.query('SELECT * FROM vehiculo WHERE id = ?', [req.params.id]);
  if (filas.length === 0) {
    throw new HttpError(404, 'Vehículo no encontrado.');
  }
  res.json({ ok: true, datos: filas[0] });
});

const crear = asyncHandler(async (req, res) => {
  const { marca, modelo, patente, anio, capacidad_carga } = req.body;

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

const eliminar = asyncHandler(async (req, res) => {
  const [existentes] = await pool.query('SELECT id FROM vehiculo WHERE id = ?', [req.params.id]);
  if (existentes.length === 0) {
    throw new HttpError(404, 'Vehículo no encontrado.');
  }

  await pool.query('DELETE FROM vehiculo WHERE id = ?', [req.params.id]);
  res.json({ ok: true, mensaje: 'Vehículo eliminado.' });
});

module.exports = { listar, obtener, crear, actualizar, eliminar };
