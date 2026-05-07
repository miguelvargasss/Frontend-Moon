/** Modelo de dominio para un ítem del carrito */
export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  /** Se resuelve en frontend con los datos del producto */
  productName?: string;
  productPrice?: number;
  productImage?: string;
}
