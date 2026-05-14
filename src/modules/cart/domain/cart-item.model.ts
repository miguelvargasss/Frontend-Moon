/** Modelo de dominio para un ítem del carrito */
export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  variantId?: string;
  // ── Datos enriquecidos (vienen del backend con JOIN) ──
  productName: string;
  productPrice: number;
  productImage: string | null;
  variantLabel?: string | null;
  variantColor?: string | null;
}
