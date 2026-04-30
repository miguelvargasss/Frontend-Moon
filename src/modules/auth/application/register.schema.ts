import { z } from 'zod';

/** Esquema de validación para el formulario de registro */
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, 'El nombre es obligatorio')
      .min(2, 'El nombre debe tener al menos 2 caracteres'),
    lastName: z
      .string()
      .min(1, 'El apellido es obligatorio')
      .min(2, 'El apellido debe tener al menos 2 caracteres'),
    email: z
      .string()
      .min(1, 'El correo es obligatorio')
      .email('Ingresa un correo válido'),
    password: z
      .string()
      .min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirmPassword: z
      .string()
      .min(1, 'Confirma tu contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
