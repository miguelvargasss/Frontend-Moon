import apiClient from '../../../core/http/api-client';
import type { CategoryModel } from '../domain/category.model';
import type { SizeSystemModel, SizeOptionModel } from '../../products/domain/product.model';

interface CategoryRaw {
  id: string;
  name: string;
  icon?: string;
}

/**
 * Repositorio API para categorías y sistemas de tallas.
 * Se comunica con el backend NestJS via Axios.
 */
export const categoriesApi = {
  // ── Categorías ──
  async getAll(): Promise<CategoryModel[]> {
    const { data } = await apiClient.get('/categories');
    return (data.data ?? []).map((c: CategoryRaw) => ({
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

  // ── Sistemas de Tallas ──
  async getSizeSystems(): Promise<SizeSystemModel[]> {
    const { data } = await apiClient.get('/categories/size-systems');
    return data.data ?? [];
  },

  async createSizeSystem(name: string): Promise<SizeSystemModel> {
    const { data } = await apiClient.post('/categories/size-systems', { name });
    return data.data;
  },

  async updateSizeSystem(id: string, name: string): Promise<SizeSystemModel> {
    const { data } = await apiClient.patch(`/categories/size-systems/${id}`, { name });
    return data.data;
  },

  async deleteSizeSystem(id: string): Promise<void> {
    await apiClient.delete(`/categories/size-systems/${id}`);
  },

  async addSizeOption(systemId: string, label: string, sortOrder?: number): Promise<SizeOptionModel> {
    const { data } = await apiClient.post(`/categories/size-systems/${systemId}/options`, {
      label,
      sortOrder,
    });
    return data.data;
  },

  async deleteSizeOption(systemId: string, optionId: string): Promise<void> {
    await apiClient.delete(`/categories/size-systems/${systemId}/options/${optionId}`);
  },
};
