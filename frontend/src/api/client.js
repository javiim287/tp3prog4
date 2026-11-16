// Cliente de comunicación con el backend mediante fetch (API REST JSON).
// Envía el JWT guardado en localStorage en las rutas protegidas y, si el
// backend responde 401 (token ausente, inválido o vencido), limpia la sesión
// y avisa a la aplicación para redirigir al login.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const TOKEN_KEY = 'tp3_token';
const USUARIO_KEY = 'tp3_usuario';

// Evento global que dispara el cliente cuando la sesión deja de ser válida.
export const EVENTO_SESION_EXPIRADA = 'tp3:sesion-expirada';

export class ApiError extends Error {
  constructor(mensaje, estado, errores = []) {
    super(mensaje);
    this.name = 'ApiError';
    this.mensaje = mensaje; // mensaje en español del backend (o de red)
    this.estado = estado; // código HTTP (400, 401, 404, 409, 500...)
    this.errores = errores; // [{ campo, mensaje }] cuando la validación falla
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

// Guarda el token y los datos del usuario después del login.
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

// Función central de pedidos al backend.
// - ruta: ejemplo '/vehiculos' (sin el /api inicial).
// - metodo: GET | POST | PUT | DELETE.
// - cuerpo: objeto que se serializa a JSON (undefined en GET/DELETE).
// - autenticado: si es true se agrega el header Authorization con el JWT.
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
    // Respuesta sin cuerpo JSON (no debería pasar con esta API).
  }

  if (!respuesta.ok) {
    // 401 en una ruta protegida = sesión inexistente o expirada (el token
    // vence a las 4 h): se limpia y se avisa para redirigir al login.
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
