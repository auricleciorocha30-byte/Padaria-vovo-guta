
export type OrderStatus = 'PREPARANDO' | 'PRONTO' | 'ENTREGUE' | 'CANCELADO';
export type OrderType = 'MESA' | 'BALCAO' | 'ENTREGA';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  isActive: boolean;
  featuredDay?: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  type: OrderType;
  tableNumber?: string;
  customerName?: string;
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  createdAt: number;
}

export interface StoreSettings {
  isDeliveryActive: boolean;
  isTableOrderActive: boolean;
  isCounterPickupActive: boolean;
  storeName: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  // New Waitstaff Permissions
  canWaitstaffFinishOrder: boolean;
  canWaitstaffCancelItems: boolean;
  thermalPrinterWidth: '80mm' | '58mm';
}

export interface Coupon {
  code: string;
  discount: number;
  isActive: boolean;
}

export interface LoyaltyCard {
  customerId: string;
  stamps: number;
}
