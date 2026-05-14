import { create } from 'zustand';
import { isAxiosError } from 'axios';
import type { CouponModel, CouponFormData } from '../domain/coupon.model';
import { couponsApi } from '../infrastructure/coupons-api.repository';

interface CouponsState {
  coupons: CouponModel[];
  isLoading: boolean;
  error: string | null;

  fetchCoupons: () => Promise<void>;
  createCoupon: (input: CouponFormData) => Promise<CouponModel>;
  updateCoupon: (id: string, input: Partial<CouponFormData>) => Promise<CouponModel>;
  deleteCoupon: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useCouponsStore = create<CouponsState>((set) => ({
  coupons: [],
  isLoading: false,
  error: null,

  fetchCoupons: async () => {
    set({ isLoading: true, error: null });
    try {
      const coupons = await couponsApi.getAll();
      set({ coupons, isLoading: false });
    } catch (err: unknown) {
      set({
        error: isAxiosError(err)
          ? err.response?.data?.message
          : 'Error al cargar cupones',
        isLoading: false,
      });
    }
  },

  createCoupon: async (input) => {
    set({ isLoading: true, error: null });
    try {
      const created = await couponsApi.create(input);
      set((s) => ({ coupons: [...s.coupons, created], isLoading: false }));
      return created;
    } catch (err: unknown) {
      set({
        error: isAxiosError(err)
          ? err.response?.data?.message
          : 'Error al crear cupón',
        isLoading: false,
      });
      throw err;
    }
  },

  updateCoupon: async (id, input) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await couponsApi.update(id, input);
      set((s) => ({
        coupons: s.coupons.map((c) => (c.id === id ? updated : c)),
        isLoading: false,
      }));
      return updated;
    } catch (err: unknown) {
      set({
        error: isAxiosError(err)
          ? err.response?.data?.message
          : 'Error al actualizar cupón',
        isLoading: false,
      });
      throw err;
    }
  },

  deleteCoupon: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await couponsApi.delete(id);
      set((s) => ({
        coupons: s.coupons.filter((c) => c.id !== id),
        isLoading: false,
      }));
    } catch (err: unknown) {
      set({
        error: isAxiosError(err)
          ? err.response?.data?.message
          : 'Error al eliminar cupón',
        isLoading: false,
      });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
