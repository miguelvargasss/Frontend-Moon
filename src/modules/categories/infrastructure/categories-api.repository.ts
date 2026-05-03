import apiClient from '../../../core/http/api-client';
import type { CategoryModel } from '../domain/category.model';

/**
 * Repositorio API para categorías.
 * Se comunica con el backend NestJS via Axios.
 */
export const categoriesApi = {
  async getAll(): Promise<CategoryModel[]> {
    const { data } = await apiClient.get('/categories');
    return (data.data ?? []).map((c: any) => ({
      id: c.id,
      name: c.name,
      icon: c.icon ?? 'package',
    }));
  },

  async create(input: { name: string; icon?: string }): Promise<CategoryModel> {
    const { data } = await apiClient.post('/categories', input);
    const c = data.data;
    return { id: c.id, name: c.name, icon: c.icon ?? 'package' };
  },

  async update(id: string, input: { name?: string; icon?: string }): Promise<CategoryModel> {
    const { data } = await apiClient.patch(`/categories/${id}`, input);
    const c = data.data;
    return { id: c.id, name: c.name, icon: c.icon ?? 'package' };
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/categories/${id}`);
  },
};
