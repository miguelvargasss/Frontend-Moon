import apiClient from '../../../core/http/api-client';
import type { CouponModel, CouponFormData } from '../domain/coupon.model';

export const couponsApi = {
  /** GET /coupons — Listar todos los cupones (admin) */
  async getAll(): Promise<CouponModel[]> {
    const { data } = await apiClient.get('/coupons');
    return (data.data ?? []).map(mapCoupon);
  },

  /** POST /coupons — Crear cupón (admin) */
  async create(input: CouponFormData): Promise<CouponModel> {
    const { data } = await apiClient.post('/coupons', input);
    return mapCoupon(data.data);
  },

  /** PATCH /coupons/:id — Actualizar cupón (admin) */
  async update(id: string, input: Partial<CouponFormData>): Promise<CouponModel> {
    const { data } = await apiClient.patch(`/coupons/${id}`, input);
    return mapCoupon(data.data);
  },

  /** DELETE /coupons/:id — Eliminar cupón (admin) */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/coupons/${id}`);
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCoupon(raw: any): CouponModel {
  return {
    id: raw.id,
    code: raw.code,
    expirationDate: raw.expirationDate,
    couponQuantity: raw.couponQuantity,
    minimumAmount: raw.minimumAmount,
    discountAmount: raw.discountAmount,
    categoryId: raw.categoryId,
  };
}
