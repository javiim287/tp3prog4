const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const TOKEN_KEY = 'tp3_token';
const USUARIO_KEY = 'tp3_usuario';

export const EVENTO_SESION_EXPIRADA = 'tp3:sesion-expirada';

export class ApiError extends Error {
  constructor(mensaje, estado, errores = []) {
    super(mensaje);
    this.name = 'ApiError';
    this.mensaje = mensaje;
    this.estado = estado;
    this.errores = errores;
  }
}

export function obtenerToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function obtenerUsuarioGuardado() {
  try {
    const guardado = localStorage.getItem(USUARIO_KEY);
    return guardado ? JSON.parse(guardado) : null;
  } catch {
    return null;
  }
}

export function guardarSesion(datos) {
  localStorage.setItem(TOKEN_KEY, datos.token);
  localStorage.setItem(
    USUARIO_KEY,
    JSON.stringify({ id: datos.id, nombre: datos.nombre, email: datos.email })
  );
}

export function cerrarSesion() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USUARIO_KEY);
}

export async function pedir(ruta, { metodo = 'GET', cuerpo, autenticado = true } = {}) {
  const cabeceras = {};
  if (cuerpo !== undefined) {
    cabeceras['Content-Type'] = 'application/json';
  }

  const token = obtenerToken();
  if (autenticado && token) {
    cabeceras['Authorization'] = `Bearer ${token}`;
  }

  const respuesta = await fetch(`${API_URL}${ruta}`, {
    method: metodo,
    headers: cabeceras,
    body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
  });

  let datos = null;
  try {
    datos = await respuesta.json();
  } catch {
  }

  if (!respuesta.ok) {
    if (respuesta.status === 401 && autenticado) {
      cerrarSesion();
      window.dispatchEvent(new CustomEvent(EVENTO_SESION_EXPIRADA));
    }
    throw new ApiError(
      datos?.mensaje || 'No se pudo comunicar con el servidor.',
      respuesta.status,
      datos?.errores || []
    );
  }

  return datos;
}
