import { create } from 'zustand';
import { isAxiosError } from 'axios';
import type { AdminOrder } from '../domain/admin-order.model';
import { ordersApiRepository } from '../infrastructure/orders-api.repository';

interface MyOrdersState {
  orders: AdminOrder[];
  isLoading: boolean;
  error: string | null;
  fetchMyOrders: () => Promise<void>;
}

export const useMyOrdersStore = create<MyOrdersState>((set) => ({
  orders: [],
  isLoading: false,
  error: null,

  fetchMyOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const orders = await ordersApiRepository.getMyOrders();
      set({ orders, isLoading: false });
    } catch (error: unknown) {
      set({
        error: (isAxiosError(error) ? error.response?.data?.message : undefined) || 'Error al cargar tus pedidos',
        isLoading: false,
      });
    }
  },
}));
