// Pantalla de vehículos (Módulo 7): listado + alta, modificación y eliminación.
// Las validaciones de formato se hacen en el cliente (utils/validaciones.js);
// el backend revalida y puede devolver errores por campo o 409 de patente
// duplicada / eliminación con viajes asociados.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { pedir } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { validarVehiculo, aNumero, erroresPorCampo } from '../utils/validaciones';

const FORMULARIO_INICIAL = {
  marca: '',
  modelo: '',
  patente: '',
  anio: '',
  capacidad_carga: '',
};

export default function Vehiculos() {
  const { usuario } = useAuth();
  const [vehiculos, setVehiculos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  // Formulario compartido entre alta (modo 'alta') y edición (modo 'editar').
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
      const respuesta = await pedir('/vehiculos');
      setVehiculos(respuesta.datos);
    } catch (e) {
      // Un 401 ya disparó la redirección al login desde el cliente de API.
      if (e.estado !== 401) setError('No se pudo cargar el listado de vehículos.');
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

  function abrirEdicion(v) {
    setModo('editar');
    setEditandoId(v.id);
    setValores({
      marca: v.marca,
      modelo: v.modelo,
      patente: v.patente,
      anio: String(v.anio),
      capacidad_carga: String(v.capacidad_carga),
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
    const errores = validarVehiculo(valores);
    setErroresCampos(errores);
    setErrorFormulario('');
    if (Object.keys(errores).length > 0) return;

    setEnviando(true);
    try {
      const cuerpo = {
        marca: valores.marca.trim(),
        modelo: valores.modelo.trim(),
        patente: valores.patente.trim().toUpperCase(),
        anio: aNumero(valores.anio),
        capacidad_carga: aNumero(valores.capacidad_carga),
      };
      if (modo === 'alta') {
        await pedir('/vehiculos', { metodo: 'POST', cuerpo });
        setMensaje('Vehículo registrado correctamente.');
      } else {
        await pedir(`/vehiculos/${editandoId}`, { metodo: 'PUT', cuerpo });
        setMensaje('Vehículo actualizado correctamente.');
      }
      cerrarFormulario();
      await cargar();
    } catch (err) {
      if (err.estado !== 401) {
        if (err.errores?.length) setErroresCampos(erroresPorCampo(err.errores));
        setErrorFormulario(err.mensaje || 'No se pudo guardar el vehículo.');
      }
    } finally {
      setEnviando(false);
    }
  }

  async function eliminar(v) {
    const confirmado = window.confirm(
      `¿Eliminar el vehículo ${v.marca} ${v.modelo} (patente ${v.patente})? Esta acción no se puede deshacer.`
    );
    if (!confirmado) return;
    setError('');
    setMensaje('');
    try {
      await pedir(`/vehiculos/${v.id}`, { metodo: 'DELETE' });
      setMensaje('Vehículo eliminado correctamente.');
      await cargar();
    } catch (err) {
      // 409: el backend avisa si el vehículo tiene viajes asociados (FK).
      if (err.estado !== 401) setError(err.mensaje || 'No se pudo eliminar el vehículo.');
    }
  }

  return (
    <section className="pagina">
      <div className="pagina__cabecera">
        <h1>Vehículos</h1>
        <p className="pagina__bajada">
          Flota de la empresa{usuario ? `, sesión de ${usuario.nombre}` : ''}.
        </p>
      </div>

      <div className="botonera">
        {modo === 'oculto' ? (
          <button type="button" className="boton boton--primario" onClick={abrirAlta}>
            + Nuevo vehículo
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
          <h2>{modo === 'alta' ? 'Registrar vehículo' : `Editar vehículo #${editandoId}`}</h2>
          {errorFormulario && <p className="aviso aviso--error">{errorFormulario}</p>}

          <div className="formulario-grid">
            <div className="campo">
              <label htmlFor="veh-marca">Marca</label>
              <input
                id="veh-marca"
                value={valores.marca}
                onChange={(e) => cambiarCampo('marca', e.target.value)}
                placeholder="Ej.: Ford"
              />
              {erroresCampos.marca && <p className="campo__error">{erroresCampos.marca}</p>}
            </div>

            <div className="campo">
              <label htmlFor="veh-modelo">Modelo</label>
              <input
                id="veh-modelo"
                value={valores.modelo}
                onChange={(e) => cambiarCampo('modelo', e.target.value)}
                placeholder="Ej.: Ranger"
              />
              {erroresCampos.modelo && <p className="campo__error">{erroresCampos.modelo}</p>}
            </div>

            <div className="campo">
              <label htmlFor="veh-patente">Patente</label>
              <input
                id="veh-patente"
                value={valores.patente}
                onChange={(e) => cambiarCampo('patente', e.target.value)}
                placeholder="ABC123 o AB123CD"
                maxLength={10}
              />
              {erroresCampos.patente && <p className="campo__error">{erroresCampos.patente}</p>}
            </div>

            <div className="campo">
              <label htmlFor="veh-anio">Año</label>
              <input
                id="veh-anio"
                type="number"
                value={valores.anio}
                onChange={(e) => cambiarCampo('anio', e.target.value)}
                placeholder="Ej.: 2020"
                min={1900}
                max={2100}
              />
              {erroresCampos.anio && <p className="campo__error">{erroresCampos.anio}</p>}
            </div>

            <div className="campo">
              <label htmlFor="veh-capacidad">Capacidad de carga (kg)</label>
              <input
                id="veh-capacidad"
                type="text"
                inputMode="decimal"
                value={valores.capacidad_carga}
                onChange={(e) => cambiarCampo('capacidad_carga', e.target.value)}
                placeholder="Ej.: 1200.5"
              />
              {erroresCampos.capacidad_carga && (
                <p className="campo__error">{erroresCampos.capacidad_carga}</p>
              )}
            </div>
          </div>

          <div className="botonera">
            <button type="submit" className="boton boton--primario" disabled={enviando}>
              {enviando ? 'Guardando…' : modo === 'alta' ? 'Guardar vehículo' : 'Guardar cambios'}
            </button>
            <button type="button" className="boton boton--secundario" onClick={cerrarFormulario}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      {cargando && <p className="aviso">Cargando vehículos…</p>}
      {!cargando && !error && vehiculos.length === 0 && (
        <p className="aviso">Todavía no hay vehículos registrados.</p>
      )}

      {vehiculos.length > 0 && (
        <table className="tabla">
          <thead>
            <tr>
              <th>Patente</th>
              <th>Marca</th>
              <th>Modelo</th>
              <th>Año</th>
              <th>Capacidad (kg)</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {vehiculos.map((v) => (
              <tr key={v.id}>
                <td>{v.patente}</td>
                <td>{v.marca}</td>
                <td>{v.modelo}</td>
                <td>{v.anio}</td>
                <td>{v.capacidad_carga}</td>
                <td className="tabla__acciones">
                  <Link className="boton boton--secundario" to={`/viajes?historial=vehiculo&id=${v.id}`}>
                    Viajes
                  </Link>
                  <button
                    type="button"
                    className="boton boton--secundario"
                    onClick={() => abrirEdicion(v)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="boton boton--peligroso"
                    onClick={() => eliminar(v)}
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
