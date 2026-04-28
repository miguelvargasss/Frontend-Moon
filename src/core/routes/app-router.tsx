import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import MainLayout from '../../shared/layouts/MainLayout';

// Lazy load de páginas para optimizar el bundle inicial
const ShopPage = lazy(() => import('../../modules/shop/presentation/pages/ShopPage'));
const AuthPage = lazy(() => import('../../modules/auth/presentation/pages/AuthPage'));

/**
 * Router principal de la aplicación MoonPhases.
 *
 * Rutas públicas:
 *   / → Tienda (landing)
 *   /login → Login / Register (sin navbar)
 *
 * Rutas protegidas (placeholder):
 *   /mis-pedidos → Mis Pedidos
 *   /mi-cuenta → Mi Cuenta
 */
export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="app-loader">
            <div className="loader-moon" />
          </div>
        }
      >
        <Routes>
          {/* Rutas con Navbar (MainLayout) */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<ShopPage />} />
            {/* Futuras rutas protegidas aquí */}
          </Route>

          {/* Rutas sin Navbar */}
          <Route path="/login" element={<AuthPage />} />

          {/* Fallback → redirige a la tienda */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
