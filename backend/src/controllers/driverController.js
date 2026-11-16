const pool = require('../config/db');
const { HttpError, asyncHandler } = require('../middleware/errorHandler');

const listar = asyncHandler(async (_req, res) => {
  const [filas] = await pool.query('SELECT * FROM conductor ORDER BY id');
  res.json({ ok: true, datos: filas });
});

const obtener = asyncHandler(async (req, res) => {
  const [filas] = await pool.query('SELECT * FROM conductor WHERE id = ?', [req.params.id]);
  if (filas.length === 0) {
    throw new HttpError(404, 'Conductor no encontrado.');
  }
  res.json({ ok: true, datos: filas[0] });
});

const crear = asyncHandler(async (req, res) => {
  const {
    nombre,
    apellido,
    numero_documento,
    numero_licencia,
    fecha_alta_licencia,
    fecha_vencimiento_licencia,
  } = req.body;

  const [docDuplicado] = await pool.query(
    'SELECT id FROM conductor WHERE numero_documento = ?',
    [numero_documento]
  );
  if (docDuplicado.length > 0) {
    throw new HttpError(409, 'Ya existe un conductor con ese número de documento.');
  }

  const [licenciaDuplicada] = await pool.query(
    'SELECT id FROM conductor WHERE numero_licencia = ?',
    [numero_licencia]
  );
  if (licenciaDuplicada.length > 0) {
    throw new HttpError(409, 'Ya existe un conductor con ese número de licencia.');
  }

  const [resultado] = await pool.query(
    `INSERT INTO conductor
      (nombre, apellido, numero_documento, numero_licencia,
       fecha_alta_licencia, fecha_vencimiento_licencia)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      nombre,
      apellido,
      numero_documento,
      numero_licencia,
      fecha_alta_licencia,
      fecha_vencimiento_licencia,
    ]
  );

  const [creado] = await pool.query('SELECT * FROM conductor WHERE id = ?', [resultado.insertId]);
  res.status(201).json({ ok: true, mensaje: 'Conductor creado.', datos: creado[0] });
});

const actualizar = asyncHandler(async (req, res) => {
  const [existentes] = await pool.query('SELECT id FROM conductor WHERE id = ?', [req.params.id]);
  if (existentes.length === 0) {
    throw new HttpError(404, 'Conductor no encontrado.');
  }

  const {
    nombre,
    apellido,
    numero_documento,
    numero_licencia,
    fecha_alta_licencia,
    fecha_vencimiento_licencia,
  } = req.body;

  const [docDuplicado] = await pool.query(
    'SELECT id FROM conductor WHERE numero_documento = ? AND id <> ?',
    [numero_documento, req.params.id]
  );
  if (docDuplicado.length > 0) {
    throw new HttpError(409, 'Ya existe otro conductor con ese número de documento.');
  }

  const [licenciaDuplicada] = await pool.query(
    'SELECT id FROM conductor WHERE numero_licencia = ? AND id <> ?',
    [numero_licencia, req.params.id]
  );
  if (licenciaDuplicada.length > 0) {
    throw new HttpError(409, 'Ya existe otro conductor con ese número de licencia.');
  }

  await pool.query(
    `UPDATE conductor
       SET nombre = ?, apellido = ?, numero_documento = ?, numero_licencia = ?,
           fecha_alta_licencia = ?, fecha_vencimiento_licencia = ?
     WHERE id = ?`,
    [
      nombre,
      apellido,
      numero_documento,
      numero_licencia,
      fecha_alta_licencia,
      fecha_vencimiento_licencia,
      req.params.id,
    ]
  );

  const [actualizado] = await pool.query('SELECT * FROM conductor WHERE id = ?', [req.params.id]);
  res.json({ ok: true, mensaje: 'Conductor actualizado.', datos: actualizado[0] });
});

const eliminar = asyncHandler(async (req, res) => {
  const [existentes] = await pool.query('SELECT id FROM conductor WHERE id = ?', [req.params.id]);
  if (existentes.length === 0) {
    throw new HttpError(404, 'Conductor no encontrado.');
  }

  await pool.query('DELETE FROM conductor WHERE id = ?', [req.params.id]);
  res.json({ ok: true, mensaje: 'Conductor eliminado.' });
});

module.exports = { listar, obtener, crear, actualizar, eliminar };
