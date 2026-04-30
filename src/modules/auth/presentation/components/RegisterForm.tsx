import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterFormData } from '../../application/register.schema';
import { useAuth } from '../../application/use-auth.hook';
import Input from '../../../../shared/components/Input';
import Button from '../../../../shared/components/Button';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

/**
 * Formulario de registro con 5 campos (Nombre, Apellido, Email, Contraseña, Confirmar).
 * NO permite crear usuarios admin — solo comprador.
 * Confirmar contraseña es validación solo frontend.
 */
export default function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const { register: registerUser, isLoading, error, clearError } = useAuth();
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    clearError();
    try {
      await registerUser(data.email, data.password, data.name, data.lastName);
      setSuccess(true);
    } catch {
      // Error se muestra vía el store
    }
  };

  if (success) {
    return (
      <div className="auth-form-container">
        <div className="auth-form-header">
          <div className="auth-success-icon">✓</div>
          <h1 className="auth-form-title">¡Cuenta creada!</h1>
          <p className="auth-form-subtitle">
            Tu universo personalizado te espera. Inicia sesión para explorar.
          </p>
        </div>
        <Button type="button" onClick={onSwitchToLogin}>
          Iniciar sesión
        </Button>
      </div>
    );
  }

  return (
    <div className="auth-form-container">
      <div className="auth-form-header">
        <h1 className="auth-form-title">Crea tu universo 🌙</h1>
        <p className="auth-form-subtitle">Tu historia bajo la luna comienza aquí</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
        <div className="auth-form-row">
          <Input
            label="Nombre"
            type="text"
            autoComplete="given-name"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            }
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="Apellido"
            type="text"
            autoComplete="family-name"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            }
            error={errors.lastName?.message}
            {...register('lastName')}
          />
        </div>

        <Input
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M22 4l-10 8L2 4" />
            </svg>
          }
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Contraseña"
          type="password"
          autoComplete="new-password"
          togglePassword
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          }
          error={errors.password?.message}
          {...register('password')}
        />

        <Input
          label="Confirmar contraseña"
          type="password"
          autoComplete="new-password"
          togglePassword
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              <circle cx="12" cy="16" r="1" />
            </svg>
          }
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        {error && (
          <div className="auth-form-api-error">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            {error}
          </div>
        )}

        <Button
          type="submit"
          isLoading={isLoading}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          }
        >
          Crear cuenta
        </Button>
      </form>

      <div className="auth-form-switch">
        <span>¿Ya tienes cuenta?</span>
        <button type="button" className="auth-form-switch-btn" onClick={onSwitchToLogin}>
          Inicia sesión
        </button>
      </div>
    </div>
  );
}
