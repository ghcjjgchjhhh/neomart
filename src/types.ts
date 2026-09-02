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
  orderSource?: 'customer';
  phone: string;
  email: string;
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
}

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
  state: string;
  city: string;
  address: string;
  phone: string;
  notes?: string;
}

export interface CardDetails {
  holderName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
}
