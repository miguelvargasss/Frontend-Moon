import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

/**
 * Layout principal con Navbar + contenido.
 * Se usa como wrapper de las rutas que necesitan la barra de navegación.
 * Las rutas como /login no usan este layout.
 */
export default function MainLayout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
    </>
  );
}
