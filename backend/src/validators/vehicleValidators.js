// Validaciones de vehículos (express-validator).
// Formatos y rangos alineados con la tabla vehiculo (backend/db/tp3.sql):
// marca/modelo VARCHAR(50), patente VARCHAR(10), anio SMALLINT 1900-2100,
// capacidad_carga DECIMAL(8,2) en kg.

const { body } = require('express-validator');

// Patentes argentinas: viejo formato ABC123 y nuevo formato AB123CD.
const PATENTE_REGEX = /^([A-Z]{3}[0-9]{3}|[A-Z]{2}[0-9]{3}[A-Z]{2})$/;

// Cadena común para POST (crear) y PUT (actualizar): ambos reciben el objeto
// completo de la entidad.
const crearOActualizar = [
  body('marca')
    .trim()
    .notEmpty().withMessage('La marca es obligatoria.')
    .isLength({ min: 2, max: 50 }).withMessage('La marca debe tener entre 2 y 50 caracteres.'),
  body('modelo')
    .trim()
    .notEmpty().withMessage('El modelo es obligatorio.')
    .isLength({ min: 1, max: 50 }).withMessage('El modelo debe tener entre 1 y 50 caracteres.'),
  body('patente')
    .trim()
    .toUpperCase()
    .notEmpty().withMessage('La patente es obligatoria.')
    .matches(PATENTE_REGEX)
    .withMessage('La patente debe tener el formato ABC123 o AB123CD.')
    .isLength({ max: 10 }).withMessage('La patente no puede superar los 10 caracteres.'),
  body('anio')
    .notEmpty().withMessage('El año es obligatorio.')
    .isInt({ min: 1900, max: 2100 })
    .withMessage('El año debe ser un entero entre 1900 y 2100.')
    .toInt(),
  body('capacidad_carga')
    .notEmpty().withMessage('La capacidad de carga es obligatoria.')
    .isFloat({ min: 0.01, max: 999999.99 })
    .withMessage('La capacidad de carga debe ser un número mayor a 0 y menor a 1.000.000 (kg).')
    .toFloat(),
];

const crear = [...crearOActualizar];
const actualizar = [...crearOActualizar];

module.exports = { crear, actualizar };
