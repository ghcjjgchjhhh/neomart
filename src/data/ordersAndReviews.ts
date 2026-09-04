import { Order, Review } from '../types';

export const initialReviews: Review[] = [];

export const sampleOrders: Order[] = [
  {
    id: 'NM-48291',
    phone: '08012345678',
    email: 'buyer@example.com',
    date: '2026-08-29',
    eta: '2026-09-03',
    status: 'Packed',
    paymentMethod: 'Card Payment',
    address: '25 Admiralty Way, Lekki Phase 1, Lagos',
    total: 230000,
    items: [
      {
        name: 'Samsung Galaxy A54 5G 128GB',
        qty: 1,
        price: 195000,
        image: 'https://ng.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/57/5777743/1.jpg?5669'
      },
      {
        name: 'Premium Massage Gun Deep Tissue 6-Head',
        qty: 1,
        price: 35000,
        image: 'https://m.media-amazon.com/images/I/51VQlFR4o+L._AC_UL320_.jpg'
      }
    ]
  },
  {
    id: 'NM-90341',
    phone: '07044556677',
    email: 'customer@neo.com',
    date: '2026-08-30',
    eta: '2026-09-02',
    status: 'Out for Delivery',
    paymentMethod: 'Payment on Delivery',
    address: '12 Allen Avenue, Ikeja, Lagos',
    total: 1150000,
    items: [
      {
        name: 'MacBook Air M2 256GB Midnight',
        qty: 1,
        price: 1150000,
        image: 'https://plus.unsplash.com/premium_photo-1681160405580-a68e9c4707f9?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0'
      }
    ]
  },
  {
    id: 'NM-10492',
    phone: '08135648242',
    email: 'customer@example.com',
    date: '2026-08-31',
    eta: '2026-09-04',
    status: 'Processing',
    paymentMethod: 'Bank Transfer (GTBank)',
    address: 'Plot 8, Sangotedo, Lekki-Epe Expressway, Lagos',
    total: 520000,
    items: [
      {
        name: 'Samsung 65" QLED 4K Smart TV 2026',
        qty: 1,
        price: 520000,
        image: 'https://ng.jumia.is/unsafe/fit-in/300x300/filters:fill(white)/product/21/6316814/1.jpg?0175'
      }
    ]
  }
];
