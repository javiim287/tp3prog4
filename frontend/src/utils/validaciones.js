// Validaciones del lado del cliente (Módulo 7).
// Espejan las reglas de express-validator del backend (backend/src/validators/)
// para avisar al usuario antes de enviar datos inválidos; el backend revalida
// todo igualmente. Cada validador devuelve un objeto { campo: mensaje } vacío
// cuando los datos son correctos.

const PATENTE_REGEX = /^([A-Z]{3}[0-9]{3}|[A-Z]{2}[0-9]{3}[A-Z]{2})$/;
const DOCUMENTO_REGEX = /^[0-9]{6,20}$/;
const LICENCIA_REGEX = /^[A-Z0-9.-]{4,20}$/;
const SOLO_LETRAS_REGEX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/;
const FECHA_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const FECHA_HORA_REGEX = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

// Fecha DATE en formato YYYY-MM-DD (el input type="date" ya la entrega así).
export const esFechaISO = (valor) =>
  typeof valor === 'string' &&
  FECHA_REGEX.test(valor) &&
  !Number.isNaN(new Date(`${valor}T00:00:00`).getTime());

// Fecha y hora en el formato que espera el backend: "YYYY-MM-DD HH:MM:SS".
export const esFechaHora = (valor) =>
  typeof valor === 'string' &&
  FECHA_HORA_REGEX.test(valor) &&
  !Number.isNaN(new Date(valor.replace(' ', 'T')).getTime());

// Convierte el valor de un input datetime-local ("YYYY-MM-DDTHH:mm") al
// formato del backend ("YYYY-MM-DD HH:MM:SS").
export const aFechaHora = (valor) => (valor ? `${valor.replace('T', ' ')}:00` : '');

// Recorta una fecha "YYYY-MM-DD HH:MM:SS" para mostrarla en tablas.
export const formatearFechaHora = (valor) =>
  valor ? String(valor).replace('T', ' ').slice(0, 16) : '';

// Convierte un texto a número tolerando la coma decimal; devuelve NaN si no es
// un número válido.
export const aNumero = (valor) => {
  if (typeof valor === 'number') return valor;
  const texto = String(valor ?? '').trim().replace(',', '.');
  if (texto === '') return NaN;
  return Number(texto);
};

/* ---------- Vehículos ---------- */

export function validarVehiculo(valores) {
  const errores = {};

  const marca = String(valores.marca ?? '').trim();
  if (!marca) errores.marca = 'La marca es obligatoria.';
  else if (marca.length < 2 || marca.length > 50)
    errores.marca = 'La marca debe tener entre 2 y 50 caracteres.';

  const modelo = String(valores.modelo ?? '').trim();
  if (!modelo) errores.modelo = 'El modelo es obligatorio.';
  else if (modelo.length > 50) errores.modelo = 'El modelo no puede superar los 50 caracteres.';

  const patente = String(valores.patente ?? '').trim().toUpperCase();
  if (!patente) errores.patente = 'La patente es obligatoria.';
  else if (!PATENTE_REGEX.test(patente))
    errores.patente = 'La patente debe tener el formato ABC123 o AB123CD.';

  const anio = aNumero(valores.anio);
  if (String(valores.anio ?? '').trim() === '' || !Number.isInteger(anio))
    errores.anio = 'El año es obligatorio y debe ser un número entero.';
  else if (anio < 1900 || anio > 2100) errores.anio = 'El año debe estar entre 1900 y 2100.';

  const capacidad = aNumero(valores.capacidad_carga);
  if (String(valores.capacidad_carga ?? '').trim() === '' || Number.isNaN(capacidad))
    errores.capacidad_carga = 'La capacidad de carga es obligatoria.';
  else if (capacidad <= 0 || capacidad >= 1000000)
    errores.capacidad_carga = 'La capacidad debe ser mayor a 0 y menor a 1.000.000 (kg).';

  return errores;
}

/* ---------- Conductores ---------- */

