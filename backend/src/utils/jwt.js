
const jwt = require('jsonwebtoken');

function asegurarClave() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET no está configurado en el archivo .env.');
  }
}

function emitirToken(usuario) {
  asegurarClave();
  return jwt.sign({ id: usuario.id, email: usuario.email }, process.env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: process.env.JWT_EXPIRES_IN || '4h',
    subject: String(usuario.id),
  });
}

function verificarToken(token) {
  try {
    asegurarClave();
    return jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
  } catch (_error) {
    return null;
  }
}

module.exports = { emitirToken, verificarToken };
