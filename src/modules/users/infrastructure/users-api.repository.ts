import apiClient from '../../../core/http/api-client';
import type { AdminUserModel } from '../domain/user.model';

export const usersApi = {
  /** GET /users/admin/all — Obtener todos los usuarios (admin) */
  async getAll(): Promise<AdminUserModel[]> {
    const { data } = await apiClient.get('/users/admin/all');
    return (data.data ?? []).map(mapUser);
  },
};

interface UserRaw {
  id: string;
  name: string;
  lastName: string;
  email: string;
  roleId: string;
  roleName: string;
  points?: string | number;
  createdAt: string | Date;
}

function mapUser(raw: UserRaw): AdminUserModel {
  return {
    id: raw.id,
    name: raw.name,
    lastName: raw.lastName,
    email: raw.email,
    roleId: raw.roleId,
    roleName: raw.roleName,
    points: raw.points != null ? Number(raw.points) : undefined,
    createdAt: raw.createdAt instanceof Date ? raw.createdAt.toISOString() : String(raw.createdAt),
  };
}
