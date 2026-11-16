
class HttpError extends Error {
  constructor(status, mensaje) {
    super(mensaje);
    this.status = status;
  }
}

function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

function traducirErrorMySQL(error) {
  switch (error.code) {
    case 'ER_DUP_ENTRY':
      return {
        status: 409,
        mensaje:
          'Ya existe un registro con ese valor único (email, patente, documento o licencia duplicado).',
      };
    case 'ER_NO_REFERENCED_ROW_2':
      return {
        status: 400,
        mensaje: 'El registro hace referencia a un vehículo o conductor inexistente.',
      };
    case 'ER_ROW_IS_REFERENCED_2':
      return {
        status: 409,
        mensaje: 'No se puede eliminar: el registro tiene viajes asociados.',
      };
    case 'ER_CHECK_CONSTRAINT_VIOLATED':
      return {
        status: 400,
        mensaje:
          'Algún campo no cumple las reglas de la base de datos (rangos de año, fechas coherentes o valores positivos).',
      };
    case 'ER_BAD_NULL_ERROR':
    case 'ER_DATA_TOO_LONG':
    case 'ER_TRUNCATED_WRONG_VALUE':
      return { status: 400, mensaje: 'Datos inválidos: revisá los valores enviados.' };
    default:
      return null;
  }
}

function errorHandler(error, _req, res, _next) {
  const traducido = traducirErrorMySQL(error);
  if (traducido) {
    return res.status(traducido.status).json({ ok: false, mensaje: traducido.mensaje });
  }

  if (error instanceof HttpError) {
    return res.status(error.status).json({ ok: false, mensaje: error.message });
  }

  console.error('Error no manejado:', error.message);
  return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor.' });
}

function notFoundHandler(_req, res) {
  res.status(404).json({ ok: false, mensaje: 'Ruta no encontrada.' });
}

module.exports = { HttpError, asyncHandler, errorHandler, notFoundHandler };
