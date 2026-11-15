// Configuración de Passport con estrategia JWT (passport-jwt).
// Cada request protegido llega con la cabecera "Authorization: Bearer <token>";
// la estrategia la extrae, verifica firma y expiración con HS256 y busca al
// usuario en la base: si el usuario ya no existe, el token se rechaza aunque
// la firma sea válida. El usuario encontrado queda disponible como req.user.

const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const pool = require('./db');

const opciones = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
  algorithms: ['HS256'],
};

passport.use(
  new JwtStrategy(opciones, async (payload, done) => {
    try {
      const [cuentas] = await pool.query(
        'SELECT id, nombre, email FROM usuario WHERE id = ?',
        [payload.id]
      );
      if (cuentas.length === 0) {
        return done(null, false);
      }
      // Solo datos públicos: nunca el hash de la contraseña.
      return done(null, cuentas[0]);
    } catch (error) {
      return done(error);
    }
  })
);

module.exports = passport;
