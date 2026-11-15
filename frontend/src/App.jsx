// Rutas de la aplicación:
// - "/" (Inicio): página pública.
// - "/login": inicio de sesión y registro.
// - "/vehiculos", "/conductores", "/viajes": pantallas de gestión protegidas
//   (si no hay sesión, RequerirAuth redirige al login).
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import RequerirAuth from './components/RequerirAuth';
import Inicio from './pages/Inicio';
import Login from './pages/Login';
import Vehiculos from './pages/Vehiculos';
import Conductores from './pages/Conductores';
import Viajes from './pages/Viajes';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app">
          <Navbar />
          <main className="app__contenido">
            <Routes>
              <Route path="/" element={<Inicio />} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/vehiculos"
                element={
                  <RequerirAuth>
                    <Vehiculos />
                  </RequerirAuth>
                }
              />
              <Route
                path="/conductores"
                element={
                  <RequerirAuth>
                    <Conductores />
                  </RequerirAuth>
                }
              />
              <Route
                path="/viajes"
                element={
                  <RequerirAuth>
                    <Viajes />
                  </RequerirAuth>
                }
              />
              {/* Ruta desconocida: vuelve al inicio */}
              <Route path="*" element={<Inicio />} />
            </Routes>
          </main>
          <footer className="app__pie">
            <p>TP N.º 3 — Programación IV · UTN FR La Rioja</p>
          </footer>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
