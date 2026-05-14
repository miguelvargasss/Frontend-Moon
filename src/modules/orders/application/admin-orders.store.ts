import { create } from 'zustand';
import type { AdminOrder, OrderStatus } from '../domain/admin-order.model';
import { adminOrdersApiRepository } from '../infrastructure/admin-orders-api.repository';

interface AdminOrdersState {
  orders: AdminOrder[];
  statuses: OrderStatus[];
  isLoading: boolean;
  error: string | null;

  fetchOrders: () => Promise<void>;
  fetchStatuses: () => Promise<void>;
  updateOrderStatus: (orderId: string, newStatusName: string) => Promise<void>;
}

export const useAdminOrdersStore = create<AdminOrdersState>((set) => ({
  orders: [],
  statuses: [],
  isLoading: false,
  error: null,

  fetchOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const orders = await adminOrdersApiRepository.getAllOrders();
      set({ orders, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Error al cargar los pedidos',
        isLoading: false,
      });
    }
  },

  fetchStatuses: async () => {
    try {
      const statuses = await adminOrdersApiRepository.getAllStatuses();
      set({ statuses });
    } catch (error) {
      console.error('Error fetching statuses:', error);
    }
  },

  updateOrderStatus: async (orderId: string, newStatusName: string) => {
    try {
      await adminOrdersApiRepository.updateOrderStatus(orderId, newStatusName);
      
      // Update local cache
      set((state) => ({
        orders: state.orders.map((o) =>
          o.id === orderId ? { ...o, statusName: newStatusName } : o
        ),
      }));
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al actualizar el estado');
    }
  },
}));
