import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import BrandingPanel from '../components/BrandingPanel';

/**
 * Página de autenticación con transición animada Login ↔ Register.
 *
 * Layout:
 * - LOGIN:    [Branding | LoginForm]     (branding izquierda, form derecha)
 * - REGISTER: [RegisterForm | Branding]  (form izquierda, branding derecha)
 */
export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const switchToRegister = () => setMode('register');
  const switchToLogin = () => setMode('login');

  return (
    <div className="relative min-h-screen overflow-hidden bg-moon-bg">
      {/* Fondo de estrellas sutil */}
      <div className="auth-stars" />
      <div className="auth-stars auth-stars-2" />

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <AnimatePresence mode="wait">
          {mode === 'login' ? (
            <motion.div
              key="login-layout"
              className="flex w-full max-w-[900px] overflow-hidden rounded-2xl border border-[--glass-border] shadow-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Login: Branding a la izquierda */}
              <motion.div
                className="relative hidden w-1/2 overflow-hidden bg-moon-bg-secondary md:block"
                initial={{ x: 60, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
              >
                <BrandingPanel />
              </motion.div>

              {/* Login: Form a la derecha */}
              <motion.div
                className="flex w-full items-center justify-center bg-[--glass-bg] p-8 backdrop-blur-xl md:w-1/2 md:p-10"
                initial={{ x: -60, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }}
              >
                <div className="w-full max-w-sm">
                  <LoginForm onSwitchToRegister={switchToRegister} />
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="register-layout"
              className="flex w-full max-w-[900px] overflow-hidden rounded-2xl border border-[--glass-border] shadow-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Register: Form a la izquierda */}
              <motion.div
                className="flex w-full items-center justify-center bg-[--glass-bg] p-8 backdrop-blur-xl md:w-1/2 md:p-10"
                initial={{ x: 60, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
              >
                <div className="w-full max-w-sm">
                  <RegisterForm onSwitchToLogin={switchToLogin} />
                </div>
              </motion.div>

              {/* Register: Branding a la derecha */}
              <motion.div
                className="relative hidden w-1/2 overflow-hidden bg-moon-bg-secondary md:block"
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
