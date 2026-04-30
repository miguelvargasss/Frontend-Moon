/** Datos del usuario autenticado en el sistema */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  lastName: string;
  role: 'admin' | 'comprador';
}
