export interface AdminCustomer {
  firstName: string;
  lastName: string;
  dni?: string;
  phone: string;
  address: string;
  city: string;
  region: string;
}

export interface AdminOrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  priceAtSale: number;
}

export interface AdminOrder {
  id: string;
  orderCode: string;
  userId: string;
  date: string;
  time?: string;
  statusId: string;
  statusName: string;
  couponId?: string;
  customer?: AdminCustomer;
  items?: AdminOrderItem[];
}

export interface OrderStatus {
  id: string;
  name: string;
}
