import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './Button.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost';
  isLoading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

/**
 * Botón reutilizable con variantes, estado de carga, y animaciones.
 */
export default function Button({
  variant = 'primary',
  isLoading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`mp-btn mp-btn-${variant} ${isLoading ? 'mp-btn-loading' : ''} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="mp-btn-spinner" />
      ) : (
        <>
          {children}
          {icon && <span className="mp-btn-icon">{icon}</span>}
        </>
      )}
    </button>
  );
}
