import apiClient from '../../../core/http/api-client';
import type { AdminOrder } from '../domain/admin-order.model';

export interface OrderResponse {
  order: {
    id: string;
    orderCode: string;
    date: string;
  };
  total: number;
  discount: number;
  whatsappUrl: string;
  pointsEarned?: number;
  totalPoints?: number;
}

export const ordersApiRepository = {
  /** POST /orders — Crear pedido */
  async createOrder(shippingAddressId: string, couponCode?: string): Promise<OrderResponse> {
    const payload: Record<string, string> = { shippingAddressId };
    if (couponCode) payload.couponCode = couponCode;
    const { data } = await apiClient.post('/orders', payload);
    return data.data;
  },

  /** GET /orders — Obtener mis pedidos */
  async getMyOrders(): Promise<AdminOrder[]> {
    const { data } = await apiClient.get('/orders');
    return data.data;
  },
};
