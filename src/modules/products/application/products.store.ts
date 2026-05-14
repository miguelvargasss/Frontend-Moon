import { create } from 'zustand';
import { isAxiosError } from 'axios';
import type { ProductModel, ProductVariantModel, SizeSystemModel } from '../domain/product.model';
import { productsApi } from '../infrastructure/products-api.repository';

interface ProductsState {
  products: ProductModel[];
  isLoading: boolean;
  error: string | null;
  statuses: { id: string; name: string }[];
  sizeSystems: SizeSystemModel[];

  fetchStatuses: () => Promise<void>;
  fetchSizeSystems: () => Promise<void>;

  fetchProducts: (categoryId?: string) => Promise<void>;
  createProduct: (input: {
    name: string;
    productType: 'single' | 'multiple';
    price?: number;
    stock?: number;
    sku?: string;
    description?: string;
    specification?: string;
    sizeSystemId?: string;
    categoryId?: string;
    statusId?: string;
    variants?: Omit<ProductVariantModel, 'id'>[];
    styles?: { name: string; colorHex?: string; variants: Omit<ProductVariantModel, 'id'>[] }[];
  }) => Promise<ProductModel>;
  updateProduct: (id: string, input: {
    name?: string;
    price?: number;
    stock?: number;
    sku?: string;
    description?: string;
    specification?: string;
    sizeSystemId?: string;
    categoryId?: string;
    statusId?: string;
    variants?: Omit<ProductVariantModel, 'id'>[];
    styles?: { name: string; colorHex?: string; variants: Omit<ProductVariantModel, 'id'>[] }[];
  }) => Promise<ProductModel>;
  deleteProduct: (id: string) => Promise<void>;
  uploadImage: (productId: string, file: File, styleId?: string) => Promise<{ id: string; url: string; styleId?: string }>;
  deleteImage: (productId: string, imageId: string) => Promise<void>;
  clearError: () => void;
}

export const useProductsStore = create<ProductsState>((set) => ({
  products: [],
  statuses: [],
  sizeSystems: [],
  isLoading: false,
  error: null,

  fetchStatuses: async () => {
    try {
      const statuses = await productsApi.getStatuses();
      set({ statuses });
    } catch (err: unknown) {
      console.error("Error cargando estados", err);
    }
  },

  fetchSizeSystems: async () => {
    try {
      const sizeSystems = await productsApi.getSizeSystems();
      set({ sizeSystems });
    } catch (err: unknown) {
      console.error("Error cargando sistemas de tallas", err);
    }
  },

  fetchProducts: async (categoryId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const products = await productsApi.getAll(categoryId);
      set({ products, isLoading: false });
    } catch (err: unknown) {
      set({ error: isAxiosError(err) ? err.response?.data?.message : 'Error al cargar productos', isLoading: false });
    }
  },

  createProduct: async (input) => {
    set({ isLoading: true, error: null });
    try {
      const created = await productsApi.create(input);
      set((s) => ({ products: [...s.products, created], isLoading: false }));
      return created;
    } catch (err: unknown) {
      set({ error: isAxiosError(err) ? err.response?.data?.message : 'Error al crear producto', isLoading: false });
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
    } catch (err: unknown) {
      set({ error: isAxiosError(err) ? err.response?.data?.message : 'Error al actualizar producto', isLoading: false });
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
    } catch (err: unknown) {
      set({ error: isAxiosError(err) ? err.response?.data?.message : 'Error al eliminar producto', isLoading: false });
      throw err;
    }
  },

  uploadImage: async (productId, file, styleId?) => {
    const image = await productsApi.uploadImage(productId, file, styleId);
    // Refresh products to get updated images
    const products = await productsApi.getAll();
    set({ products });
    return image;
  },

  deleteImage: async (productId, imageId) => {
    await productsApi.deleteImage(productId, imageId);
    const products = await productsApi.getAll();
    set({ products });
  },

  clearError: () => set({ error: null }),
}));
