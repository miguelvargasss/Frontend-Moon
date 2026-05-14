/** Tipo de producto */
export type ProductType = 'single' | 'multiple';

/** Modelo de imagen de producto */
export interface ProductImageModel {
  id: string;
  url: string;
}

/** Modelo de variante de producto */
export interface ProductVariantModel {
  id?: string;
  sizeLabel?: string;
  color?: string;
  price: number;
  stock: number;
  sku?: string;
}

/** Modelo de estilo de producto (solo para multiple) */
export interface ProductStyleModel {
  id?: string;
  name: string;
  colorHex?: string;
  images: ProductImageModel[];
  variants: ProductVariantModel[];
}

/** Modelo de sistema de tallas */
export interface SizeSystemModel {
  id: string;
  name: string;
  options: SizeOptionModel[];
}

/** Modelo de opción de talla */
export interface SizeOptionModel {
  id: string;
  label: string;
  sortOrder: number;
}

/** Modelo de dominio de Producto en el frontend */
export interface ProductModel {
  id: string;
  name: string;
  productType: ProductType;
  price: number | null;
  stock: number | null;
  sku?: string;
  description?: string;
  specification?: string;
  sizeSystemId?: string;
  categoryId?: string;
  statusId?: string;
  totalStock: number;
  images: ProductImageModel[];
  variants: ProductVariantModel[];
  styles: ProductStyleModel[];
}
