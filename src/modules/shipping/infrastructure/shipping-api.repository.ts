import apiClient from '../../../core/http/api-client';
import type { ShippingAddress } from '../domain/shipping-address.model';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapAddress(raw: any): ShippingAddress {
  return {
    id: raw.id,
    userId: raw.userId,
    firstName: raw.firstName,
    lastName: raw.lastName,
    address: raw.address,
    city: raw.city,
    region: raw.region,
    phone: raw.phone,
    reference: raw.reference ?? undefined,
    codeZip: raw.codeZip ?? undefined,
    dni: raw.dni ?? undefined,
  };
}

export const shippingApiRepository = {
  /** GET /shipping/addresses — Direcciones del usuario */
  async getAll(): Promise<ShippingAddress[]> {
    const { data } = await apiClient.get('/shipping/addresses');
    return (data.data ?? []).map(mapAddress);
  },

  /** POST /shipping/addresses — Crear nueva dirección */
  async create(input: Omit<ShippingAddress, 'id' | 'userId'>): Promise<ShippingAddress> {
    const { data } = await apiClient.post('/shipping/addresses', input);
    return mapAddress(data.data);
  },

  /** DELETE /shipping/addresses/:id — Eliminar dirección */
  async remove(id: string): Promise<void> {
    await apiClient.delete(`/shipping/addresses/${id}`);
  },
};
