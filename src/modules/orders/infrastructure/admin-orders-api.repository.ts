import apiClient from '../../../core/http/api-client';
import type { AdminOrder, OrderStatus } from '../domain/admin-order.model';

export const adminOrdersApiRepository = {
  /** GET /orders/admin/all — Obtener todos los pedidos */
  async getAllOrders(): Promise<AdminOrder[]> {
    const { data } = await apiClient.get('/orders/admin/all');
    return data.data;
  },

  /** GET /orders/admin/statuses — Obtener todos los estados de pedido */
  async getAllStatuses(): Promise<OrderStatus[]> {
    const { data } = await apiClient.get('/orders/admin/statuses');
    return data.data;
  },

  /** PATCH /orders/admin/:id/status — Actualizar el estado de un pedido */
  async updateOrderStatus(orderId: string, statusName: string): Promise<void> {
    await apiClient.patch(`/orders/admin/${orderId}/status`, { status: statusName });
  },
};
