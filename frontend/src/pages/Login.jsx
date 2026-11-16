import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api/client';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const { iniciarSesion, registrar } = useAuth();
  const navegar = useNavigate();
  const [parametros] = useSearchParams();

  const [modo, setModo] = useState(
    parametros.get('modo') === 'registro' ? 'registro' : 'login'
  );
  const [form, setForm] = useState({ nombre: '', email: '', contrasena: '' });
  const [errores, setErrores] = useState({});
  const [mensajeGeneral, setMensajeGeneral] = useState('');
  const [exito, setExito] = useState('');
  const [enviando, setEnviando] = useState(false);

  function cambiarModo(nuevoModo) {
    setModo(nuevoModo);
    setErrores({});
    setMensajeGeneral('');
    setExito('');
    setForm({ nombre: '', email: '', contrasena: '' });
  }

  function alCambiar(e) {
    const { name, value } = e.target;
    setForm((previo) => ({ ...previo, [name]: value }));
  }

  function validar() {
    const nuevos = {};

    if (modo === 'registro' && form.nombre.trim().length < 3) {
      nuevos.nombre = 'Ingresá tu nombre (mínimo 3 caracteres).';
    }
    if (!form.email.trim()) {
      nuevos.email = 'El email es obligatorio.';
    } else if (!EMAIL_RE.test(form.email.trim())) {
      nuevos.email = 'El formato del email no es válido.';
    }
    if (!form.contrasena) {
      nuevos.contrasena = 'La contraseña es obligatoria.';
    } else if (modo === 'registro' && form.contrasena.length < 8) {
      nuevos.contrasena = 'La contraseña debe tener al menos 8 caracteres.';
    }

    return nuevos;
  }

  async function alEnviar(e) {
    e.preventDefault();
    setMensajeGeneral('');
    setExito('');

    const validaciones = validar();
    setErrores(validaciones);
    if (Object.keys(validaciones).length > 0) return;

    setEnviando(true);
    try {
      if (modo === 'login') {
        await iniciarSesion(form.email.trim(), form.contrasena);
        navegar('/vehiculos');
      } else {
        const respuesta = await registrar(
          form.nombre.trim(),
          form.email.trim(),
          form.contrasena
        );
        setExito(respuesta.mensaje + ' Ahora podés iniciar sesión.');
        setForm({ nombre: '', email: '', contrasena: '' });
        setModo('login');
      }
    } catch (error) {
      if (error instanceof ApiError) {
        setMensajeGeneral(error.message);
        if (error.errores.length > 0) {
          const porCampo = {};
          for (const e of error.errores) porCampo[e.campo] = e.mensaje;
          setErrores(porCampo);
        }
      } else {
        setMensajeGeneral('No se pudo conectar con el servidor. Verificá que esté en ejecución.');
      }
    } finally {
      setEnviando(false);
    }
  }

  const esRegistro = modo === 'registro';

  return (
    <section className="pagina pagina--centrada">
      <div className="panel panel--login">
        <h1>{esRegistro ? 'Crear cuenta' : 'Iniciar sesión'}</h1>
        <p className="panel__bajada">
          {esRegistro
            ? 'Registrate para usar la aplicación de la empresa de transporte.'
            : 'Ingresá con tu cuenta para acceder a la gestión.'}
        </p>

        <div className="pestana" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={!esRegistro}
            className={`pestana__boton ${!esRegistro ? 'pestana__boton--activo' : ''}`}
            onClick={() => cambiarModo('login')}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={esRegistro}
            className={`pestana__boton ${esRegistro ? 'pestana__boton--activo' : ''}`}
            onClick={() => cambiarModo('registro')}
          >
            Crear cuenta
          </button>
        </div>

        <form onSubmit={alEnviar} noValidate>
          {esRegistro && (
            <div className="campo">
              <label htmlFor="nombre">Nombre</label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                value={form.nombre}
                onChange={alCambiar}
                placeholder="Tu nombre completo"
              />
              {errores.nombre && <p className="campo__error">{errores.nombre}</p>}
            </div>
          )}

          <div className="campo">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={alCambiar}
              placeholder="correo@ejemplo.com"
            />
            {errores.email && <p className="campo__error">{errores.email}</p>}
          </div>

          <div className="campo">
            <label htmlFor="contrasena">Contraseña</label>
            <input
              id="contrasena"
              name="contrasena"
              type="password"
              value={form.contrasena}
              onChange={alCambiar}
              placeholder={esRegistro ? 'Mínimo 8 caracteres' : 'Tu contraseña'}
            />
            {errores.contrasena && <p className="campo__error">{errores.contrasena}</p>}
          </div>

          {mensajeGeneral && <p className="aviso aviso--error">{mensajeGeneral}</p>}
          {exito && <p className="aviso aviso--exito">{exito}</p>}

          <button type="submit" className="boton boton--primario boton--ancho" disabled={enviando}>
            {enviando ? 'Enviando…' : esRegistro ? 'Crear cuenta' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="panel__pie">
          <Link to="/">Volver al inicio</Link>
        </p>
      </div>
    </section>
  );
}
