import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  EVENTO_SESION_EXPIRADA,
  cerrarSesion,
  guardarSesion,
  obtenerUsuarioGuardado,
  pedir,
} from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => obtenerUsuarioGuardado());
  const navegar = useNavigate();

  useEffect(() => {
    const alExpirar = () => {
      cerrarSesion();
      setUsuario(null);
      navegar('/login', { replace: true });
    };
    window.addEventListener(EVENTO_SESION_EXPIRADA, alExpirar);
    return () => window.removeEventListener(EVENTO_SESION_EXPIRADA, alExpirar);
  }, [navegar]);

  async function iniciarSesion(email, contrasena) {
    const respuesta = await pedir('/usuarios/login', {
      metodo: 'POST',
      cuerpo: { email, contrasena },
      autenticado: false,
    });
    guardarSesion(respuesta.datos);
    setUsuario({
      id: respuesta.datos.id,
      nombre: respuesta.datos.nombre,
      email: respuesta.datos.email,
    });
    return respuesta;
  }

  async function registrar(nombre, email, contrasena) {
    return pedir('/usuarios/registro', {
      metodo: 'POST',
      cuerpo: { nombre, email, contrasena },
      autenticado: false,
    });
  }

  function salir() {
    cerrarSesion();
    setUsuario(null);
    navegar('/login');
  }

  return (
    <AuthContext.Provider value={{ usuario, iniciarSesion, registrar, salir }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
