import apiClient from '../../../core/http/api-client';
import type { ProductModel, ProductVariantModel } from '../domain/product.model';

/**
 * Repositorio API para productos.
 */
export const productsApi = {
  async getAll(categoryId?: string): Promise<ProductModel[]> {
    const params = categoryId ? { categoryId } : {};
    const { data } = await apiClient.get('/products', { params });
    return (data.data ?? []).map(mapProduct);
  },

  async getById(id: string): Promise<ProductModel> {
    const { data } = await apiClient.get(`/products/${id}`);
    return mapProduct(data.data);
  },

  async create(input: {
    name: string;
    price: number;
    description?: string;
    specification?: string;
    sizeType?: string;
    categoryId?: string;
    variants?: Omit<ProductVariantModel, 'id'>[];
  }): Promise<ProductModel> {
    const { data } = await apiClient.post('/products', input);
    return mapProduct(data.data);
  },

  async update(
    id: string,
    input: {
      name?: string;
      price?: number;
      description?: string;
      specification?: string;
      sizeType?: string;
      categoryId?: string;
      variants?: Omit<ProductVariantModel, 'id'>[];
    },
  ): Promise<ProductModel> {
    const { data } = await apiClient.patch(`/products/${id}`, input);
    return mapProduct(data.data);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/products/${id}`);
  },

  async uploadImage(productId: string, file: File): Promise<{ id: string; url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post(`/products/${productId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return { id: data.data.id, url: data.data.url };
  },

  async deleteImage(productId: string, imageId: string): Promise<void> {
    await apiClient.delete(`/products/${productId}/images/${imageId}`);
  },
};

function mapProduct(raw: any): ProductModel {
  const variants = (raw.variants ?? []).map((v: any) => ({
    id: v.id,
    size: v.size,
    color: v.color,
    stock: v.stock,
    priceOverride: v.priceOverride,
  }));

  const totalStock = variants.reduce((sum: number, v: any) => sum + (v.stock ?? 0), 0);

  return {
    id: raw.id,
    name: raw.name,
    price: Number(raw.price),
    description: raw.description,
    specification: raw.specification,
    sizeType: raw.sizeType,
    categoryId: raw.categoryId,
    statusId: raw.statusId,
    totalStock,
    images: (raw.images ?? []).map((img: any) => ({ id: img.id, url: img.url })),
    variants,
  };
}
