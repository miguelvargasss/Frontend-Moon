import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

/**
 * Layout principal con Navbar + contenido + Footer.
 * Se usa como wrapper de las rutas que necesitan la barra de navegación.
 * Las rutas como /login y /admin no usan este layout.
 */
export default function MainLayout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <footer className="border-t border-[--glass-border] bg-moon-bg py-6" id="site-footer">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 36 36" fill="none">
              <circle cx="18" cy="18" r="16" stroke="#2dd4a8" strokeWidth="1.5" opacity="0.6" />
              <circle cx="18" cy="18" r="12" fill="#2dd4a8" opacity="0.15" />
              <path d="M24 18c0-3.314-2.686-6-6-6-1.5 0-2.87.553-3.92 1.464C15.68 11.308 18.5 10 21.6 10c4.862 0 8.4 3.538 8.4 8.4 0 3.1-1.308 5.92-3.464 7.52A5.974 5.974 0 0 0 24 18z" fill="#2dd4a8" opacity="0.8" />
            </svg>
            <div className="flex flex-col leading-none">
              <span className="font-display text-sm font-semibold text-foreground">moon</span>
              <span className="font-display text-[0.55rem] text-primary tracking-[0.18em]">phases</span>
            </div>
          </div>
          <p className="flex items-center gap-1.5 text-xs text-default-400 text-center">
            &copy; 2026 MoonPhases &middot; Todos los derechos reservados &middot; Diseñamos lo que imaginas
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary/40">
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
            </svg>
          </p>
        </div>
      </footer>
    </>
  );
}
