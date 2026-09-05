export type CategoryId =
  | 'all'
  | 'phone'
  | 'laptop'
  | 'tv'
  | 'fashion'
  | 'appliance'
  | 'gaming'
  | 'health'
  | 'home'
  | 'baby'
  | 'watch'
  | 'headphone'
  | 'shoe'
  | 'food';

export interface Product {
  id: number;
  name: string;
  price: number;
  oldPrice: number;
  discount: number;
  rating: number;
  reviews: number;
  emoji: string;
  img?: string;
  category: string;
  tags: string[];
  images?: string[];
  featured?: boolean;
  lowStockThreshold?: number;
}

export interface CartItem extends Product {
  qty: number;
}

export interface Review {
  id: number;
  productId: number;
  reviewer: string;
  date: string;
  rating: number;
  text: string;
  helpful: number;
  productName?: string;
  productEmoji?: string;
}

export interface OrderItem {
  name: string;
  qty: number;
  price: number;
  image: string;
}

export interface Order {
  id: string;
  userId?: string;
  orderSource?: 'customer';
  phone: string;
  email: string;
  customerName?: string;
  date: string;
  eta: string;
  status:
    | 'Order Placed'
    | 'Order Confirmed'
    | 'Processing'
    | 'Packed'
    | 'Shipped'
    | 'Out for Delivery'
    | 'Delivered'
    | 'Cancelled';
  paymentConfirmed?: boolean;
  paymentMethod: string;
  address: string;
  total: number;
  items: OrderItem[];
  trackingNumber?: string;
  driverName?: string;
  driverPhone?: string;
  deliveryZone?: string;
  deliveryFee?: number;
  estimatedDelivery?: string;
}

export type FulfillmentStatus = 'Processing' | 'Packed' | 'Shipped' | 'Out for Delivery' | 'Delivered';

export type HelpSectionType =
  | 'place-order'
  | 'payment-options'
  | 'track-order'
  | 'cancel-order'
  | 'returns-refunds'
  | 'cookie-preferences'
  | 'live-chat';

export type PaymentMethodType = 'bank' | 'card' | 'delivery';

export interface DeliveryDetails {
  fullName?: string;
  state: string;
  city: string;
  address: string;
  phone: string;
  country?: string;
  notes?: string;
}

export interface SavedAddress extends DeliveryDetails {
  id: string;
  label: string;
  isDefault?: boolean;
}

export interface CardDetails {
  holderName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
}
