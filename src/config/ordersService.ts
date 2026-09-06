import {
  collection,
  doc,
  deleteField,
  getDocs,
  getDoc,
  onSnapshot,
  query,
  where,
  arrayUnion,
  setDoc,
  updateDoc,
  type DocumentData,
  type Unsubscribe,
} from 'firebase/firestore';
import { db, ensureFirebaseAuth, auth } from './firebase';
import { Order } from '../types';
import { FulfillmentStatus, SavedAddress, SupportMessage, SupportTicket, SupportTicketStatus } from '../types';

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

export async function getCustomerProfile(): Promise<DocumentData | null> {
  if (!db || !(await ensureFirebaseAuth()) || !auth?.currentUser) return null;
  const snapshot = await getDoc(doc(db, 'users', auth.currentUser.uid));
  return snapshot.exists() ? snapshot.data() : null;
}

export async function saveCustomerAddresses(addresses: SavedAddress[]) {
  if (!db || !(await ensureFirebaseAuth()) || !auth?.currentUser) {
    throw new Error('Firebase customer addresses are not configured');
  }
  await setDoc(doc(db, 'users', auth.currentUser.uid), {
    savedAddresses: addresses,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
  return true;
}

export async function createSupportTicket(ticket: Omit<SupportTicket, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'status' | 'messages'>) {
  if (!db || !(await ensureFirebaseAuth()) || !auth?.currentUser || auth.currentUser.isAnonymous) throw new Error('Sign in is required to submit a support ticket');
  const now = new Date().toISOString();
  const ticketId = `TKT-${Date.now().toString(36).toUpperCase()}`;
  const message: SupportMessage = { id: `${ticketId}-1`, senderId: auth.currentUser.uid, senderRole: 'customer', text: ticket.description, createdAt: now };
  const created: SupportTicket = {
    ...ticket,
    id: ticketId,
    userId: auth.currentUser.uid,
    customerEmail: ticket.customerEmail || auth.currentUser.email || undefined,
    customerName: ticket.customerName || auth.currentUser.displayName || undefined,
    status: 'Open',
    createdAt: now,
    updatedAt: now,
    messages: [message],
  };
  await setDoc(doc(db, 'supportTickets', ticketId), created);
  return created;
}

export async function getCustomerSupportTickets(): Promise<SupportTicket[]> {
  if (!db || !(await ensureFirebaseAuth()) || !auth?.currentUser || auth.currentUser.isAnonymous) return [];
  const snapshot = await getDocs(query(collection(db, 'supportTickets'), where('userId', '==', auth.currentUser.uid)));
  return snapshot.docs.map((item) => item.data() as SupportTicket).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function subscribeToCustomerSupportTickets(onTickets: (tickets: SupportTicket[]) => void) {
  if (!db || !auth?.currentUser || auth.currentUser.isAnonymous) return () => undefined;
  return onSnapshot(query(collection(db, 'supportTickets'), where('userId', '==', auth.currentUser.uid)), (snapshot) => {
    onTickets(snapshot.docs.map((item) => item.data() as SupportTicket).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
  });
}

export function subscribeToAllSupportTickets(onTickets: (tickets: SupportTicket[]) => void) {
  if (!db || !auth?.currentUser || auth.currentUser.isAnonymous) return () => undefined;
  return onSnapshot(collection(db, 'supportTickets'), (snapshot) => {
    onTickets(snapshot.docs.map((item) => item.data() as SupportTicket).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
  });
}

export async function replyToSupportTicket(ticketId: string, text: string) {
  if (!db || !(await ensureFirebaseAuth()) || !auth?.currentUser || auth.currentUser.isAnonymous) throw new Error('Sign in is required');
  const ticketRef = doc(db, 'supportTickets', ticketId);
  const snapshot = await getDoc(ticketRef);
  const isAdmin = auth.currentUser.getIdTokenResult ? (await auth.currentUser.getIdTokenResult()).claims.admin === true : false;
  if (!snapshot.exists() || (!isAdmin && snapshot.data().userId !== auth.currentUser.uid)) throw new Error('Ticket not found');
  const ticket = snapshot.data() as SupportTicket;
  const message: SupportMessage = { id: `${ticketId}-${Date.now()}`, senderId: auth.currentUser.uid, senderRole: isAdmin ? 'admin' : 'customer', text, createdAt: new Date().toISOString() };
  await updateDoc(ticketRef, { messages: [...ticket.messages, message], updatedAt: message.createdAt, ...(isAdmin ? { status: 'In Progress' } : {}) });
}

export async function updateSupportTicketStatus(ticketId: string, status: SupportTicketStatus) {
  if (!db || !(await ensureFirebaseAuth())) throw new Error('Support is not configured');
  await updateDoc(doc(db, 'supportTickets', ticketId), { status, updatedAt: new Date().toISOString() });
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

export interface CustomerAccountState {
  disabled?: boolean;
  revokedAt?: string | null;
  deletedAt?: string | null;
}

const customerStateDocument = (email: string) => encodeURIComponent(email.trim().toLowerCase());

export async function updateCustomerAccountState(email: string, state: CustomerAccountState) {
  if (!db || !(await ensureFirebaseAuth())) throw new Error('Firebase account controls are not configured');
  const update = Object.fromEntries(
    Object.entries(state).map(([key, value]) => [key, value === null ? deleteField() : value])
  );
  await setDoc(doc(db, 'customerStates', customerStateDocument(email)), update, { merge: true });
}

export async function getCustomerAccountState(email: string): Promise<CustomerAccountState> {
  if (!db || !(await ensureFirebaseAuth())) return {};
  const snapshot = await getDoc(doc(db, 'customerStates', customerStateDocument(email)));
  return snapshot.exists() ? snapshot.data() as CustomerAccountState : {};
}

export async function subscribeToCustomerAccountState(
  email: string,
  onState: (state: CustomerAccountState) => void
): Promise<Unsubscribe | null> {
  if (!db || !(await ensureFirebaseAuth())) return null;
  return onSnapshot(doc(db, 'customerStates', customerStateDocument(email)), (snapshot) => {
    if (snapshot.exists()) onState(snapshot.data() as CustomerAccountState);
  });
}
