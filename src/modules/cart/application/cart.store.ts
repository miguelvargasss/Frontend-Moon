import { create } from 'zustand';
import type { CartItem } from '../domain/cart-item.model';
import { cartApiRepository } from '../infrastructure/cart-api.repository';

interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
  couponCode: string | null;
  discount: number;
  couponError: string | null;
  /** Cargar carrito del usuario */
  fetchCart: () => Promise<void>;
  /** Agregar producto al carrito */
  addItem: (productId: string, quantity: number) => Promise<void>;
  /** Actualizar cantidad de un ítem */
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  /** Eliminar ítem */
  removeItem: (itemId: string) => Promise<void>;
  /** Vaciar carrito */
  clearCart: () => Promise<void>;
  /** Validar cupón */
  applyCoupon: (code: string) => Promise<void>;
  /** Limpiar cupón */
  clearCoupon: () => void;
  /** Número total de items */
  totalItems: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  loading: false,
  error: null,
  couponCode: null,
  discount: 0,
  couponError: null,

  fetchCart: async () => {
    set({ loading: true, error: null });
    try {
      const items = await cartApiRepository.getAll();
      set({ items, loading: false });
    } catch {
      set({ error: 'No se pudo cargar el carrito', loading: false });
    }
  },

  addItem: async (productId, quantity) => {
    try {
      await cartApiRepository.addItem(productId, quantity);
      await get().fetchCart();
    } catch {
      set({ error: 'No se pudo agregar al carrito' });
    }
  },

  updateItem: async (itemId, quantity) => {
    try {
      await cartApiRepository.updateItem(itemId, quantity);
      await get().fetchCart();
    } catch {
      set({ error: 'No se pudo actualizar la cantidad' });
    }
  },

  removeItem: async (itemId) => {
    try {
      await cartApiRepository.removeItem(itemId);
      set((state) => ({
        items: state.items.filter((i) => i.id !== itemId),
      }));
    } catch {
      set({ error: 'No se pudo eliminar el producto' });
    }
  },

  clearCart: async () => {
    try {
      await cartApiRepository.clearCart();
      set({ items: [], couponCode: null, discount: 0 });
    } catch {
      set({ error: 'No se pudo vaciar el carrito' });
    }
  },

  applyCoupon: async (code) => {
    set({ couponError: null });
    try {
      const result = await cartApiRepository.validateCoupon(code);
      set({
        couponCode: code,
        discount: result.discountAmount ?? 0,
        couponError: null,
      });
    } catch {
      set({ couponError: 'Cupón inválido o expirado', discount: 0, couponCode: null });
    }
  },

  clearCoupon: () => set({ couponCode: null, discount: 0, couponError: null }),

  totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
}));
