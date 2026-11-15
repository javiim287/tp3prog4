// Pantalla de conductores: listado consumiendo la API protegida con JWT.
// La alta, modificación y eliminación se agregan en el Módulo 7.
import { useEffect, useState } from 'react';
import { pedir } from '../api/client';

export default function Conductores() {
  const [conductores, setConductores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelado = false;
    async function cargar() {
      setCargando(true);
      setError('');
      try {
        const respuesta = await pedir('/conductores');
        if (!cancelado) setConductores(respuesta.datos);
      } catch (e) {
        // Un 401 ya disparó la redirección al login desde el cliente de API.
        if (e.estado !== 401 && !cancelado) {
          setError('No se pudo cargar el listado de conductores.');
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
        <h1>Conductores</h1>
        <p className="pagina__bajada">Personal habilitado para conducir la flota.</p>
      </div>

      {cargando && <p className="aviso">Cargando conductores…</p>}
      {error && <p className="aviso aviso--error">{error}</p>}

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
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
