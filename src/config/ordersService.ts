import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  arrayUnion,
  setDoc,
  updateDoc,
  type DocumentData,
  type Unsubscribe,
} from 'firebase/firestore';
import { db, ensureFirebaseAuth, auth } from './firebase';
import { Order } from '../types';
import { FulfillmentStatus } from '../types';

export async function saveOrder(order: Order) {
  if (!db || !(await ensureFirebaseAuth())) {
    throw new Error('Firebase orders sync is not configured');
  }
  await setDoc(doc(db, 'orders', order.id), order);
  return true;
}

export async function saveCustomerProfile(profile: DocumentData) {
  if (!db || !(await ensureFirebaseAuth()) || !auth?.currentUser) {
    throw new Error('Firebase customer profiles are not configured');
  }
  await setDoc(
    doc(db, 'users', auth.currentUser.uid),
    {
      ...profile,
      ...(profile.savedAddresses?.length
        ? { savedAddresses: arrayUnion(...profile.savedAddresses) }
        : {}),
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
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

export async function updateOrderStatus(orderId: string, status: FulfillmentStatus) {
  if (!db || !(await ensureFirebaseAuth())) {
    throw new Error('Firebase orders sync is not configured');
  }
  await updateDoc(doc(db, 'orders', orderId), { status });
  return true;
}

export async function updateOrderDelivery(orderId: string, delivery: Partial<Order>) {
  if (!db || !(await ensureFirebaseAuth())) {
    throw new Error('Firebase delivery sync is not configured');
  }
  await updateDoc(doc(db, 'orders', orderId), delivery);
  return true;
}

export async function saveStockLevel(productId: number, quantity: number) {
  if (!db || !(await ensureFirebaseAuth())) {
    throw new Error('Firebase stock sync is not configured');
  }
  await setDoc(doc(db, 'inventory', String(productId)), { quantity });
  return true;
}

export async function subscribeToStock(onStock: (stock: Record<number, number>) => void): Promise<Unsubscribe | null> {
  if (!db || !(await ensureFirebaseAuth())) return null;

  return onSnapshot(collection(db, 'inventory'), (snapshot) => {
    onStock(Object.fromEntries(snapshot.docs.map((item) => [Number(item.id), item.data().quantity as number])));
  }, (error) => {
    console.error('Firebase inventory connection failed:', error);
  });
}

export interface SharedLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  updatedAt: string;
}

export async function saveSharedLocation(orderId: string, location: SharedLocation) {
  if (!db || !(await ensureFirebaseAuth())) return false;
  await setDoc(doc(db, 'orderLocations', orderId), location);
  return true;
}

export async function subscribeToSharedLocation(
  orderId: string,
  onLocation: (location: SharedLocation) => void
): Promise<Unsubscribe | null> {
  if (!db || !(await ensureFirebaseAuth())) return null;
  return onSnapshot(doc(db, 'orderLocations', orderId), (snapshot) => {
    if (snapshot.exists()) onLocation(snapshot.data() as SharedLocation);
  }, (error) => {
    console.error('Firebase location connection failed:', error);
  });
}

export async function subscribeToOrders(onOrders: (orders: Order[]) => void): Promise<Unsubscribe | null> {
  if (!db || !(await ensureFirebaseAuth())) return null;

  return onSnapshot(collection(db, 'orders'), (snapshot) => {
    onOrders(snapshot.docs.map((item) => item.data() as Order));
  }, (error) => {
    console.error('Firebase orders connection failed:', error);
  });
}

export async function getOrders(): Promise<Order[]> {
  if (!db || !(await ensureFirebaseAuth())) return [];
  const snapshot = await getDocs(collection(db, 'orders'));
  return snapshot.docs.map((item) => item.data() as Order);
}
