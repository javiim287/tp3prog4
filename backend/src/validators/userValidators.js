// Validaciones de usuarios (express-validator).
// Alineadas con la tabla usuario (backend/db/tp3.sql):
// nombre VARCHAR(100), email VARCHAR(150) único, contrasena VARCHAR(255)
// donde se guarda SOLO el hash de bcrypt.

const { body } = require('express-validator');

const registrar = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio.')
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres.'),
  body('email')
    .trim()
    .notEmpty().withMessage('El email es obligatorio.')
    .isEmail().withMessage('El email no tiene un formato válido.')
    .normalizeEmail()
    .isLength({ max: 150 }).withMessage('El email no puede superar los 150 caracteres.'),
  // bcrypt solo procesa los primeros 72 bytes: se limita acá para que el
  // límite no cambie silenciosamente el valor del hash.
  body('contrasena')
    .notEmpty().withMessage('La contraseña es obligatoria.')
    .isLength({ min: 8, max: 72 })
    .withMessage('La contraseña debe tener entre 8 y 72 caracteres.'),
];

const iniciarSesion = [
  body('email')
    .trim()
    .notEmpty().withMessage('El email es obligatorio.')
    .isEmail().withMessage('El email no tiene un formato válido.')
    .normalizeEmail(),
  body('contrasena')
    .notEmpty().withMessage('La contraseña es obligatoria.'),
];

module.exports = { registrar, iniciarSesion };
