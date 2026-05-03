import { create } from 'zustand';
import type { ProductModel, ProductVariantModel } from '../domain/product.model';
import { productsApi } from '../infrastructure/products-api.repository';

interface ProductsState {
  products: ProductModel[];
  isLoading: boolean;
  error: string | null;

  fetchProducts: (categoryId?: string) => Promise<void>;
  createProduct: (input: {
    name: string;
    price: number;
    description?: string;
    specification?: string;
    sizeType?: string;
    categoryId?: string;
    variants?: Omit<ProductVariantModel, 'id'>[];
  }) => Promise<ProductModel>;
  updateProduct: (id: string, input: any) => Promise<ProductModel>;
  deleteProduct: (id: string) => Promise<void>;
  uploadImage: (productId: string, file: File) => Promise<{ id: string; url: string }>;
  deleteImage: (productId: string, imageId: string) => Promise<void>;
  clearError: () => void;
}

export const useProductsStore = create<ProductsState>((set) => ({
  products: [],
  isLoading: false,
  error: null,

  fetchProducts: async (categoryId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const products = await productsApi.getAll(categoryId);
      set({ products, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message ?? 'Error al cargar productos', isLoading: false });
    }
  },

  createProduct: async (input) => {
    set({ isLoading: true, error: null });
    try {
      const created = await productsApi.create(input);
      set((s) => ({ products: [...s.products, created], isLoading: false }));
      return created;
    } catch (err: any) {
      set({ error: err.response?.data?.message ?? 'Error al crear producto', isLoading: false });
      throw err;
    }
  },

  updateProduct: async (id, input) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await productsApi.update(id, input);
      set((s) => ({
        products: s.products.map((p) => (p.id === id ? updated : p)),
        isLoading: false,
      }));
      return updated;
    } catch (err: any) {
      set({ error: err.response?.data?.message ?? 'Error al actualizar producto', isLoading: false });
      throw err;
    }
  },

  deleteProduct: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await productsApi.delete(id);
      set((s) => ({
        products: s.products.filter((p) => p.id !== id),
        isLoading: false,
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.message ?? 'Error al eliminar producto', isLoading: false });
      throw err;
    }
  },

  uploadImage: async (productId, file) => {
    try {
      const image = await productsApi.uploadImage(productId, file);
      // Refresh products to get updated images
      const products = await productsApi.getAll();
      set({ products });
      return image;
    } catch (err: any) {
      throw err;
    }
  },

  deleteImage: async (productId, imageId) => {
    try {
      await productsApi.deleteImage(productId, imageId);
      const products = await productsApi.getAll();
      set({ products });
    } catch (err: any) {
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
