// Conexión a MySQL mediante mysql2 (pool de conexiones).
// Los datos de conexión se toman de las variables de entorno definidas en el
// archivo .env (ver .env.example). El esquema se crea ejecutando db/tp3.sql.
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'tp3_vehiculos',
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
  charset: 'utf8mb4_unicode_ci',
  // Las fechas llegan como texto 'YYYY-MM-DD HH:MM:SS', sin conversiones de zona horaria
  dateStrings: true,
  // DECIMAL llega como número de JavaScript (kilómetros, capacidad de carga)
  decimalNumbers: true,
});

// Verifica que el pool pueda obtener una conexión y responder un ping.
// Se usa en el arranque del servidor y en /api/health.
async function verificarConexion() {
  const connection = await pool.getConnection();
  try {
    await connection.ping();
    return true;
  } finally {
    connection.release();
  }
}

module.exports = pool;
module.exports.verificarConexion = verificarConexion;
