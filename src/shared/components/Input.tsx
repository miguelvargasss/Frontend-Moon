import { forwardRef, useState } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import './Input.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: ReactNode;
  error?: string;
  /** Muestra botón para toggle de visibilidad (password) */
  togglePassword?: boolean;
}

/**
 * Input reutilizable con icono, label flotante, y estado de error.
 * Diseñado con glassmorphism y glow verde al focus.
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon, error, togglePassword, type, className = '', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputType = togglePassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className={`mp-input-group ${error ? 'mp-input-error' : ''} ${className}`}>
        <label className="mp-input-label">{label}</label>
        <div className="mp-input-wrapper">
          {icon && <span className="mp-input-icon">{icon}</span>}
          <input
            ref={ref}
            type={inputType}
            className="mp-input"
            placeholder=" "
            {...props}
          />
          {togglePassword && (
            <button
              type="button"
              className="mp-input-toggle"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          )}
        </div>
        {error && <span className="mp-input-error-msg">{error}</span>}
      </div>
    );
  },
);

Input.displayName = 'Input';
export default Input;
