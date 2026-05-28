import { z } from 'zod';

/** Esquema de validación para el formulario de registro */
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, 'El nombre es obligatorio')
      .max(50, 'El nombre no puede exceder los 50 caracteres')
      .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo debe contener letras'),
    lastName: z
      .string()
      .min(1, 'El apellido es obligatorio')
      .max(50, 'El apellido no puede exceder los 50 caracteres')
      .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El apellido solo debe contener letras'),
    email: z
      .string()
      .min(1, 'El correo es obligatorio')
      .email('Ingresa un correo válido')
      .max(50, 'El correo electrónico no puede exceder los 50 caracteres'),
    password: z
      .string()
      .min(6, 'Mínimo 6 caracteres')
      .max(18, 'Máximo 18 caracteres')
      .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
      .regex(/[a-z]/, 'Debe contener al menos una minúscula')
      .regex(/[\W_]/, 'Debe contener al menos un carácter especial'),
    confirmPassword: z
      .string()
      .min(1, 'Confirma tu contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
