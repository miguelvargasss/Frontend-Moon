import { useEffect } from 'react';
import './index.css';
import AppRouter from './core/routes/app-router';
import { useAuthStore } from './modules/auth/application/auth.store';
import { useCartStore } from './modules/cart/application/cart.store';

/**
 * Componente raíz de MoonPhases.
 * Delega la navegación al AppRouter.
 */
export default function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const fetchCart = useCartStore((s) => s.fetchCart);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  return <AppRouter />;
}
