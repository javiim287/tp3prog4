import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { pedir } from '../api/client';
import { validarConductor, erroresPorCampo } from '../utils/validaciones';

const FORMULARIO_INICIAL = {
  nombre: '',
  apellido: '',
  numero_documento: '',
  numero_licencia: '',
  fecha_alta_licencia: '',
  fecha_vencimiento_licencia: '',
};

export default function Conductores() {
  const [conductores, setConductores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  const [modo, setModo] = useState('oculto');
  const [editandoId, setEditandoId] = useState(null);
  const [valores, setValores] = useState(FORMULARIO_INICIAL);
  const [erroresCampos, setErroresCampos] = useState({});
  const [errorFormulario, setErrorFormulario] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function cargar() {
    setCargando(true);
    setError('');
    try {
      const respuesta = await pedir('/conductores');
      setConductores(respuesta.datos);
    } catch (e) {
      if (e.estado !== 401) setError('No se pudo cargar el listado de conductores.');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  function abrirAlta() {
    setModo('alta');
    setEditandoId(null);
    setValores(FORMULARIO_INICIAL);
    setErroresCampos({});
    setErrorFormulario('');
    setMensaje('');
  }

  function abrirEdicion(c) {
    setModo('editar');
    setEditandoId(c.id);
    setValores({
      nombre: c.nombre,
      apellido: c.apellido,
      numero_documento: c.numero_documento,
      numero_licencia: c.numero_licencia,
      fecha_alta_licencia: String(c.fecha_alta_licencia).slice(0, 10),
      fecha_vencimiento_licencia: String(c.fecha_vencimiento_licencia).slice(0, 10),
    });
    setErroresCampos({});
    setErrorFormulario('');
    setMensaje('');
  }

  function cerrarFormulario() {
    setModo('oculto');
    setEditandoId(null);
    setValores(FORMULARIO_INICIAL);
    setErroresCampos({});
    setErrorFormulario('');
  }

  function cambiarCampo(campo, valor) {
    setValores((previo) => ({ ...previo, [campo]: valor }));
  }

  async function enviar(e) {
    e.preventDefault();
    const errores = validarConductor(valores);
    setErroresCampos(errores);
    setErrorFormulario('');
    if (Object.keys(errores).length > 0) return;

    setEnviando(true);
    try {
      const cuerpo = {
        nombre: valores.nombre.trim(),
        apellido: valores.apellido.trim(),
        numero_documento: valores.numero_documento.trim(),
        numero_licencia: valores.numero_licencia.trim().toUpperCase(),
        fecha_alta_licencia: valores.fecha_alta_licencia,
        fecha_vencimiento_licencia: valores.fecha_vencimiento_licencia,
      };
      if (modo === 'alta') {
        await pedir('/conductores', { metodo: 'POST', cuerpo });
        setMensaje('Conductor registrado correctamente.');
      } else {
        await pedir(`/conductores/${editandoId}`, { metodo: 'PUT', cuerpo });
        setMensaje('Conductor actualizado correctamente.');
      }
      cerrarFormulario();
      await cargar();
    } catch (err) {
      if (err.estado !== 401) {
        if (err.errores?.length) setErroresCampos(erroresPorCampo(err.errores));
        setErrorFormulario(err.mensaje || 'No se pudo guardar el conductor.');
      }
    } finally {
      setEnviando(false);
    }
  }

  async function eliminar(c) {
    const confirmado = window.confirm(
      `¿Eliminar el conductor ${c.nombre} ${c.apellido} (documento ${c.numero_documento})? Esta acción no se puede deshacer.`
    );
    if (!confirmado) return;
    setError('');
    setMensaje('');
    try {
      await pedir(`/conductores/${c.id}`, { metodo: 'DELETE' });
      setMensaje('Conductor eliminado correctamente.');
      await cargar();
    } catch (err) {
      if (err.estado !== 401) setError(err.mensaje || 'No se pudo eliminar el conductor.');
    }
  }

  return (
    <section className="pagina">
      <div className="pagina__cabecera">
        <h1>Conductores</h1>
        <p className="pagina__bajada">Personal habilitado para conducir la flota.</p>
      </div>

      <div className="botonera">
        {modo === 'oculto' ? (
          <button type="button" className="boton boton--primario" onClick={abrirAlta}>
            + Nuevo conductor
          </button>
        ) : (
          <button type="button" className="boton boton--secundario" onClick={cerrarFormulario}>
            Cerrar formulario
          </button>
        )}
      </div>

      {mensaje && <p className="aviso aviso--exito">{mensaje}</p>}
      {error && <p className="aviso aviso--error">{error}</p>}

      {modo !== 'oculto' && (
        <form className="tarjeta" onSubmit={enviar} noValidate>
          <h2>{modo === 'alta' ? 'Registrar conductor' : `Editar conductor #${editandoId}`}</h2>
          {errorFormulario && <p className="aviso aviso--error">{errorFormulario}</p>}

          <div className="formulario-grid">
            <div className="campo">
              <label htmlFor="con-nombre">Nombre</label>
              <input
                id="con-nombre"
                value={valores.nombre}
                onChange={(e) => cambiarCampo('nombre', e.target.value)}
                placeholder="Ej.: María"
              />
              {erroresCampos.nombre && <p className="campo__error">{erroresCampos.nombre}</p>}
            </div>

            <div className="campo">
              <label htmlFor="con-apellido">Apellido</label>
              <input
                id="con-apellido"
                value={valores.apellido}
                onChange={(e) => cambiarCampo('apellido', e.target.value)}
                placeholder="Ej.: Gómez"
              />
              {erroresCampos.apellido && <p className="campo__error">{erroresCampos.apellido}</p>}
            </div>

            <div className="campo">
              <label htmlFor="con-documento">Número de documento</label>
              <input
                id="con-documento"
                value={valores.numero_documento}
                onChange={(e) => cambiarCampo('numero_documento', e.target.value)}
                placeholder="Solo dígitos"
                maxLength={20}
              />
              {erroresCampos.numero_documento && (
                <p className="campo__error">{erroresCampos.numero_documento}</p>
              )}
            </div>

            <div className="campo">
              <label htmlFor="con-licencia">Número de licencia</label>
              <input
                id="con-licencia"
                value={valores.numero_licencia}
                onChange={(e) => cambiarCampo('numero_licencia', e.target.value)}
                placeholder="Ej.: LIC-1001"
                maxLength={20}
              />
              {erroresCampos.numero_licencia && (
                <p className="campo__error">{erroresCampos.numero_licencia}</p>
              )}
            </div>

            <div className="campo">
              <label htmlFor="con-alta">Alta de la licencia</label>
              <input
                id="con-alta"
                type="date"
                value={valores.fecha_alta_licencia}
                onChange={(e) => cambiarCampo('fecha_alta_licencia', e.target.value)}
              />
              {erroresCampos.fecha_alta_licencia && (
                <p className="campo__error">{erroresCampos.fecha_alta_licencia}</p>
              )}
            </div>

            <div className="campo">
              <label htmlFor="con-vencimiento">Vencimiento de la licencia</label>
              <input
                id="con-vencimiento"
                type="date"
                value={valores.fecha_vencimiento_licencia}
                onChange={(e) => cambiarCampo('fecha_vencimiento_licencia', e.target.value)}
              />
              {erroresCampos.fecha_vencimiento_licencia && (
                <p className="campo__error">{erroresCampos.fecha_vencimiento_licencia}</p>
              )}
            </div>
          </div>

          <div className="botonera">
            <button type="submit" className="boton boton--primario" disabled={enviando}>
              {enviando ? 'Guardando…' : modo === 'alta' ? 'Guardar conductor' : 'Guardar cambios'}
            </button>
            <button type="button" className="boton boton--secundario" onClick={cerrarFormulario}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      {cargando && <p className="aviso">Cargando conductores…</p>}
      {!cargando && !error && conductores.length === 0 && (
        <p className="aviso">Todavía no hay conductores registrados.</p>
      )}

      {conductores.length > 0 && (
        <table className="tabla">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Documento</th>
              <th>Licencia</th>
              <th>Vence</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {conductores.map((c) => (
              <tr key={c.id}>
                <td>{c.nombre}</td>
                <td>{c.apellido}</td>
                <td>{c.numero_documento}</td>
                <td>{c.numero_licencia}</td>
                <td>{c.fecha_vencimiento_licencia}</td>
                <td className="tabla__acciones">
                  <Link
                    className="boton boton--secundario"
                    to={`/viajes?historial=conductor&id=${c.id}`}
                  >
                    Viajes
                  </Link>
                  <button
                    type="button"
                    className="boton boton--secundario"
                    onClick={() => abrirEdicion(c)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="boton boton--peligroso"
                    onClick={() => eliminar(c)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
