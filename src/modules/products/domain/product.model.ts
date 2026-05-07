/** Modelo de variante de producto */
export interface ProductVariantModel {
  id?: string;
  size?: string;
  color?: string;
  stock: number;
  priceOverride?: number;
}

/** Modelo de imagen de producto */
export interface ProductImageModel {
  id: string;
  url: string;
}

/** Modelo de dominio de Producto en el frontend */
export interface ProductModel {
  id: string;
  name: string;
  price: number;
  description?: string;
  specification?: string;
  sizeType?: string;
  categoryId?: string;
  statusId?: string;
  totalStock: number;
  images: ProductImageModel[];
  variants: ProductVariantModel[];
}
