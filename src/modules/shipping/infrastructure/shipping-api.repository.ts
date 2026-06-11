import apiClient from '../../../core/http/api-client';
import type { ShippingAddress } from '../domain/shipping-address.model';

interface ShippingAddressRaw {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  region: string;
  phone: string;
  reference?: string;
  codeZip?: string;
  dni?: string;
}

function mapAddress(raw: ShippingAddressRaw): ShippingAddress {
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
