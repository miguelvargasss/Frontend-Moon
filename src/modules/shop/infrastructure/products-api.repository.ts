import apiClient from '../../../core/http/api-client';
import type { Product } from '../domain/product.model';

/**
 * Repositorio de productos — se comunica con el backend REST.
 * Solo lectura pública (no requiere autenticación).
 */
export const productsApiRepository = {
  /**
   * Obtiene todos los productos, opcionalmente filtrados por categoría.
   * GET /products o GET /products?categoryId=xxx
   */
  async getAll(categoryId?: string): Promise<Product[]> {
    const params = categoryId ? { categoryId } : {};
    const { data } = await apiClient.get('/products', { params });
    return data.data ?? [];
  },

  /**
   * Obtiene un producto por su ID, incluyendo imágenes.
   * GET /products/:id
   */
  async getById(id: string): Promise<Product> {
    const { data } = await apiClient.get(`/products/${id}`);
    return data.data;
  },
};
