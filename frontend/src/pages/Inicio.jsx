// Página principal pública: presentación de la aplicación y accesos rápidos.
// Es visible sin iniciar sesión; las pantallas de gestión sí requieren login.
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Inicio() {
  const { usuario } = useAuth();

  return (
    <section className="pagina">
      <div className="presentacion">
        <h1>Gestión de vehículos, conductores y viajes</h1>
        <p className="presentacion__texto">
          Aplicación de la empresa de transporte para el Trabajo Práctico N.º 3 de
          Programación IV. Permite administrar la flota de vehículos, los conductores
          y los viajes realizados, con el cálculo de kilómetros recorridos.
        </p>

        {usuario ? (
          <div className="presentacion__acciones">
            <p>
              Sesión iniciada como <strong>{usuario.nombre}</strong>. Podés acceder a las
              pantallas de gestión desde el menú superior.
            </p>
            <div className="botonera">
              <Link to="/vehiculos" className="boton boton--primario">
                Ver vehículos
              </Link>
              <Link to="/viajes" className="boton boton--secundario">
                Ver viajes
              </Link>
            </div>
          </div>
        ) : (
          <div className="presentacion__acciones">
            <p>Para usar la aplicación necesitás una cuenta e iniciar sesión.</p>
            <div className="botonera">
              <Link to="/login" className="boton boton--primario">
                Iniciar sesión
              </Link>
              <Link to="/login?modo=registro" className="boton boton--secundario">
                Crear cuenta
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="tarjetas">
        <article className="tarjeta">
          <h2>Vehículos</h2>
          <p>Listado de la flota con marca, modelo, patente, año y capacidad de carga.</p>
        </article>
        <article className="tarjeta">
          <h2>Conductores</h2>
          <p>Datos personales y de licencia de cada conductor de la empresa.</p>
        </article>
        <article className="tarjeta">
          <h2>Viajes</h2>
          <p>Registro de viajes, historial por vehículo o conductor y kilómetros totales.</p>
        </article>
      </div>
    </section>
  );
}
