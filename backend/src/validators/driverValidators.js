// Validaciones de conductores (express-validator).
// Alineadas con la tabla conductor (backend/db/tp3.sql):
// nombre/apellido VARCHAR(100), documento y licencia VARCHAR(20) únicos,
// fechas de licencia DATE con vencimiento >= alta.

const { body } = require('express-validator');

// DNI argentino y documentos similares: solo dígitos (6 a 20 por el VARCHAR).
const DOCUMENTO_REGEX = /^[0-9]{6,20}$/;

// Número de licencia: letras, dígitos, guiones y puntos (4 a 20 caracteres),
// formato compatible con licencias del tipo "LIC-1001".
const LICENCIA_REGEX = /^[A-Za-z0-9.-]{4,20}$/;

// Solo letras (incluye acentos y ñ), espacios y guiones.
const SOLO_LETRAS_REGEX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/;

// Fecha en formato estricto YYYY-MM-DD (isISO8601 solo acepta { strict: true }).
const FECHA_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const esFechaISO = (valor) =>
  typeof valor === 'string' &&
  FECHA_REGEX.test(valor) &&
  !Number.isNaN(new Date(`${valor}T00:00:00`).getTime());

const crearOActualizar = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio.')
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres.')
    .matches(SOLO_LETRAS_REGEX).withMessage('El nombre solo admite letras, espacios y guiones.'),
  body('apellido')
    .trim()
    .notEmpty().withMessage('El apellido es obligatorio.')
    .isLength({ min: 2, max: 100 }).withMessage('El apellido debe tener entre 2 y 100 caracteres.')
    .matches(SOLO_LETRAS_REGEX).withMessage('El apellido solo admite letras, espacios y guiones.'),
  body('numero_documento')
    .trim()
    .notEmpty().withMessage('El número de documento es obligatorio.')
    .matches(DOCUMENTO_REGEX).withMessage('El número de documento debe tener entre 6 y 20 dígitos.'),
  body('numero_licencia')
    .trim()
    .toUpperCase()
    .notEmpty().withMessage('El número de licencia es obligatorio.')
    .matches(LICENCIA_REGEX)
    .withMessage('El número de licencia debe tener entre 4 y 20 caracteres alfanuméricos.'),
  body('fecha_alta_licencia')
    .notEmpty().withMessage('La fecha de alta de la licencia es obligatoria.')
    .custom(esFechaISO).withMessage('La fecha de alta debe tener el formato YYYY-MM-DD.'),
  body('fecha_vencimiento_licencia')
    .notEmpty().withMessage('La fecha de vencimiento de la licencia es obligatoria.')
    .custom(esFechaISO).withMessage('La fecha de vencimiento debe tener el formato YYYY-MM-DD.')
    .custom((valor, { req }) => {
      if (!esFechaISO(req.body.fecha_alta_licencia) || !esFechaISO(valor)) {
        return true; // el formato ya se reporta en su propio error
      }
      return new Date(`${valor}T00:00:00`) >= new Date(`${req.body.fecha_alta_licencia}T00:00:00`);
    })
    .withMessage('La fecha de vencimiento debe ser posterior o igual a la de alta.'),
];

const crear = [...crearOActualizar];
const actualizar = [...crearOActualizar];

module.exports = { crear, actualizar };
