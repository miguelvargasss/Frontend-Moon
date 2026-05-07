import apiClient from '../../../core/http/api-client';
import type { CartItem } from '../domain/cart-item.model';

/**
 * Repositorio del carrito — comunicación con el backend REST.
 * Requiere autenticación (JWT en header).
 */
export const cartApiRepository = {
  /** GET /cart — Obtener ítems del carrito */
  async getAll(): Promise<CartItem[]> {
    const { data } = await apiClient.get('/cart');
    return data.data ?? [];
  },

  /** POST /cart/items — Agregar un producto al carrito */
  async addItem(productId: string, quantity: number): Promise<CartItem> {
    const { data } = await apiClient.post('/cart/items', { productId, quantity });
    return data.data;
  },

  /** PATCH /cart/items/:id — Actualizar cantidad */
  async updateItem(itemId: string, quantity: number): Promise<CartItem> {
    const { data } = await apiClient.patch(`/cart/items/${itemId}`, { quantity });
    return data.data;
  },

  /** DELETE /cart/items/:id — Eliminar ítem */
  async removeItem(itemId: string): Promise<void> {
    await apiClient.delete(`/cart/items/${itemId}`);
  },

  /** DELETE /cart — Vaciar carrito */
  async clearCart(): Promise<void> {
    await apiClient.delete('/cart');
  },

  /** POST /coupons/validate — Validar cupón */
  async validateCoupon(code: string): Promise<{ discountAmount: number }> {
    const { data } = await apiClient.post('/coupons/validate', { code });
    return data.data;
  },
};
