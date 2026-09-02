import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  type Unsubscribe,
} from 'firebase/firestore';
import { db, ensureFirebaseAuth } from './firebase';
import { Order } from '../types';

export async function saveOrder(order: Order) {
  if (!db || !(await ensureFirebaseAuth())) return false;
  await setDoc(doc(db, 'orders', order.id), order);
  return true;
}

export async function confirmOrderPayment(orderId: string) {
  if (!db || !(await ensureFirebaseAuth())) return false;
  await updateDoc(doc(db, 'orders', orderId), {
    paymentConfirmed: true,
    status: 'Order Confirmed',
    paymentConfirmedAt: new Date().toISOString(),
  });
  return true;
}

export async function subscribeToOrders(onOrders: (orders: Order[]) => void): Promise<Unsubscribe | null> {
  if (!db || !(await ensureFirebaseAuth())) return null;

  return onSnapshot(collection(db, 'orders'), (snapshot) => {
    onOrders(snapshot.docs.map((item) => item.data() as Order));
  }, (error) => {
    console.error('Firebase orders connection failed:', error);
  });
}
