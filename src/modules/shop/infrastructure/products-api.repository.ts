import apiClient from '../../../core/http/api-client';
import type { Product, ProductImage, ProductVariant } from '../domain/product.model';

interface ShopProductRaw {
  id: string;
  name: string;
  productType?: 'single' | 'multiple';
  price?: number | string;
  stock?: number | string;
  description?: string;
  specification?: string;
  sizeType?: string;
  categoryId?: string;
  statusId?: string;
  images?: { id: string; url: string }[];
  variants?: { id: string; sizeLabel?: string; color?: string; stock?: number | string; price?: number | string; sku?: string }[];
  styles?: { id: string; name?: string; images?: { id: string; url: string }[]; variants?: { id: string; sizeLabel?: string; stock?: number | string; price?: number | string; sku?: string }[] }[];
}

/**
 * Normaliza la respuesta del backend al modelo de dominio del shop.
 * Soporta productos `single` y `multiple` (con `styles`).
 */
function normalizeProduct(raw: ShopProductRaw): Product {
  const productType: 'single' | 'multiple' = raw.productType ?? 'single';

  // ── Imágenes ──
  const directImages: ProductImage[] = (raw.images ?? []).map((img) => ({
    id: img.id,
    url: img.url,
    productId: raw.id,
  }));

  // Para multiple: aplanar imágenes de todos los estilos (primero las del primer estilo)
  const styleImages: ProductImage[] = (raw.styles ?? []).flatMap((s) =>
    (s.images ?? []).map((img) => ({
      id: img.id,
      url: img.url,
      productId: raw.id,
      variantId: s.id,
    })),
  );

  const images: ProductImage[] = productType === 'multiple' ? styleImages : directImages;

  // ── Variantes ──
  // Para single: variantes directas. Para multiple: aplanar variantes de cada estilo,
  // adjuntando el color/nombre del estilo y sus imágenes.
  let variants: ProductVariant[] = [];

  if (productType === 'multiple') {
    variants = (raw.styles ?? []).flatMap((s) => {
      const sImages: ProductImage[] = (s.images ?? []).map((img) => ({
        id: img.id,
        url: img.url,
        productId: raw.id,
        variantId: s.id,
      }));
      return (s.variants ?? []).map((v) => ({
        id: v.id,
        size: v.sizeLabel ?? undefined,
        color: s.name ?? undefined,
        stock: Number(v.stock ?? 0),
        priceOverride: v.price != null ? Number(v.price) : undefined,
        sku: v.sku ?? undefined,
        images: sImages,
      }));
    });
  } else {
    variants = (raw.variants ?? []).map((v) => ({
      id: v.id,
      size: v.sizeLabel ?? undefined,
      color: v.color ?? undefined,
      stock: Number(v.stock ?? 0),
      priceOverride: v.price != null ? Number(v.price) : undefined,
      sku: v.sku ?? undefined,
      images: directImages,
    }));
  }

  // ── Precio base ──
  // single: raw.price. multiple: precio mínimo de las variantes (precio "desde").
  let price = 0;
  if (productType === 'single') {
    price = raw.price != null ? Number(raw.price) : 0;
  } else if (variants.length > 0) {
    price = Math.min(
      ...variants.map((v) => v.priceOverride ?? Number.POSITIVE_INFINITY),
    );
    if (!isFinite(price)) price = 0;
  }

  // ── Stock total ──
  const totalStock =
    variants.length > 0
      ? variants.reduce((sum, v) => sum + (v.stock ?? 0), 0)
      : Number(raw.stock ?? 0);

  return {
    id: raw.id,
    name: raw.name,
    price,
    description: raw.description,
    specification: raw.specification,
    sizeType: raw.sizeType,
    categoryId: raw.categoryId,
    statusId: raw.statusId,
    images,
    variants,
    totalStock,
  };
}

/**
 * Repositorio de productos — se comunica con el backend REST.
 * Solo lectura pública (no requiere autenticación).
 */
export const productsApiRepository = {
  /**
   * Obtiene todos los productos, opcionalmente filtrados por categoría.
   * GET /products o GET /products?categoryId=xxx
   */
  async getAll(categoryId?: string): Promise<Product[]> {
    const params = categoryId ? { categoryId } : {};
    const { data } = await apiClient.get('/products', { params });
    return (data.data ?? []).map(normalizeProduct);
  },

  /**
   * Obtiene un producto por su ID, incluyendo imágenes.
   * GET /products/:id
   */
  async getById(id: string): Promise<Product> {
    const { data } = await apiClient.get(`/products/${id}`);
    return normalizeProduct(data.data);
  },
};
