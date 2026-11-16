const app = require('./app');
const { verificarConexion } = require('./config/db');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en http://localhost:${PORT}`);

  verificarConexion()
    .then(() => console.log('Conexión a MySQL verificada.'))
    .catch(() =>
      console.warn('MySQL sin conexión: revisá las variables DB_* del archivo .env.')
    );
});
