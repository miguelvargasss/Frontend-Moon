/** Imagen de producto asociada */
export interface ProductImage {
  id: string;
  url: string;
  productId: string;
}

/**
 * Modelo de dominio Product — mapea la respuesta de GET /products.
 * Refleja la entidad del backend (Product entity).
 */
export interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  color?: string;
  size?: string;
  specification?: string;
  categoryId?: string;
  statusId?: string;
  images?: ProductImage[];
  /** Nombre de categoría, se resuelve en el frontend con el join */
  categoryName?: string;
}
