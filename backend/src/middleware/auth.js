// Middleware de autenticación (Módulo 5): protege las rutas con Passport JWT.
// Responde 401 con JSON consistente cuando falta el token o es inválido/expirado,
// y expone el usuario autenticado como req.user para los controladores.

const passport = require('../config/passport');

// Detecta si la petición traía un token para diferenciar el mensaje de error
// (sin token vs. token inválido), sin filtrar detalles de la firma.
function traeBearer(req) {
  const cabecera = req.headers.authorization || '';
  return cabecera.startsWith('Bearer ') && cabecera.length > 7;
}

function requerirAuth(req, res, next) {
  passport.authenticate('jwt', { session: false }, (error, usuario) => {
    if (error) {
      return next(error);
    }
    if (!usuario) {
      return res.status(401).json({
        ok: false,
        mensaje: traeBearer(req)
          ? 'Token inválido o expirado. Iniciá sesión nuevamente.'
          : 'Acceso no autorizado: iniciá sesión para obtener un token.',
      });
    }
    req.user = usuario;
    return next();
  })(req, res, next);
}

module.exports = { requerirAuth };
