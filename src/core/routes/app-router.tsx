import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import MainLayout from '../../shared/layouts/MainLayout';
import { useAuthStore } from '../../modules/auth/application/auth.store';
import type { ReactNode } from 'react';

// Lazy load de páginas para optimizar el bundle inicial
const ShopPage = lazy(() => import('../../modules/shop/presentation/pages/ShopPage'));
const ProductDetailPage = lazy(() => import('../../modules/shop/presentation/pages/ProductDetailPage'));
const CartPage = lazy(() => import('../../modules/cart/presentation/pages/CartPage'));
const AuthPage = lazy(() => import('../../modules/auth/presentation/pages/AuthPage'));

// Admin — lazy load
const AdminLayout = lazy(() => import('../../shared/layouts/AdminLayout'));
const DashboardPage = lazy(() => import('../../modules/admin/presentation/pages/DashboardPage'));
const ProductsAdminPage = lazy(() => import('../../modules/admin/presentation/pages/ProductsAdminPage'));
const CategoriesAdminPage = lazy(() => import('../../modules/admin/presentation/pages/CategoriesAdminPage'));
const OrdersAdminPage = lazy(() => import('../../modules/admin/presentation/pages/OrdersAdminPage'));
const UsersAdminPage = lazy(() => import('../../modules/admin/presentation/pages/UsersAdminPage'));
const CouponsAdminPage = lazy(() => import('../../modules/admin/presentation/pages/CouponsAdminPage'));

/**
 * Guard que protege rutas exclusivas para administradores.
 * Espera a que la sesión se restaure antes de decidir.
 */
function AdminGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, user, isRestoring } = useAuthStore();

  // Mientras se restaura la sesión, mostrar loader
  if (isRestoring) {
    return (
      <div className="app-loader">
        <div className="loader-moon" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

/**
 * Router principal de la aplicación MoonPhases.
 *
 * Rutas públicas:
 *   / → Tienda (landing)
 *   /producto/:id → Detalle de producto
 *   /carrito → Carrito de compras
 *   /login → Login / Register (sin navbar)
 *
 * Rutas protegidas:
 *   /mis-pedidos → Mis Pedidos
 *   /mi-cuenta → Mi Cuenta
 *
 * Rutas admin (solo rol admin):
 *   /admin → Dashboard
 *   /admin/productos → Gestión de productos
 *   /admin/categorias → Gestión de categorías
 *   /admin/pedidos → Gestión de pedidos
 *   /admin/usuarios → Gestión de usuarios
 *   /admin/cupones → Gestión de cupones
 */
export default function AppRouter() {
  const restoreSession = useAuthStore((s) => s.restoreSession);

  // Restaurar sesión al cargar la app
  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

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
            <Route path="/producto/:id" element={<ProductDetailPage />} />
            <Route path="/carrito" element={<CartPage />} />
            {/* Futuras rutas protegidas aquí */}
          </Route>

          {/* Rutas sin Navbar */}
          <Route path="/login" element={<AuthPage />} />

          {/* Rutas del Panel Admin — protegidas por rol */}
          <Route
            path="/admin"
            element={
              <AdminGuard>
                <AdminLayout />
              </AdminGuard>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="productos" element={<ProductsAdminPage />} />
            <Route path="categorias" element={<CategoriesAdminPage />} />
            <Route path="pedidos" element={<OrdersAdminPage />} />
            <Route path="usuarios" element={<UsersAdminPage />} />
            <Route path="cupones" element={<CouponsAdminPage />} />
          </Route>

          {/* Fallback → redirige a la tienda */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
