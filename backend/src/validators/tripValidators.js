// Validaciones de viajes (express-validator).
// Alineadas con la tabla viaje (backend/db/tp3.sql):
// fecha_salida/fecha_llegada DATETIME, origen/destino VARCHAR(150),
// kilometros DECIMAL(10,2), observaciones TEXT opcional.

const { body } = require('express-validator');

// DATETIME en formato YYYY-MM-DD HH:MM:SS.
const FECHA_REGEX = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

const esFechaValida = (valor) =>
  typeof valor === 'string' &&
  FECHA_REGEX.test(valor) &&
  !Number.isNaN(new Date(valor.replace(' ', 'T')).getTime());

const crear = [
  body('vehiculo_id')
    .notEmpty().withMessage('El vehículo es obligatorio.')
    .isInt({ min: 1, max: 4294967295 })
    .withMessage('vehiculo_id debe ser un número entero positivo.')
    .toInt(),
  body('conductor_id')
    .notEmpty().withMessage('El conductor es obligatorio.')
    .isInt({ min: 1, max: 4294967295 })
    .withMessage('conductor_id debe ser un número entero positivo.')
    .toInt(),
  body('fecha_salida')
    .notEmpty().withMessage('La fecha de salida es obligatoria.')
    .custom(esFechaValida)
    .withMessage('La fecha de salida debe tener el formato YYYY-MM-DD HH:MM:SS.'),
  body('fecha_llegada')
    .notEmpty().withMessage('La fecha de llegada es obligatoria.')
    .custom(esFechaValida)
    .withMessage('La fecha de llegada debe tener el formato YYYY-MM-DD HH:MM:SS.')
    .custom((valor, { req }) => {
      if (!esFechaValida(req.body.fecha_salida) || !esFechaValida(valor)) {
        return true; // el formato ya se reporta en su propio error
      }
      return new Date(valor.replace(' ', 'T')) >= new Date(req.body.fecha_salida.replace(' ', 'T'));
    })
    .withMessage('La fecha de llegada debe ser posterior o igual a la de salida.'),
  body('origen')
    .trim()
    .notEmpty().withMessage('El origen es obligatorio.')
    .isLength({ min: 2, max: 150 }).withMessage('El origen debe tener entre 2 y 150 caracteres.'),
  body('destino')
    .trim()
    .notEmpty().withMessage('El destino es obligatorio.')
    .isLength({ min: 2, max: 150 }).withMessage('El destino debe tener entre 2 y 150 caracteres.'),
  body('kilometros')
    .notEmpty().withMessage('Los kilómetros son obligatorios.')
    .isFloat({ min: 0.01, max: 99999999.99 })
    .withMessage('Los kilómetros deben ser un número mayor a 0 (hasta 99.999.999,99).')
    .toFloat(),
  body('observaciones')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 5000 }).withMessage('Las observaciones no pueden superar los 5000 caracteres.'),
];

module.exports = { crear };
