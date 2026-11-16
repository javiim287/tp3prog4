// Formulario de registro de viajes (Módulo 7): asocia un vehículo y un
// conductor con fechas, trayecto y kilómetros. Valida en el cliente con las
// reglas de utils/validaciones.js y muestra los errores por campo del backend.
import { useState } from 'react';
import { pedir } from '../api/client';
import { validarViaje, aFechaHora, aNumero, erroresPorCampo } from '../utils/validaciones';

const FORMULARIO_INICIAL = {
  vehiculo_id: '',
  conductor_id: '',
  fecha_salida: '',
  fecha_llegada: '',
  origen: '',
  destino: '',
  kilometros: '',
  observaciones: '',
};

export default function FormularioViaje({ vehiculos, conductores, alGuardar }) {
  const [valores, setValores] = useState(FORMULARIO_INICIAL);
  const [erroresCampos, setErroresCampos] = useState({});
  const [errorFormulario, setErrorFormulario] = useState('');
  const [enviando, setEnviando] = useState(false);

  function cambiarCampo(campo, valor) {
    setValores((previo) => ({ ...previo, [campo]: valor }));
  }

  function limpiar() {
    setValores(FORMULARIO_INICIAL);
    setErroresCampos({});
    setErrorFormulario('');
  }

  async function enviar(e) {
    e.preventDefault();
    const errores = validarViaje(valores);
    setErroresCampos(errores);
    setErrorFormulario('');
    if (Object.keys(errores).length > 0) return;

    setEnviando(true);
    try {
      const cuerpo = {
        vehiculo_id: aNumero(valores.vehiculo_id),
        conductor_id: aNumero(valores.conductor_id),
        fecha_salida: aFechaHora(valores.fecha_salida),
        fecha_llegada: aFechaHora(valores.fecha_llegada),
        origen: valores.origen.trim(),
        destino: valores.destino.trim(),
        kilometros: aNumero(valores.kilometros),
        observaciones: valores.observaciones.trim() || undefined,
      };
      const respuesta = await pedir('/viajes', { metodo: 'POST', cuerpo });
      limpiar();
      alGuardar(respuesta.mensaje || 'Viaje registrado correctamente.');
    } catch (err) {
      if (err.estado !== 401) {
        if (err.errores?.length) setErroresCampos(erroresPorCampo(err.errores));
        setErrorFormulario(err.mensaje || 'No se pudo registrar el viaje.');
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="tarjeta" onSubmit={enviar} noValidate>
      <h2>Registrar viaje</h2>
      {errorFormulario && <p className="aviso aviso--error">{errorFormulario}</p>}

      <div className="formulario-grid">
        <div className="campo">
          <label htmlFor="via-vehiculo">Vehículo</label>
          <select
            id="via-vehiculo"
            value={valores.vehiculo_id}
            onChange={(e) => cambiarCampo('vehiculo_id', e.target.value)}
          >
            <option value="">Seleccionar vehículo…</option>
            {vehiculos.map((v) => (
              <option key={v.id} value={v.id}>
                {v.patente} — {v.marca} {v.modelo}
              </option>
            ))}
          </select>
          {erroresCampos.vehiculo_id && <p className="campo__error">{erroresCampos.vehiculo_id}</p>}
        </div>

        <div className="campo">
          <label htmlFor="via-conductor">Conductor</label>
          <select
            id="via-conductor"
            value={valores.conductor_id}
            onChange={(e) => cambiarCampo('conductor_id', e.target.value)}
          >
            <option value="">Seleccionar conductor…</option>
            {conductores.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre} {c.apellido} ({c.numero_licencia})
              </option>
            ))}
          </select>
          {erroresCampos.conductor_id && (
            <p className="campo__error">{erroresCampos.conductor_id}</p>
          )}
        </div>

        <div className="campo">
          <label htmlFor="via-salida">Fecha y hora de salida</label>
          <input
            id="via-salida"
            type="datetime-local"
            value={valores.fecha_salida}
            onChange={(e) => cambiarCampo('fecha_salida', e.target.value)}
          />
          {erroresCampos.fecha_salida && (
            <p className="campo__error">{erroresCampos.fecha_salida}</p>
          )}
        </div>

        <div className="campo">
          <label htmlFor="via-llegada">Fecha y hora de llegada</label>
          <input
            id="via-llegada"
            type="datetime-local"
            value={valores.fecha_llegada}
            onChange={(e) => cambiarCampo('fecha_llegada', e.target.value)}
          />
          {erroresCampos.fecha_llegada && (
            <p className="campo__error">{erroresCampos.fecha_llegada}</p>
          )}
        </div>

        <div className="campo">
          <label htmlFor="via-origen">Origen</label>
          <input
            id="via-origen"
            value={valores.origen}
            onChange={(e) => cambiarCampo('origen', e.target.value)}
            placeholder="Ej.: La Rioja"
          />
          {erroresCampos.origen && <p className="campo__error">{erroresCampos.origen}</p>}
        </div>

        <div className="campo">
          <label htmlFor="via-destino">Destino</label>
          <input
            id="via-destino"
            value={valores.destino}
            onChange={(e) => cambiarCampo('destino', e.target.value)}
            placeholder="Ej.: Córdoba"
          />
          {erroresCampos.destino && <p className="campo__error">{erroresCampos.destino}</p>}
        </div>

        <div className="campo">
          <label htmlFor="via-kilometros">Kilómetros</label>
          <input
            id="via-kilometros"
            type="text"
            inputMode="decimal"
            value={valores.kilometros}
            onChange={(e) => cambiarCampo('kilometros', e.target.value)}
            placeholder="Ej.: 300.5"
          />
          {erroresCampos.kilometros && <p className="campo__error">{erroresCampos.kilometros}</p>}
        </div>

        <div className="campo campo--completo">
          <label htmlFor="via-observaciones">Observaciones (opcional)</label>
          <textarea
            id="via-observaciones"
            value={valores.observaciones}
            onChange={(e) => cambiarCampo('observaciones', e.target.value)}
            placeholder="Detalles del viaje: carga, peajes, novedades…"
          />
          {erroresCampos.observaciones && (
            <p className="campo__error">{erroresCampos.observaciones}</p>
          )}
        </div>
      </div>

      <div className="botonera">
        <button type="submit" className="boton boton--primario" disabled={enviando}>
          {enviando ? 'Registrando…' : 'Registrar viaje'}
        </button>
        <button type="button" className="boton boton--secundario" onClick={limpiar}>
          Limpiar
        </button>
      </div>
    </form>
  );
}
