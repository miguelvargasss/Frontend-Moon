/** Imagen de producto asociada */
export interface ProductImage {
  id: string;
  url: string;
  productId: string;
}

/** Variante de producto */
export interface ProductVariant {
  id: string;
  size?: string;
  color?: string;
  stock: number;
  priceOverride?: number;
}

/**
 * Modelo de dominio Product — mapea la respuesta de GET /products.
 */
export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  specification?: string;
  sizeType?: string;
  categoryId?: string;
  statusId?: string;
  images?: ProductImage[];
  variants?: ProductVariant[];
  totalStock?: number;
  /** Nombre de categoría, se resuelve en el frontend con el join */
  categoryName?: string;
}
