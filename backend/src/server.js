// Punto de entrada del backend
const app = require('./app');
const { verificarConexion } = require('./config/db');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en http://localhost:${PORT}`);

  // Verificación temprana de la conexión a MySQL (no corta el servidor si falla)
  verificarConexion()
    .then(() => console.log('Conexión a MySQL verificada.'))
    .catch(() =>
      console.warn('MySQL sin conexión: revisá las variables DB_* del archivo .env.')
    );
});
