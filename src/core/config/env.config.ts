/** Configuración centralizada de variables de entorno del frontend */
export const ENV = {
  /** URL base de la API del backend */
  API_URL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
} as const;
