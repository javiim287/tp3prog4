// Emisión y utilidades del JWT (Módulo 5).
// El token se firma con HS256 y expira según JWT_EXPIRES_IN (4 h por defecto).
// El payload es mínimo (id, email, sub): nada de datos sensibles como la
// contraseña ni su hash.

const jwt = require('jsonwebtoken');

// Falla temprano si falta la clave: sin ella no se puede firmar ni verificar.
function asegurarClave() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET no está configurado en el archivo .env.');
  }
}

// Firma un token de acceso para el usuario (usado en el login).
function emitirToken(usuario) {
  asegurarClave();
  return jwt.sign({ id: usuario.id, email: usuario.email }, process.env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: process.env.JWT_EXPIRES_IN || '4h',
    subject: String(usuario.id),
  });
}

// Verifica un token y devuelve su payload, o null si es inválido/expirado.
// Lo usa la estrategia de Passport para el mismo fin.
function verificarToken(token) {
  try {
    asegurarClave();
    return jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
  } catch (_error) {
    // Token malformado, firma inválida o expirado: mismo tratamiento (no válido).
    return null;
  }
}

module.exports = { emitirToken, verificarToken };
