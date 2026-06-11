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

interface CouponRaw {
  id: string;
  code: string;
  expirationDate: string | Date;
  couponQuantity: number;
  minimumAmount?: number;
  discountAmount: number;
  discountType?: 'fixed' | 'percentage';
  categoryId?: string;
}

function mapCoupon(raw: CouponRaw): CouponModel {
  return {
    id: raw.id,
    code: raw.code,
    expirationDate: raw.expirationDate instanceof Date ? raw.expirationDate.toISOString() : String(raw.expirationDate),
    couponQuantity: raw.couponQuantity,
    minimumAmount: raw.minimumAmount ?? 0,
    discountAmount: raw.discountAmount,
    discountType: raw.discountType ?? 'fixed',
    categoryId: raw.categoryId,
  };
}
