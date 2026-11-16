const pool = require('../config/db');
const { HttpError, asyncHandler } = require('../middleware/errorHandler');

async function validarReferencias(body) {
  const [vehiculo] = await pool.query('SELECT id FROM vehiculo WHERE id = ?', [body.vehiculo_id]);
  if (vehiculo.length === 0) {
    throw new HttpError(400, `El vehículo ${body.vehiculo_id} no existe.`);
  }

  const [conductor] = await pool.query('SELECT id FROM conductor WHERE id = ?', [body.conductor_id]);
  if (conductor.length === 0) {
    throw new HttpError(400, `El conductor ${body.conductor_id} no existe.`);
  }
}

const SELECT_CON_DETALLE = `
  SELECT viaje.*,
         vehiculo.marca, vehiculo.modelo, vehiculo.patente,
         CONCAT(conductor.nombre, ' ', conductor.apellido) AS conductor_nombre
    FROM viaje
    JOIN vehiculo ON vehiculo.id = viaje.vehiculo_id
    JOIN conductor ON conductor.id = viaje.conductor_id`;

const listar = asyncHandler(async (req, res) => {
  const condiciones = [];
  const valores = [];

  if (req.query.vehiculoId !== undefined) {
    condiciones.push('viaje.vehiculo_id = ?');
    valores.push(req.query.vehiculoId);
  }
  if (req.query.conductorId !== undefined) {
    condiciones.push('viaje.conductor_id = ?');
    valores.push(req.query.conductorId);
  }

  const where = condiciones.length > 0 ? ` WHERE ${condiciones.join(' AND ')}` : '';
  const [filas] = await pool.query(`${SELECT_CON_DETALLE}${where} ORDER BY viaje.fecha_salida DESC`, valores);
  res.json({ ok: true, datos: filas });
});

const obtener = asyncHandler(async (req, res) => {
  const [filas] = await pool.query(`${SELECT_CON_DETALLE} WHERE viaje.id = ?`, [req.params.id]);
  if (filas.length === 0) {
    throw new HttpError(404, 'Viaje no encontrado.');
  }
  res.json({ ok: true, datos: filas[0] });
});

const crear = asyncHandler(async (req, res) => {
  await validarReferencias(req.body);
  const {
    vehiculo_id,
    conductor_id,
    fecha_salida,
    fecha_llegada,
    origen,
    destino,
    kilometros,
    observaciones,
  } = req.body;

  const [resultado] = await pool.query(
    `INSERT INTO viaje
      (vehiculo_id, conductor_id, fecha_salida, fecha_llegada, origen, destino, kilometros, observaciones)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      vehiculo_id,
      conductor_id,
      fecha_salida,
      fecha_llegada,
      origen,
      destino,
      kilometros,
      observaciones || null,
    ]
  );

  const [creado] = await pool.query(`${SELECT_CON_DETALLE} WHERE viaje.id = ?`, [resultado.insertId]);
  res.status(201).json({ ok: true, mensaje: 'Viaje registrado.', datos: creado[0] });
});

const historialPorVehiculo = asyncHandler(async (req, res) => {
  const [vehiculo] = await pool.query('SELECT * FROM vehiculo WHERE id = ?', [req.params.vehiculoId]);
  if (vehiculo.length === 0) {
    throw new HttpError(404, 'Vehículo no encontrado.');
  }

  const [filas] = await pool.query(
    `${SELECT_CON_DETALLE} WHERE viaje.vehiculo_id = ? ORDER BY viaje.fecha_salida DESC`,
    [req.params.vehiculoId]
  );
  res.json({ ok: true, datos: { vehiculo: vehiculo[0], viajes: filas } });
});

const historialPorConductor = asyncHandler(async (req, res) => {
  const [conductor] = await pool.query('SELECT * FROM conductor WHERE id = ?', [req.params.conductorId]);
  if (conductor.length === 0) {
    throw new HttpError(404, 'Conductor no encontrado.');
  }

  const [filas] = await pool.query(
    `${SELECT_CON_DETALLE} WHERE viaje.conductor_id = ? ORDER BY viaje.fecha_salida DESC`,
    [req.params.conductorId]
  );
  res.json({ ok: true, datos: { conductor: conductor[0], viajes: filas } });
});

const kilometrosResumen = asyncHandler(async (_req, res) => {
  const [porVehiculo] = await pool.query(
    `SELECT vehiculo.id, vehiculo.marca, vehiculo.modelo, vehiculo.patente,
            COALESCE(SUM(viaje.kilometros), 0) AS kilometros_totales,
            COUNT(viaje.id) AS cantidad_viajes
       FROM vehiculo
       LEFT JOIN viaje ON viaje.vehiculo_id = vehiculo.id
      GROUP BY vehiculo.id
      ORDER BY kilometros_totales DESC`
  );

  const [porConductor] = await pool.query(
    `SELECT conductor.id, CONCAT(conductor.nombre, ' ', conductor.apellido) AS conductor,
            COALESCE(SUM(viaje.kilometros), 0) AS kilometros_totales,
            COUNT(viaje.id) AS cantidad_viajes
       FROM conductor
       LEFT JOIN viaje ON viaje.conductor_id = conductor.id
      GROUP BY conductor.id
      ORDER BY kilometros_totales DESC`
  );

  res.json({ ok: true, datos: { por_vehiculo: porVehiculo, por_conductor: porConductor } });
});

const kilometrosPorVehiculo = asyncHandler(async (req, res) => {
  const [vehiculo] = await pool.query('SELECT * FROM vehiculo WHERE id = ?', [req.params.vehiculoId]);
  if (vehiculo.length === 0) {
    throw new HttpError(404, 'Vehículo no encontrado.');
  }

  const [totales] = await pool.query(
    `SELECT COALESCE(SUM(kilometros), 0) AS kilometros_totales,
            COUNT(*) AS cantidad_viajes
       FROM viaje WHERE vehiculo_id = ?`,
    [req.params.vehiculoId]
  );
  res.json({ ok: true, datos: { vehiculo: vehiculo[0], ...totales[0] } });
});

const kilometrosPorConductor = asyncHandler(async (req, res) => {
  const [conductor] = await pool.query('SELECT * FROM conductor WHERE id = ?', [req.params.conductorId]);
  if (conductor.length === 0) {
    throw new HttpError(404, 'Conductor no encontrado.');
  }

  const [totales] = await pool.query(
    `SELECT COALESCE(SUM(kilometros), 0) AS kilometros_totales,
            COUNT(*) AS cantidad_viajes
       FROM viaje WHERE conductor_id = ?`,
    [req.params.conductorId]
  );
  res.json({ ok: true, datos: { conductor: conductor[0], ...totales[0] } });
});

module.exports = {
  listar,
  obtener,
  crear,
  historialPorVehiculo,
  historialPorConductor,
  kilometrosResumen,
  kilometrosPorVehiculo,
  kilometrosPorConductor,
};
