import apiClient from '../../../core/http/api-client';
import type { Category } from '../domain/category.model';

/**
 * Repositorio de categorías — se comunica con el backend REST.
 * Solo lectura pública (no requiere autenticación).
 */
export const categoriesApiRepository = {
  /**
   * Obtiene todas las categorías.
   * GET /categories
   */
  async getAll(): Promise<Category[]> {
    const { data } = await apiClient.get('/categories');
    return data.data ?? [];
  },
};
