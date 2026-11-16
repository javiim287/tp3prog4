const bcrypt = require('bcrypt');
const pool = require('../config/db');
const { HttpError, asyncHandler } = require('../middleware/errorHandler');
const { emitirToken } = require('../utils/jwt');

const BCRYPT_ROUNDS = 10;

const registrar = asyncHandler(async (req, res) => {
  const { nombre, email, contrasena } = req.body;

  const [duplicado] = await pool.query('SELECT id FROM usuario WHERE email = ?', [email]);
  if (duplicado.length > 0) {
    throw new HttpError(409, 'Ya existe una cuenta registrada con ese email.');
  }

  const hash = await bcrypt.hash(contrasena, BCRYPT_ROUNDS);

  const [resultado] = await pool.query(
    'INSERT INTO usuario (nombre, email, contrasena) VALUES (?, ?, ?)',
    [nombre, email, hash]
  );

  res.status(201).json({
    ok: true,
    mensaje: 'Usuario registrado.',
    datos: { id: resultado.insertId, nombre, email },
  });
});

const iniciarSesion = asyncHandler(async (req, res) => {
  const { email, contrasena } = req.body;

  const [cuentas] = await pool.query('SELECT * FROM usuario WHERE email = ?', [email]);
  if (cuentas.length === 0) {
    throw new HttpError(401, 'Credenciales inválidas.');
  }

  const usuario = cuentas[0];
  const coinciden = await bcrypt.compare(contrasena, usuario.contrasena);
  if (!coinciden) {
    throw new HttpError(401, 'Credenciales inválidas.');
  }

  const token = emitirToken(usuario);

  res.json({
    ok: true,
    mensaje: 'Inicio de sesión correcto.',
    datos: {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      token,
      token_expira_en: process.env.JWT_EXPIRES_IN || '4h',
    },
  });
});

module.exports = { registrar, iniciarSesion };
