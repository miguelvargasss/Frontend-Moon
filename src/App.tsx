import { useEffect } from 'react';
import './index.css';
import AppRouter from './core/routes/app-router';
import { useAuthStore } from './modules/auth/application/auth.store';
import { useCartStore } from './modules/cart/application/cart.store';
import AccessibilityWidget from './shared/components/AccessibilityWidget';
import { LanguageProvider, useLanguage } from './core/i18n/i18n';

/**
 * Contenido interno de la app (necesita estar dentro de LanguageProvider).
 */
function AppContent() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const { t } = useLanguage();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  return (
    <>
      {/* Skip Link – WCAG 2.4.1: Bypass Blocks */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[99999] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-primary focus:text-background focus:font-semibold focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        {t('skipLink')}
      </a>
      <AppRouter />
      {/* Widget de accesibilidad visual – disponible en todas las páginas */}
      <AccessibilityWidget />
    </>
  );
}

/**
 * Componente raíz de MoonPhases.
 * Envuelve toda la app con el LanguageProvider para i18n.
 */
export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
