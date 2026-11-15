// Controlador de conductores: CRUD sobre la tabla conductor.
// Las validaciones finas se completan con express-validator en el Módulo 4.
const pool = require('../config/db');
const { HttpError, asyncHandler } = require('../middleware/errorHandler');

// Campos obligatorios de la entidad conductor.
const CAMPOS_REQUERIDOS = [
  'nombre',
  'apellido',
  'numero_documento',
  'numero_licencia',
  'fecha_alta_licencia',
  'fecha_vencimiento_licencia',
];

// Control básico de presencia y coherencia de fechas (Módulo 4 agrega formato).
function validarCamposBasicos(body) {
  const faltantes = CAMPOS_REQUERIDOS.filter(
    (campo) => body[campo] === undefined || body[campo] === null || body[campo] === ''
  );
  if (faltantes.length > 0) {
    throw new HttpError(400, `Faltan campos obligatorios: ${faltantes.join(', ')}.`);
  }

  const alta = new Date(body.fecha_alta_licencia);
  const vencimiento = new Date(body.fecha_vencimiento_licencia);
  const fechasValidas = !Number.isNaN(alta.getTime()) && !Number.isNaN(vencimiento.getTime());
  if (!fechasValidas) {
    throw new HttpError(400, 'Las fechas de la licencia deben tener formato YYYY-MM-DD.');
  }
  if (vencimiento < alta) {
    throw new HttpError(400, 'La fecha de vencimiento de la licencia debe ser posterior o igual a la de alta.');
  }
}

// GET /api/conductores
const listar = asyncHandler(async (_req, res) => {
  const [filas] = await pool.query('SELECT * FROM conductor ORDER BY id');
  res.json({ ok: true, datos: filas });
});

// GET /api/conductores/:id
const obtener = asyncHandler(async (req, res) => {
  const [filas] = await pool.query('SELECT * FROM conductor WHERE id = ?', [req.params.id]);
  if (filas.length === 0) {
    throw new HttpError(404, 'Conductor no encontrado.');
  }
  res.json({ ok: true, datos: filas[0] });
});

// POST /api/conductores
const crear = asyncHandler(async (req, res) => {
  validarCamposBasicos(req.body);
  const {
    nombre,
    apellido,
    numero_documento,
    numero_licencia,
    fecha_alta_licencia,
    fecha_vencimiento_licencia,
  } = req.body;

  // Controles previos de unicidad para dar mensajes claros (409).
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

// PUT /api/conductores/:id
const actualizar = asyncHandler(async (req, res) => {
  const [existentes] = await pool.query('SELECT id FROM conductor WHERE id = ?', [req.params.id]);
  if (existentes.length === 0) {
    throw new HttpError(404, 'Conductor no encontrado.');
  }

  validarCamposBasicos(req.body);
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

// DELETE /api/conductores/:id
// Si el conductor tiene viajes asociados la FK (ON DELETE RESTRICT) lo impide
// y el middleware central responde 409.
const eliminar = asyncHandler(async (req, res) => {
  const [existentes] = await pool.query('SELECT id FROM conductor WHERE id = ?', [req.params.id]);
  if (existentes.length === 0) {
    throw new HttpError(404, 'Conductor no encontrado.');
  }

  await pool.query('DELETE FROM conductor WHERE id = ?', [req.params.id]);
  res.json({ ok: true, mensaje: 'Conductor eliminado.' });
});

module.exports = { listar, obtener, crear, actualizar, eliminar };
