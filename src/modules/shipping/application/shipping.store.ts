import { create } from 'zustand';
import type { ShippingAddress } from '../domain/shipping-address.model';
import { shippingApiRepository } from '../infrastructure/shipping-api.repository';

interface ShippingState {
  addresses: ShippingAddress[];
  isLoading: boolean;
  error: string | null;
  fetchAddresses: () => Promise<void>;
  createAddress: (data: Omit<ShippingAddress, 'id' | 'userId'>) => Promise<ShippingAddress>;
  deleteAddress: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useShippingStore = create<ShippingState>((set) => ({
  addresses: [],
  isLoading: false,
  error: null,

  fetchAddresses: async () => {
    set({ isLoading: true, error: null });
    try {
      const addresses = await shippingApiRepository.getAll();
      set({ addresses, isLoading: false });
    } catch {
      set({ error: 'No se pudieron cargar las direcciones', isLoading: false });
    }
  },

  createAddress: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const address = await shippingApiRepository.create(data);
      set((state) => ({
        addresses: [...state.addresses, address],
        isLoading: false,
      }));
      return address;
    } catch {
      set({ error: 'No se pudo guardar la dirección', isLoading: false });
      throw new Error('Error creando dirección');
    }
  },

  deleteAddress: async (id) => {
    try {
      await shippingApiRepository.remove(id);
      set((state) => ({
        addresses: state.addresses.filter((a) => a.id !== id),
      }));
    } catch {
      set({ error: 'No se pudo eliminar la dirección' });
    }
  },

  clearError: () => set({ error: null }),
}));
