
const { validationResult, param, query } = require('express-validator');

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

function validarIdParam(nombre = 'id') {
  return param(nombre)
    .isInt({ min: 1, max: 4294967295 })
    .withMessage(`${nombre} debe ser un número entero positivo.`)
    .toInt();
}

function validarQueryIdOpcional(nombre) {
  return query(nombre)
    .optional({ values: 'falsy' })
    .isInt({ min: 1, max: 4294967295 })
    .withMessage(`${nombre} debe ser un número entero positivo.`)
    .toInt();
}

module.exports = { validar, validarIdParam, validarQueryIdOpcional };
