
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
      return done(null, cuentas[0]);
    } catch (error) {
      return done(error);
    }
  })
);

module.exports = passport;
