/** Modelo de usuario para la vista de administración */
export interface AdminUserModel {
  id: string;
  name: string;
  lastName: string;
  email: string;
  roleId?: string;
  roleName?: string;
  points?: number;
  createdAt?: string;
}