export function validarConductor(valores) {
  const errores = {};

  const nombre = String(valores.nombre ?? '').trim();
  if (!nombre) errores.nombre = 'El nombre es obligatorio.';
  else if (nombre.length < 2 || nombre.length > 100)
    errores.nombre = 'El nombre debe tener entre 2 y 100 caracteres.';
  else if (!SOLO_LETRAS_REGEX.test(nombre))
    errores.nombre = 'El nombre solo admite letras, espacios y guiones.';

  const apellido = String(valores.apellido ?? '').trim();
  if (!apellido) errores.apellido = 'El apellido es obligatorio.';
  else if (apellido.length < 2 || apellido.length > 100)
    errores.apellido = 'El apellido debe tener entre 2 y 100 caracteres.';
  else if (!SOLO_LETRAS_REGEX.test(apellido))
    errores.apellido = 'El apellido solo admite letras, espacios y guiones.';

  const documento = String(valores.numero_documento ?? '').trim();
  if (!documento) errores.numero_documento = 'El número de documento es obligatorio.';
  else if (!DOCUMENTO_REGEX.test(documento))
    errores.numero_documento = 'El número de documento debe tener entre 6 y 20 dígitos.';

  const licencia = String(valores.numero_licencia ?? '').trim().toUpperCase();
  if (!licencia) errores.numero_licencia = 'El número de licencia es obligatorio.';
  else if (!LICENCIA_REGEX.test(licencia))
    errores.numero_licencia =
      'El número de licencia debe tener entre 4 y 20 caracteres alfanuméricos.';

  if (!esFechaISO(valores.fecha_alta_licencia))
    errores.fecha_alta_licencia = 'La fecha de alta de la licencia es obligatoria.';

  if (!esFechaISO(valores.fecha_vencimiento_licencia)) {
    errores.fecha_vencimiento_licencia =
      'La fecha de vencimiento de la licencia es obligatoria.';
  } else if (
    esFechaISO(valores.fecha_alta_licencia) &&
    new Date(`${valores.fecha_vencimiento_licencia}T00:00:00`) <
      new Date(`${valores.fecha_alta_licencia}T00:00:00`)
  ) {
    errores.fecha_vencimiento_licencia =
      'La fecha de vencimiento debe ser posterior o igual a la de alta.';
  }

  return errores;
}

/* ---------- Viajes ---------- */

export function validarViaje(valores) {
  const errores = {};

  if (!valores.vehiculo_id) errores.vehiculo_id = 'Debe seleccionar un vehículo.';
  if (!valores.conductor_id) errores.conductor_id = 'Debe seleccionar un conductor.';

  const salida = aFechaHora(valores.fecha_salida);
  if (!valores.fecha_salida || !esFechaHora(salida))
    errores.fecha_salida = 'La fecha de salida es obligatoria.';

  const llegada = aFechaHora(valores.fecha_llegada);
  if (!valores.fecha_llegada || !esFechaHora(llegada)) {
    errores.fecha_llegada = 'La fecha de llegada es obligatoria.';
  } else if (esFechaHora(salida) && new Date(llegada.replace(' ', 'T')) < new Date(salida.replace(' ', 'T'))) {
    errores.fecha_llegada = 'La fecha de llegada debe ser posterior o igual a la de salida.';
  }

  const origen = String(valores.origen ?? '').trim();
  if (!origen) errores.origen = 'El origen es obligatorio.';
  else if (origen.length < 2 || origen.length > 150)
    errores.origen = 'El origen debe tener entre 2 y 150 caracteres.';

  const destino = String(valores.destino ?? '').trim();
  if (!destino) errores.destino = 'El destino es obligatorio.';
  else if (destino.length < 2 || destino.length > 150)
    errores.destino = 'El destino debe tener entre 2 y 150 caracteres.';

  const kilometros = aNumero(valores.kilometros);
  if (String(valores.kilometros ?? '').trim() === '' || Number.isNaN(kilometros))
    errores.kilometros = 'Los kilómetros son obligatorios.';
  else if (kilometros <= 0 || kilometros >= 100000000)
    errores.kilometros = 'Los kilómetros deben ser un número mayor a 0.';

  const observaciones = String(valores.observaciones ?? '').trim();
  if (observaciones.length > 5000)
    errores.observaciones = 'Las observaciones no pueden superar los 5000 caracteres.';

  return errores;
}

// Convierte los errores del backend ([{ campo, mensaje }]) en el mismo formato
// { campo: mensaje } que usan las validaciones locales.
export function erroresPorCampo(erroresApi = []) {
  const porCampo = {};
  for (const e of erroresApi) {
    if (e?.campo && !porCampo[e.campo]) porCampo[e.campo] = e.mensaje;
  }
  return porCampo;
}
