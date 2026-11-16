
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
