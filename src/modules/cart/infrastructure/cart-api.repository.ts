import apiClient from '../../../core/http/api-client';
import type { CartItem } from '../domain/cart-item.model';

/**
 * Mapea la respuesta del backend al modelo del frontend.
 * El backend ahora retorna datos enriquecidos del producto.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCartItem(raw: any): CartItem {
  return {
    id: raw.id,
    userId: raw.userId,
    productId: raw.productId,
    quantity: raw.quantity,
    variantId: raw.variantId ?? undefined,
    productName: raw.productName ?? 'Producto',
    productPrice: raw.productPrice ?? 0,
    productImage: raw.productImage ?? null,
    variantLabel: raw.variantLabel ?? null,
    variantColor: raw.variantColor ?? null,
  };
}

/**
 * Repositorio del carrito — comunicación con el backend REST.
 * Requiere autenticación (JWT en header).
 */
export const cartApiRepository = {
  /** GET /cart — Obtener ítems del carrito (enriquecidos con datos del producto) */
  async getAll(): Promise<CartItem[]> {
    const { data } = await apiClient.get('/cart');
    return (data.data ?? []).map(mapCartItem);
  },

  /** POST /cart/items — Agregar un producto al carrito */
  async addItem(productId: string, quantity: number, variantId?: string): Promise<CartItem> {
    const payload: Record<string, unknown> = { productId, quantity };
    if (variantId) payload.variantId = variantId;
    const { data } = await apiClient.post('/cart/items', payload);
    return mapCartItem(data.data);
  },

  /** PATCH /cart/items/:id — Actualizar cantidad */
  async updateItem(itemId: string, quantity: number): Promise<CartItem> {
    const { data } = await apiClient.patch(`/cart/items/${itemId}`, { quantity });
    return mapCartItem(data.data);
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
