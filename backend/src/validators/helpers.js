// Validaciones con express-validator (Módulo 4).
// Este archivo centraliza el middleware que revisa el resultado de las
// cadenas de validación y la regla común para los parámetros :id.

const { validationResult, param, query } = require('express-validator');

// Middleware que se coloca después de una cadena de validación.
// Si hay errores responde 400 con un JSON consistente con el resto de la API:
// { ok: false, mensaje, errores: [{ campo, mensaje }] }
function validar(req, res, next) {
  const resultado = validationResult(req);
  if (resultado.isEmpty()) {
    return next();
  }

  const errores = resultado.array().map((error) => ({
    campo: error.path,
    mensaje: error.msg,
  }));

  return res.status(400).json({
    ok: false,
    mensaje: 'Datos inválidos: revisá los campos marcados.',
    errores,
  });
}

// Regla para parámetros numéricos de ruta: /:id, /:vehiculoId, /:conductorId.
// Convierte el valor a entero para que el controlador lo use directamente.
function validarIdParam(nombre = 'id') {
  return param(nombre)
    .isInt({ min: 1, max: 4294967295 })
    .withMessage(`${nombre} debe ser un número entero positivo.`)
    .toInt();
}

// Regla para los filtros numéricos opcionales de la query (?vehiculoId=...).
function validarQueryIdOpcional(nombre) {
  return query(nombre)
    .optional({ values: 'falsy' })
    .isInt({ min: 1, max: 4294967295 })
    .withMessage(`${nombre} debe ser un número entero positivo.`)
    .toInt();
}

module.exports = { validar, validarIdParam, validarQueryIdOpcional };
