import { create } from 'zustand';
import type { CategoryModel } from '../domain/category.model';
import { categoriesApi } from '../infrastructure/categories-api.repository';

interface CategoriesState {
  categories: CategoryModel[];
  isLoading: boolean;
  error: string | null;

  fetchCategories: () => Promise<void>;
  createCategory: (input: { name: string; icon?: string }) => Promise<void>;
  updateCategory: (id: string, input: { name?: string; icon?: string }) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useCategoriesStore = create<CategoriesState>((set) => ({
  categories: [],
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const categories = await categoriesApi.getAll();
      set({ categories, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message ?? 'Error al cargar categorías', isLoading: false });
    }
  },

  createCategory: async (input) => {
    set({ isLoading: true, error: null });
    try {
      const created = await categoriesApi.create(input);
      set((s) => ({ categories: [...s.categories, created], isLoading: false }));
    } catch (err: any) {
      set({ error: err.response?.data?.message ?? 'Error al crear categoría', isLoading: false });
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
    } catch (err: any) {
      set({ error: err.response?.data?.message ?? 'Error al actualizar categoría', isLoading: false });
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
    } catch (err: any) {
      set({ error: err.response?.data?.message ?? 'Error al eliminar categoría', isLoading: false });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
