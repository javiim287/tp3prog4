import { useEffect, useState } from 'react';
import { pedir } from '../api/client';
import { formatearFechaHora } from '../utils/validaciones';

const SIN_SELECCION = { tipo: 'vehiculo', id: '' };

export default function HistorialViajes({ vehiculos, conductores, inicial = SIN_SELECCION }) {
  const [tipo, setTipo] = useState(inicial.tipo === 'conductor' ? 'conductor' : 'vehiculo');
  const [idEntidad, setIdEntidad] = useState(String(inicial.id || ''));
  const [historial, setHistorial] = useState(null);
  const [kilometros, setKilometros] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!idEntidad) {
      setHistorial(null);
      setKilometros(null);
      setError('');
      return;
    }

    let cancelado = false;
    async function cargar() {
      setCargando(true);
      setError('');
      try {
        const [respuestaHistorial, respuestaKm] = await Promise.all([
          pedir(`/viajes/${tipo}/${idEntidad}`),
          pedir(`/viajes/kilometros/${tipo}/${idEntidad}`),
        ]);
        if (cancelado) return;
        setHistorial(
          tipo === 'vehiculo'
            ? { entidad: respuestaHistorial.datos.vehiculo, viajes: respuestaHistorial.datos.viajes }
            : { entidad: respuestaHistorial.datos.conductor, viajes: respuestaHistorial.datos.viajes }
        );
        setKilometros(respuestaKm.datos);
      } catch (e) {
        if (e.estado !== 401 && !cancelado) {
          setHistorial(null);
          setKilometros(null);
          setError(e.mensaje || 'No se pudo cargar el historial de viajes.');
        }
      } finally {
        if (!cancelado) setCargando(false);
      }
    }
    cargar();
    return () => {
      cancelado = true;
    };
  }, [tipo, idEntidad]);

  const lista = tipo === 'vehiculo' ? vehiculos : conductores;

  return (
    <div className="seccion">
      <h2>Historial de viajes</h2>
      <p className="seccion__bajada">
        Consultá todos los viajes de un vehículo o de un conductor, con sus kilómetros totales.
      </p>

      <div className="filtros">
        <div className="campo">
          <label htmlFor="hist-tipo">Consultar por</label>
          <select
            id="hist-tipo"
            value={tipo}
            onChange={(e) => {
              setTipo(e.target.value);
              setIdEntidad('');
            }}
          >
            <option value="vehiculo">Vehículo</option>
            <option value="conductor">Conductor</option>
          </select>
        </div>

        <div className="campo">
          <label htmlFor="hist-entidad">{tipo === 'vehiculo' ? 'Vehículo' : 'Conductor'}</label>
          <select
            id="hist-entidad"
            value={idEntidad}
            onChange={(e) => setIdEntidad(e.target.value)}
          >
            <option value="">
              {lista.length === 0
                ? 'No hay registros cargados'
                : tipo === 'vehiculo'
                  ? 'Seleccionar vehículo…'
                  : 'Seleccionar conductor…'}
            </option>
            {tipo === 'vehiculo'
              ? vehiculos.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.patente} — {v.marca} {v.modelo}
                  </option>
                ))
              : conductores.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} {c.apellido} ({c.numero_licencia})
                  </option>
                ))}
          </select>
        </div>
      </div>

      {cargando && <p className="aviso">Cargando historial…</p>}
      {error && <p className="aviso aviso--error">{error}</p>}

      {!cargando && !error && idEntidad && historial && (
        <>
          <p className="historial__resumen">
            {tipo === 'vehiculo'
              ? `${historial.entidad.marca} ${historial.entidad.modelo} (${historial.entidad.patente})`
              : `${historial.entidad.nombre} ${historial.entidad.apellido}`}{' '}
            — Total: {kilometros?.kilometros_totales ?? 0} km en{' '}
            {kilometros?.cantidad_viajes ?? historial.viajes.length}{' '}
            {(kilometros?.cantidad_viajes ?? historial.viajes.length) === 1 ? 'viaje' : 'viajes'}.
          </p>

          {historial.viajes.length === 0 ? (
            <p className="aviso">Esta selección todavía no tiene viajes registrados.</p>
          ) : (
            <table className="tabla">
              <thead>
                <tr>
                  <th>Salida</th>
                  <th>Llegada</th>
                  <th>{tipo === 'vehiculo' ? 'Conductor' : 'Vehículo'}</th>
                  <th>Origen → Destino</th>
                  <th>Km</th>
                </tr>
              </thead>
              <tbody>
                {historial.viajes.map((v) => (
                  <tr key={v.id}>
                    <td>{formatearFechaHora(v.fecha_salida)}</td>
                    <td>{formatearFechaHora(v.fecha_llegada)}</td>
                    <td>
                      {tipo === 'vehiculo'
                        ? v.conductor_nombre
                        : `${v.marca} ${v.modelo} (${v.patente})`}
                    </td>
                    <td>
                      {v.origen} → {v.destino}
                    </td>
                    <td>{v.kilometros}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}
