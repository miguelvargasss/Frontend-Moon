import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input, Button } from '@nextui-org/react';
import { registerSchema, type RegisterFormData } from '../../application/register.schema';
import { useAuth } from '../../application/use-auth.hook';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

const PasswordToggle = ({ show, onToggle }: { show: boolean; onToggle: () => void }) => (
  <button type="button" className="text-default-400 hover:text-foreground transition-colors" onClick={onToggle} tabIndex={-1}>
    {show ? (
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
);

/**
 * Item de la lista de requerimientos de contraseña.
 */
const RequirementItem = ({ label, satisfied }: { label: string; satisfied: boolean }) => (
  <div className={`flex items-center gap-2 text-xs transition-colors ${satisfied ? 'text-success' : 'text-default-400'}`}>
    <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all ${satisfied ? 'bg-success border-success' : 'border-default-300'}`}>
      {satisfied && (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4">
          <polyline points="20,6 9,17 4,12" />
        </svg>
      )}
    </div>
    <span>{label}</span>
  </div>
);

/**
 * Formulario de registro con 5 campos (Nombre, Apellido, Email, Contraseña, Confirmar).
 */
export default function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const { register: registerUser, isLoading, error, clearError } = useAuth();
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
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

  const passwordValue = watch('password') || '';

  const requirements = [
    { label: 'Entre 6 y 18 caracteres', satisfied: passwordValue.length >= 6 && passwordValue.length <= 18 },
    { label: 'Al menos una mayúscula', satisfied: /[A-Z]/.test(passwordValue) },
    { label: 'Al menos una minúscula', satisfied: /[a-z]/.test(passwordValue) },
    { label: 'Un carácter especial (ej: !@#$%)', satisfied: /[\W_]/.test(passwordValue) },
  ];

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
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary text-2xl font-bold">
          ✓
        </div>
        <h1 className="font-display text-3xl font-semibold text-foreground">¡Cuenta creada!</h1>
        <p className="text-sm text-default-500">
          Tu universo personalizado te espera. Inicia sesión para explorar.
        </p>
        <Button color="primary" size="lg" className="font-semibold" onPress={onSwitchToLogin}>
          Iniciar sesión
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="font-display text-3xl font-semibold text-foreground">Crea tu universo</h1>
        <p className="mt-2 text-sm text-default-500">Tu historia bajo la luna comienza aquí</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Nombre"
            type="text"
            autoComplete="given-name"
            variant="bordered"
            classNames={{
              inputWrapper: "border-default-200 data-[hover=true]:border-primary/50 group-data-[focus=true]:border-primary bg-default-100/50",
            }}
            startContent={
              <svg className="text-default-400 flex-shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            }
            maxLength={50}
            isInvalid={!!errors.name}
            errorMessage={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="Apellido"
            type="text"
            autoComplete="family-name"
            variant="bordered"
            classNames={{
              inputWrapper: "border-default-200 data-[hover=true]:border-primary/50 group-data-[focus=true]:border-primary bg-default-100/50",
            }}
            startContent={
              <svg className="text-default-400 flex-shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            }
            maxLength={50}
            isInvalid={!!errors.lastName}
            errorMessage={errors.lastName?.message}
            {...register('lastName')}
          />
        </div>

        <Input
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          variant="bordered"
          classNames={{
            inputWrapper: "border-default-200 data-[hover=true]:border-primary/50 group-data-[focus=true]:border-primary bg-default-100/50",
          }}
          startContent={
            <svg className="text-default-400 flex-shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M22 4l-10 8L2 4" />
            </svg>
          }
          maxLength={50}
          isInvalid={!!errors.email}
          errorMessage={errors.email?.message}
          {...register('email')}
        />

        <div className="flex flex-col gap-2">
          <Input
            label="Contraseña"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            variant="bordered"
            classNames={{
              inputWrapper: "border-default-200 data-[hover=true]:border-primary/50 group-data-[focus=true]:border-primary bg-default-100/50",
            }}
            startContent={
              <svg className="text-default-400 flex-shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            }
            endContent={<PasswordToggle show={showPassword} onToggle={() => setShowPassword(!showPassword)} />}
            maxLength={18}
            isInvalid={!!errors.password}
            errorMessage={errors.password?.message}
            {...register('password')}
            onFocus={() => setIsPasswordFocused(true)}
            onBlur={(e) => {
              register('password').onBlur(e);
              setIsPasswordFocused(false);
            }}
          />

          {isPasswordFocused && (
            <div className="flex flex-col gap-1.5 p-3 rounded-xl border border-default-200 bg-default-50/50 animate-appearance-in">
              <p className="text-[10px] font-semibold text-default-500 uppercase tracking-wider mb-1">Requisitos de seguridad:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                {requirements.map((req, idx) => (
                  <RequirementItem key={idx} label={req.label} satisfied={req.satisfied} />
                ))}
              </div>
            </div>
          )}
        </div>

        <Input
          label="Confirmar contraseña"
          type={showConfirm ? 'text' : 'password'}
          autoComplete="new-password"
          variant="bordered"
          classNames={{
            inputWrapper: "border-default-200 data-[hover=true]:border-primary/50 group-data-[focus=true]:border-primary bg-default-100/50",
          }}
          startContent={
            <svg className="text-default-400 flex-shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              <circle cx="12" cy="16" r="1" />
            </svg>
          }
          endContent={<PasswordToggle show={showConfirm} onToggle={() => setShowConfirm(!showConfirm)} />}
          maxLength={18}
          isInvalid={!!errors.confirmPassword}
          errorMessage={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-danger/10 border border-danger/30 px-3 py-2 text-sm text-danger">
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
          color="primary"
          size="lg"
          isLoading={isLoading}
          className="font-semibold"
          endContent={
            !isLoading && (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            )
          }
        >
          Crear cuenta
        </Button>
      </form>

      <div className="flex items-center justify-center gap-2 text-sm text-default-500">
        <span>¿Ya tienes cuenta?</span>
        <button type="button" className="font-semibold text-primary hover:underline" onClick={onSwitchToLogin}>
          Inicia sesión
        </button>
      </div>
    </div>
  );
}
