import apiClient from '../../../core/http/api-client';
import type {
  ProductModel,
  ProductVariantModel,
  ProductImageModel,
  ProductStyleModel,
  SizeSystemModel,
} from '../domain/product.model';

/**
 * Repositorio API para productos.
 */
export const productsApi = {
  async getAll(categoryId?: string): Promise<ProductModel[]> {
    const params = categoryId ? { categoryId } : {};
    const { data } = await apiClient.get('/products', { params });
    return (data.data ?? []).map(mapProduct);
  },

  async getStatuses(): Promise<{ id: string; name: string }[]> {
    const { data } = await apiClient.get('/products/statuses');
    return data.data ?? [];
  },

  async getSizeSystems(): Promise<SizeSystemModel[]> {
    const { data } = await apiClient.get('/products/size-systems');
    return data.data ?? [];
  },

  async getById(id: string): Promise<ProductModel> {
    const { data } = await apiClient.get(`/products/${id}`);
    return mapProduct(data.data);
  },

  async create(input: {
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
  }): Promise<ProductModel> {
    console.log('📦 [FRONTEND] Payload a enviar:', JSON.stringify(input, null, 2));
    const { data } = await apiClient.post('/products', input);
    return mapProduct(data.data);
  },

  async update(
    id: string,
    input: {
      name?: string;
      productType?: 'single' | 'multiple';
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
    },
  ): Promise<ProductModel> {
    const { data } = await apiClient.patch(`/products/${id}`, input);
    return mapProduct(data.data);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/products/${id}`);
  },

  async uploadImage(
    productId: string,
    file: File,
    styleId?: string,
  ): Promise<{ id: string; url: string; styleId?: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const params = styleId ? { styleId } : {};
    const { data } = await apiClient.post(`/products/${productId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      params,
    });
    return { id: data.data.id, url: data.data.url, styleId: data.data.styleId };
  },

  async deleteImage(productId: string, imageId: string): Promise<void> {
    await apiClient.delete(`/products/${productId}/images/${imageId}`);
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapProduct(raw: any): ProductModel {
  const productType = raw.productType ?? 'single';

  // Imágenes directas del producto (solo single)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const images: ProductImageModel[] = (raw.images ?? []).map((img: any) => ({
    id: img.id,
    url: img.url,
  }));

  // Variantes directas del producto (solo single)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const variants: ProductVariantModel[] = (raw.variants ?? []).map((v: any) => ({
    id: v.id,
    sizeLabel: v.sizeLabel,
    color: v.color,
    price: Number(v.price),
    stock: v.stock,
    sku: v.sku,
  }));

  // Estilos (solo multiple)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const styles: ProductStyleModel[] = (raw.styles ?? []).map((s: any) => ({
    id: s.id,
    name: s.name,
    colorHex: s.colorHex,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    images: (s.images ?? []).map((img: any) => ({ id: img.id, url: img.url })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    variants: (s.variants ?? []).map((v: any) => ({
      id: v.id,
      sizeLabel: v.sizeLabel,
      color: v.color,
      price: Number(v.price),
      stock: v.stock,
      sku: v.sku,
    })),
  }));

  // Calcular total stock
  let totalStock: number;
  if (productType === 'single') {
    totalStock = variants.length > 0
      ? variants.reduce((sum, v) => sum + (v.stock ?? 0), 0)
      : (raw.stock ?? 0);
  } else {
    totalStock = styles.reduce(
      (sum, s) => sum + s.variants.reduce((vs, v) => vs + (v.stock ?? 0), 0),
      0,
    );
  }

  return {
    id: raw.id,
    name: raw.name,
    productType,
    price: raw.price != null ? Number(raw.price) : null,
    stock: raw.stock != null ? Number(raw.stock) : null,
    sku: raw.sku,
    description: raw.description,
    specification: raw.specification,
    sizeSystemId: raw.sizeSystemId,
    categoryId: raw.categoryId,
    statusId: raw.statusId,
    totalStock,
    images,
    variants,
    styles,
  };
}
