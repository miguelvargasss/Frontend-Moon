import { z } from 'zod';

/** Esquema de validación para el formulario de login */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo es obligatorio')
    .email('Ingresa un correo válido'),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
