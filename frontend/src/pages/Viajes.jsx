// Pantalla de viajes (Módulo 7): registro de viajes (vehículo + conductor),
// listado general, historial consultable por vehículo o conductor y
// kilómetros totales recorridos (resumen general y por entidad).
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { pedir } from '../api/client';
import FormularioViaje from '../components/FormularioViaje';
import HistorialViajes from '../components/HistorialViajes';
import { formatearFechaHora } from '../utils/validaciones';

export default function Viajes() {
  const [parametros] = useSearchParams();
  const [viajes, setViajes] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [conductores, setConductores] = useState([]);
  const [resumen, setResumen] = useState(null); // { por_vehiculo, por_conductor }
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  async function cargar() {
    setCargando(true);
    setError('');
    try {
      const [rVehiculos, rConductores, rViajes, rResumen] = await Promise.all([
        pedir('/vehiculos'),
        pedir('/conductores'),
        pedir('/viajes'),
        pedir('/viajes/kilometros'),
      ]);
      setVehiculos(rVehiculos.datos);
      setConductores(rConductores.datos);
      setViajes(rViajes.datos);
      setResumen(rResumen.datos);
    } catch (e) {
      // Un 401 ya disparó la redirección al login desde el cliente de API.
      if (e.estado !== 401) setError('No se pudo cargar la información de viajes.');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  function alRegistrar(mensaje) {
    setMensaje(mensaje);
    cargar(); // refresca listado e historial/kilómetros tras el alta
  }

  const inicialHistorial = {
    tipo: parametros.get('historial') === 'conductor' ? 'conductor' : 'vehiculo',
    id: parametros.get('id') || '',
  };

  return (
    <section className="pagina">
      <div className="pagina__cabecera">
        <h1>Viajes</h1>
        <p className="pagina__bajada">
          Registro de viajes, historial por vehículo o conductor y kilómetros recorridos.
        </p>
      </div>

      {mensaje && <p className="aviso aviso--exito">{mensaje}</p>}
      {error && <p className="aviso aviso--error">{error}</p>}
      {cargando && <p className="aviso">Cargando viajes…</p>}

      {!cargando && !error && (
        <>
          <FormularioViaje
            vehiculos={vehiculos}
            conductores={conductores}
            alGuardar={alRegistrar}
          />

          <div className="seccion">
            <h2>Viajes registrados</h2>
            <p className="seccion__bajada">Del más reciente al más antiguo.</p>
            {viajes.length === 0 ? (
              <p className="aviso">Todavía no hay viajes registrados.</p>
            ) : (
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
                      <td>{formatearFechaHora(v.fecha_salida)}</td>
                      <td>{formatearFechaHora(v.fecha_llegada)}</td>
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
          </div>

          <HistorialViajes
            vehiculos={vehiculos}
            conductores={conductores}
            inicial={inicialHistorial}
          />

          <div className="seccion">
            <h2>Kilómetros totales</h2>
            <p className="seccion__bajada">
              Kilómetros recorridos por cada vehículo y por cada conductor.
            </p>
            {resumen && (
              <div className="tarjetas">
                <div className="tarjeta">
                  <h2>Por vehículo</h2>
                  {resumen.por_vehiculo.length === 0 ? (
                    <p>No hay vehículos cargados.</p>
                  ) : (
                    <table className="tabla tabla--chica">
                      <thead>
                        <tr>
                          <th>Vehículo</th>
                          <th>Viajes</th>
                          <th>Km totales</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resumen.por_vehiculo.map((v) => (
                          <tr key={v.id}>
                            <td>
                              {v.marca} {v.modelo} ({v.patente})
                            </td>
                            <td>{v.cantidad_viajes}</td>
                            <td>{v.kilometros_totales}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                <div className="tarjeta">
                  <h2>Por conductor</h2>
                  {resumen.por_conductor.length === 0 ? (
                    <p>No hay conductores cargados.</p>
                  ) : (
                    <table className="tabla tabla--chica">
                      <thead>
                        <tr>
                          <th>Conductor</th>
                          <th>Viajes</th>
                          <th>Km totales</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resumen.por_conductor.map((c) => (
                          <tr key={c.id}>
                            <td>{c.conductor}</td>
                            <td>{c.cantidad_viajes}</td>
                            <td>{c.kilometros_totales}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
