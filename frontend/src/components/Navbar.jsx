// Barra de navegación principal: enlaces a las pantallas de la aplicación
// (Vehículos, Conductores, Viajes) con estado visual del enlace activo.
// Muestra el usuario logueado y el botón "Salir", o el acceso al login.
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const claseActiva = ({ isActive }) => (isActive ? 'nav__enlace nav__enlace--activo' : 'nav__enlace');

export default function Navbar() {
  const { usuario, salir } = useAuth();

  return (
    <header className="nav">
      <div className="nav__interior">
        <Link to="/" className="nav__marca">
          Transporte <span>TP3</span>
        </Link>

        <nav className="nav__enlaces" aria-label="Navegación principal">
          <NavLink to="/" end className={claseActiva}>
            Inicio
          </NavLink>
          <NavLink to="/vehiculos" className={claseActiva}>
            Vehículos
          </NavLink>
          <NavLink to="/conductores" className={claseActiva}>
            Conductores
          </NavLink>
          <NavLink to="/viajes" className={claseActiva}>
            Viajes
          </NavLink>
        </nav>

        <div className="nav__sesion">
          {usuario ? (
            <>
              <span className="nav__usuario">
                Hola, <strong>{usuario.nombre}</strong>
              </span>
              <button type="button" className="boton boton--secundario" onClick={salir}>
                Salir
              </button>
            </>
          ) : (
            <Link to="/login" className="boton boton--primario">
              Ingresar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
