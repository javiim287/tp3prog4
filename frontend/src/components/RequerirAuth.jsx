// Envuelve las rutas protegidas: si no hay usuario logueado redirige al
// login. Las rutas CRUD del backend exigen JWT, así que sin sesión no
// tiene sentido mostrarlas.
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RequerirAuth({ children }) {
  const { usuario } = useAuth();

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
