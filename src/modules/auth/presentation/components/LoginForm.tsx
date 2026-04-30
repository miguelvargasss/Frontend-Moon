import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '../../application/login.schema';
import { useAuth } from '../../application/use-auth.hook';
import Input from '../../../../shared/components/Input';
import Button from '../../../../shared/components/Button';
import { useNavigate } from 'react-router-dom';

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

/**
 * Formulario de login con validación Zod + React Hook Form.
 * Muestra errores inline y feedback de la API.
 */
export default function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const { login, isLoading, error, clearError } = useAuth();

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    clearError();
    try {
      await login(data.email, data.password);
      navigate('/');
      // Redirección se manejará por el router/store
    } catch {
      // Error ya se muestra vía el store
    }
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form-header">
        <h1 className="auth-form-title">Bienvenid@ de vuelta</h1>
        <p className="auth-form-subtitle">Entra a tu universo personalizado 🌙</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
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
          autoComplete="current-password"
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
          Ingresar al portal
        </Button>
      </form>

      <div className="auth-form-switch">
        <span>¿No tienes cuenta?</span>
        <button type="button" className="auth-form-switch-btn" onClick={onSwitchToRegister}>
          Regístrate aquí
        </button>
      </div>
    </div>
  );
}
