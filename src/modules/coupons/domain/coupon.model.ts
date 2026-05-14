/** Modelo de cupón para la vista de administración */
export interface CouponModel {
  id: string;
  code: string;
  expirationDate: string;
  couponQuantity: number;
  minimumAmount: number;
  discountAmount: number;
  categoryId?: string;
}

/** Datos para crear/actualizar un cupón */
export interface CouponFormData {
  code: string;
  expirationDate: string;
  couponQuantity: number;
  minimumAmount: number;
  discountAmount: number;
  categoryId?: string;
}
