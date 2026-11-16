require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function main() {
  const sqlPath = path.join(__dirname, 'tp3.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  try {
    await connection.query(sql);

    const dbName = process.env.DB_NAME || 'tp3_vehiculos';
    const [tablas] = await connection.query('SHOW TABLES FROM ??', [dbName]);
    console.log('Base de datos y tablas creadas correctamente:');
    tablas.forEach((fila) => console.log(`  - ${Object.values(fila)[0]}`));
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error('Error al ejecutar db/tp3.sql:', error.message);
  process.exitCode = 1;
});
