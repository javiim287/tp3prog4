// Pantalla de vehículos: listado consumiendo la API protegida con JWT.
// La alta, modificación y eliminación se agregan en el Módulo 7.
import { useEffect, useState } from 'react';
import { pedir } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Vehiculos() {
  const { usuario } = useAuth();
  const [vehiculos, setVehiculos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelado = false;
    async function cargar() {
      setCargando(true);
      setError('');
      try {
        const respuesta = await pedir('/vehiculos');
        if (!cancelado) setVehiculos(respuesta.datos);
      } catch (e) {
        // Un 401 ya disparó la redirección al login desde el cliente de API.
        if (e.estado !== 401 && !cancelado) {
          setError('No se pudo cargar el listado de vehículos.');
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
        <h1>Vehículos</h1>
        <p className="pagina__bajada">
          Flota de la empresa{usuario ? `, sesión de ${usuario.nombre}` : ''}.
        </p>
      </div>

      {cargando && <p className="aviso">Cargando vehículos…</p>}
      {error && <p className="aviso aviso--error">{error}</p>}

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
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
