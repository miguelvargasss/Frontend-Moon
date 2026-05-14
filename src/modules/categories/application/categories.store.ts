import { create } from 'zustand';
import { isAxiosError } from 'axios';
import type { CategoryModel } from '../domain/category.model';
import type { SizeSystemModel } from '../../products/domain/product.model';
import { categoriesApi } from '../infrastructure/categories-api.repository';

interface CategoriesState {
  categories: CategoryModel[];
  sizeSystems: SizeSystemModel[];
  isLoading: boolean;
  error: string | null;

  fetchCategories: () => Promise<void>;
  createCategory: (input: { name: string; icon?: string }) => Promise<void>;
  updateCategory: (id: string, input: { name?: string; icon?: string }) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  fetchSizeSystems: () => Promise<void>;
  createSizeSystem: (name: string) => Promise<void>;
  updateSizeSystem: (id: string, name: string) => Promise<void>;
  deleteSizeSystem: (id: string) => Promise<void>;
  addSizeOption: (systemId: string, label: string, sortOrder?: number) => Promise<void>;
  deleteSizeOption: (systemId: string, optionId: string) => Promise<void>;

  clearError: () => void;
}

export const useCategoriesStore = create<CategoriesState>((set) => ({
  categories: [],
  sizeSystems: [],
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const categories = await categoriesApi.getAll();
      set({ categories, isLoading: false });
    } catch (err: unknown) {
      set({ error: isAxiosError(err) ? err.response?.data?.message : 'Error al cargar categorías', isLoading: false });
    }
  },

  createCategory: async (input) => {
    set({ isLoading: true, error: null });
    try {
      const created = await categoriesApi.create(input);
      set((s) => ({ categories: [...s.categories, created], isLoading: false }));
    } catch (err: unknown) {
      set({ error: isAxiosError(err) ? err.response?.data?.message : 'Error al crear categoría', isLoading: false });
      throw err;
    }
  },

  updateCategory: async (id, input) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await categoriesApi.update(id, input);
      set((s) => ({
        categories: s.categories.map((c) => (c.id === id ? updated : c)),
        isLoading: false,
      }));
    } catch (err: unknown) {
      set({ error: isAxiosError(err) ? err.response?.data?.message : 'Error al actualizar categoría', isLoading: false });
      throw err;
    }
  },

  deleteCategory: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await categoriesApi.delete(id);
      set((s) => ({
        categories: s.categories.filter((c) => c.id !== id),
        isLoading: false,
      }));
    } catch (err: unknown) {
      set({ error: isAxiosError(err) ? err.response?.data?.message : 'Error al eliminar categoría', isLoading: false });
      throw err;
    }
  },

  // ── Size Systems ──
  fetchSizeSystems: async () => {
    try {
      const sizeSystems = await categoriesApi.getSizeSystems();
      set({ sizeSystems });
    } catch (err: unknown) {
      console.error('Error cargando sistemas de tallas', err);
    }
  },

  createSizeSystem: async (name) => {
    set({ isLoading: true, error: null });
    try {
      const created = await categoriesApi.createSizeSystem(name);
      set((s) => ({ sizeSystems: [...s.sizeSystems, created], isLoading: false }));
    } catch (err: unknown) {
      set({ error: isAxiosError(err) ? err.response?.data?.message : 'Error al crear sistema', isLoading: false });
      throw err;
    }
  },

  updateSizeSystem: async (id, name) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await categoriesApi.updateSizeSystem(id, name);
      set((s) => ({
        sizeSystems: s.sizeSystems.map((ss) => (ss.id === id ? updated : ss)),
        isLoading: false,
      }));
    } catch (err: unknown) {
      set({ error: isAxiosError(err) ? err.response?.data?.message : 'Error al actualizar sistema', isLoading: false });
      throw err;
    }
  },

  deleteSizeSystem: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await categoriesApi.deleteSizeSystem(id);
      set((s) => ({
        sizeSystems: s.sizeSystems.filter((ss) => ss.id !== id),
        isLoading: false,
      }));
    } catch (err: unknown) {
      set({ error: isAxiosError(err) ? err.response?.data?.message : 'Error al eliminar sistema', isLoading: false });
      throw err;
    }
  },

  addSizeOption: async (systemId, label, sortOrder) => {
    try {
      const option = await categoriesApi.addSizeOption(systemId, label, sortOrder);
      set((s) => ({
        sizeSystems: s.sizeSystems.map((ss) =>
          ss.id === systemId ? { ...ss, options: [...ss.options, option] } : ss,
        ),
      }));
    } catch (err: unknown) {
      console.error('Error agregando opción', err);
      throw err;
    }
  },

  deleteSizeOption: async (systemId, optionId) => {
    try {
      await categoriesApi.deleteSizeOption(systemId, optionId);
      set((s) => ({
        sizeSystems: s.sizeSystems.map((ss) =>
          ss.id === systemId
            ? { ...ss, options: ss.options.filter((o) => o.id !== optionId) }
            : ss,
        ),
      }));
    } catch (err: unknown) {
      console.error('Error eliminando opción', err);
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
