/** Modelo de dominio para una dirección de envío */
export interface ShippingAddress {
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
