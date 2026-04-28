import './index.css';
import AppRouter from './core/routes/app-router';

/**
 * Componente raíz de MoonPhases.
 * Delega la navegación al AppRouter.
 */
export default function App() {
  return <AppRouter />;
}
