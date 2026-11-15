// Controlador de usuarios: registro e inicio de sesión.
// Las contraseñas se guardan SIEMPRE como hash de bcrypt y nunca se devuelven
// ni se registran en logs. La emisión del JWT y el middleware de Passport se
// implementan en el Módulo 5.
const bcrypt = require('bcrypt');
const pool = require('../config/db');
const { HttpError, asyncHandler } = require('../middleware/errorHandler');

const BCRYPT_ROUNDS = 10;

// POST /api/usuarios/registro
const registrar = asyncHandler(async (req, res) => {
  const { nombre, email, contrasena } = req.body;

  // Control previo de email duplicado para dar un mensaje claro (409).
  const [duplicado] = await pool.query('SELECT id FROM usuario WHERE email = ?', [email]);
  if (duplicado.length > 0) {
    throw new HttpError(409, 'Ya existe una cuenta registrada con ese email.');
  }

  // La contraseña se guarda como hash de bcrypt, nunca en texto plano.
  const hash = await bcrypt.hash(contrasena, BCRYPT_ROUNDS);

  const [resultado] = await pool.query(
    'INSERT INTO usuario (nombre, email, contrasena) VALUES (?, ?, ?)',
    [nombre, email, hash]
  );

  // La respuesta nunca incluye la contraseña (ni en texto plano ni el hash).
  res.status(201).json({
    ok: true,
    mensaje: 'Usuario registrado.',
    datos: { id: resultado.insertId, nombre, email },
  });
});

// POST /api/usuarios/login
const iniciarSesion = asyncHandler(async (req, res) => {
  const { email, contrasena } = req.body;

  const [cuentas] = await pool.query('SELECT * FROM usuario WHERE email = ?', [email]);
  if (cuentas.length === 0) {
    // Mensaje genérico para no revelar si el email existe o no.
    throw new HttpError(401, 'Credenciales inválidas.');
  }

  const usuario = cuentas[0];
  const coinciden = await bcrypt.compare(contrasena, usuario.contrasena);
  if (!coinciden) {
    throw new HttpError(401, 'Credenciales inválidas.');
  }

  // Nota: la emisión del JWT (4 h) se agrega en el Módulo 5.
  res.json({
    ok: true,
    mensaje: 'Inicio de sesión correcto.',
    datos: { id: usuario.id, nombre: usuario.nombre, email: usuario.email },
  });
});

module.exports = { registrar, iniciarSesion };
