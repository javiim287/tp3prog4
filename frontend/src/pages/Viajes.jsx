// Pantalla de viajes: listado general con datos del vehículo y del conductor
// (la API los devuelve con JOIN). El registro de viajes, el historial por
// vehículo/conductor y los kilómetros totales se completan en el Módulo 7.
import { useEffect, useState } from 'react';
import { pedir } from '../api/client';

function formatearFecha(valor) {
  if (!valor) return '';
  return String(valor).replace('T', ' ').slice(0, 16);
}

export default function Viajes() {
  const [viajes, setViajes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelado = false;
    async function cargar() {
      setCargando(true);
      setError('');
      try {
        const respuesta = await pedir('/viajes');
        if (!cancelado) setViajes(respuesta.datos);
      } catch (e) {
        // Un 401 ya disparó la redirección al login desde el cliente de API.
        if (e.estado !== 401 && !cancelado) {
          setError('No se pudo cargar el listado de viajes.');
        }
      } finally {
        if (!cancelado) setCargando(false);
      }
    }
    cargar();
    return () => {
      cancelado = true;
    };
  }, []);

  return (
    <section className="pagina">
      <div className="pagina__cabecera">
        <h1>Viajes</h1>
        <p className="pagina__bajada">Viajes registrados, del más reciente al más antiguo.</p>
      </div>

      {cargando && <p className="aviso">Cargando viajes…</p>}
      {error && <p className="aviso aviso--error">{error}</p>}

      {!cargando && !error && viajes.length === 0 && (
        <p className="aviso">Todavía no hay viajes registrados.</p>
      )}

      {viajes.length > 0 && (
        <table className="tabla">
          <thead>
            <tr>
              <th>Salida</th>
              <th>Llegada</th>
              <th>Vehículo</th>
              <th>Conductor</th>
              <th>Origen → Destino</th>
              <th>Km</th>
            </tr>
          </thead>
          <tbody>
            {viajes.map((v) => (
              <tr key={v.id}>
                <td>{formatearFecha(v.fecha_salida)}</td>
                <td>{formatearFecha(v.fecha_llegada)}</td>
                <td>
                  {v.marca} {v.modelo} ({v.patente})
                </td>
                <td>{v.conductor_nombre}</td>
                <td>
                  {v.origen} → {v.destino}
                </td>
                <td>{v.kilometros}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
