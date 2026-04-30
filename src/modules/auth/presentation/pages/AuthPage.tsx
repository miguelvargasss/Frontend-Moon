import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import BrandingPanel from '../components/BrandingPanel';
import '../styles/auth-page.css';

/**
 * Página de autenticación con transición animada Login ↔ Register.
 *
 * Layout:
 * - LOGIN:    [Branding | LoginForm]     (branding izquierda, form derecha)
 * - REGISTER: [RegisterForm | Branding]  (form izquierda, branding derecha)
 *
 * La transición se logra invirtiendo el orden de los paneles con
 * Framer Motion AnimatePresence.
 */
export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const switchToRegister = () => setMode('register');
  const switchToLogin = () => setMode('login');

  return (
    <div className="auth-page">
      {/* Fondo de estrellas sutil */}
      <div className="auth-stars" />
      <div className="auth-stars auth-stars-2" />

      <div className="auth-container">
        <AnimatePresence mode="wait">
          {mode === 'login' ? (
            <motion.div
              key="login-layout"
              className="auth-layout"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Login: Branding a la izquierda */}
              <motion.div
                className="auth-panel auth-panel-branding"
                initial={{ x: 60, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
              >
                <BrandingPanel />
              </motion.div>

              {/* Login: Form a la derecha */}
              <motion.div
                className="auth-panel auth-panel-form"
                initial={{ x: -60, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }}
              >
                <div className="auth-form-glass">
                  <LoginForm onSwitchToRegister={switchToRegister} />
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="register-layout"
              className="auth-layout"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Register: Form a la izquierda */}
              <motion.div
                className="auth-panel auth-panel-form"
                initial={{ x: 60, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
              >
                <div className="auth-form-glass">
                  <RegisterForm onSwitchToLogin={switchToLogin} />
                </div>
              </motion.div>

              {/* Register: Branding a la derecha */}
              <motion.div
                className="auth-panel auth-panel-branding"
                initial={{ x: -60, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }}
              >
                <BrandingPanel />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
