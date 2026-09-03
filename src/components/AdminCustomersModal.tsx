import React, { useMemo, useState } from 'react';
import {
  Ban,
  CheckCircle2,
  Clock3,
  History,
  Mail,
  MapPin,
  Phone,
  Search,
  ShieldOff,
  Trash2,
  UserRound,
  X,
} from 'lucide-react';
import { Order } from '../types';

interface CustomerRecord {
  name: string;
  email: string;
  phone: string;
  orders: Order[];
  addresses: string[];
  lastActivity: string;
}

interface AccountState {
  disabled?: boolean;
  revokedAt?: string;
  deletedAt?: string;
}

interface AdminCustomersModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onToast: (message: string) => void;
}

const ACCOUNT_STATES_KEY = 'neomart_admin_customer_states';

export const AdminCustomersModal: React.FC<AdminCustomersModalProps> = ({
  isOpen,
  onClose,
  orders,
  onToast,
}) => {
  const [search, setSearch] = useState('');
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [showEmailComposer, setShowEmailComposer] = useState(false);
  const [emailSubject, setEmailSubject] = useState('NeoMart order update');
  const [emailMessage, setEmailMessage] = useState('Hello,\n\nWe have an update about your NeoMart order.\n\nRegards,\nNeoMart Support');
  const [accountStates, setAccountStates] = useState<Record<string, AccountState>>(() => {
    try {
      return JSON.parse(localStorage.getItem(ACCOUNT_STATES_KEY) || '{}');
    } catch {
      return {};
    }
  });

  const customers = useMemo<CustomerRecord[]>(() => {
    const grouped = new Map<string, CustomerRecord>();
    orders.forEach((order) => {
      const email = order.email?.trim().toLowerCase() || `phone:${order.phone || order.id}`;
      const customerPhone = order.phone === '08135642842' ? '' : order.phone;
      const current = grouped.get(email) || {
        name: order.customerName || order.email?.split('@')[0] || 'Customer',
        email: order.email || 'Email not provided',
        phone: customerPhone || 'Phone not provided',
        orders: [],
        addresses: [],
        lastActivity: order.date,
      };
      current.orders.push(order);
      if (!current.name || current.name === 'Customer') current.name = order.customerName || current.name;
      if (current.phone === 'Phone not provided' && customerPhone) current.phone = customerPhone;
      if (order.address && !current.addresses.includes(order.address)) current.addresses.push(order.address);
      if (new Date(order.date).getTime() > new Date(current.lastActivity).getTime()) current.lastActivity = order.date;
      grouped.set(email, current);
    });
    return Array.from(grouped.values()).sort((a, b) =>
      new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
    );
  }, [orders]);

  const filteredCustomers = customers.filter((customer) => {
    const query = search.toLowerCase().trim();
    return !query || [customer.name, customer.email, customer.phone, ...customer.addresses].some((value) => value.toLowerCase().includes(query));
  });
  const selectedCustomer = customers.find((customer) => customer.email.toLowerCase() === selectedEmail?.toLowerCase()) || null;

  const updateState = (email: string, patch: AccountState, message: string) => {
    const next = { ...accountStates, [email]: { ...accountStates[email], ...patch } };
    setAccountStates(next);
    localStorage.setItem(ACCOUNT_STATES_KEY, JSON.stringify(next));
    onToast(message);
  };

  const deleteCustomer = (email: string) => {
    updateState(email, { deletedAt: new Date().toISOString() }, 'Customer account marked for deletion');
    setSelectedEmail(null);
  };

  const openEmailComposer = () => {
    setEmailSubject('NeoMart order update');
    setEmailMessage('Hello,\n\nWe have an update about your NeoMart order.\n\nRegards,\nNeoMart Support');
    setShowEmailComposer(true);
  };

  const sendEmail = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedCustomer || selectedCustomer.email === 'Email not provided') {
      onToast('This customer has no email address');
      return;
    }
    const mailto = `mailto:${selectedCustomer.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailMessage)}`;
    window.location.href = mailto;
    setShowEmailComposer(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-[#18181b]">
        <header className="flex items-center justify-between border-b border-gray-200 bg-[#222222] px-5 py-4 text-white dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f68b1e]"><UserRound className="h-5 w-5" /></div>
            <div><h2 className="font-extrabold">Customer Management</h2><p className="text-xs text-gray-300">Profiles, orders, activity and account controls</p></div>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-gray-400 hover:bg-white/10 hover:text-white" aria-label="Close customer management"><X className="h-5 w-5" /></button>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[minmax(240px,0.8fr)_minmax(0,1.5fr)]">
          <section className="min-h-0 overflow-y-auto border-b border-gray-200 p-4 dark:border-gray-800 md:border-b-0 md:border-r">
            <label className="relative block"><Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name/email, phone..." className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-xs outline-none focus:border-[#f68b1e] dark:border-gray-700 dark:bg-[#202024]" /></label>
            <div className="mt-3 flex items-center justify-between text-[11px] text-gray-500"><span>{filteredCustomers.length} customer{filteredCustomers.length === 1 ? '' : 's'}</span><span>{orders.length} orders</span></div>
            <div className="mt-3 space-y-2">
              {filteredCustomers.map((customer) => {
                const state = accountStates[customer.email];
                const active = selectedEmail?.toLowerCase() === customer.email.toLowerCase();
                return <button type="button" key={customer.email} onClick={() => setSelectedEmail(customer.email)} className={`w-full rounded-xl border p-3 text-left transition-colors ${active ? 'border-[#f68b1e] bg-orange-50 dark:bg-orange-950/20' : 'border-gray-200 hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-700'}`}>
                  <div className="flex items-start justify-between gap-2"><strong className="truncate text-xs text-gray-900 dark:text-white">{customer.name}</strong>{state?.disabled && <Ban className="h-3.5 w-3.5 shrink-0 text-red-500" />}</div>
                  <div className="mt-0.5 truncate text-[10px] text-gray-500">{customer.email !== 'Email not provided' ? customer.email : customer.phone}</div>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-gray-500"><span>{customer.orders.length} order{customer.orders.length === 1 ? '' : 's'}</span><span>{customer.lastActivity}</span></div>
                </button>;
              })}
              {filteredCustomers.length === 0 && <p className="py-10 text-center text-xs text-gray-500">No matching customers.</p>}
            </div>
          </section>

          <section className="min-h-0 overflow-y-auto p-4 sm:p-5">
            {!selectedCustomer ? <div className="flex h-full min-h-64 flex-col items-center justify-center text-center text-gray-400"><UserRound className="mb-3 h-10 w-10 opacity-40" /><p className="text-sm font-bold">Select a customer</p><p className="mt-1 text-xs">Search by name, email or phone to open their profile.</p></div> : (() => {
              const state = accountStates[selectedCustomer.email] || {};
              return <div className="space-y-4">
                {showEmailComposer && <form onSubmit={sendEmail} className="rounded-2xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/60 dark:bg-blue-950/20"><div className="mb-3 flex items-center justify-between"><div><h4 className="font-extrabold">Email customer</h4><p className="text-[11px] text-gray-500">To: {selectedCustomer.email}</p></div><button type="button" onClick={() => setShowEmailComposer(false)} aria-label="Close email composer"><X className="h-4 w-4" /></button></div><div className="space-y-2"><input value={emailSubject} onChange={(event) => setEmailSubject(event.target.value)} placeholder="Subject" className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs dark:border-gray-700 dark:bg-[#202024]" required /><textarea value={emailMessage} onChange={(event) => setEmailMessage(event.target.value)} rows={6} placeholder="Write your message" className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs dark:border-gray-700 dark:bg-[#202024]" required /></div><button type="submit" className="mt-3 flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700"><Mail className="h-4 w-4" />Open email app</button></form>}
                <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-lg font-extrabold text-gray-900 dark:text-white">{selectedCustomer.name}</h3><p className="mt-1 text-xs text-gray-500">{selectedCustomer.email !== 'Email not provided' ? selectedCustomer.email : selectedCustomer.phone} · Last activity: {selectedCustomer.lastActivity}</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={openEmailComposer} disabled={selectedCustomer.email === 'Email not provided'} className="flex items-center gap-1.5 rounded-lg border border-blue-500 px-3 py-2 text-[11px] font-bold text-blue-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"><Mail className="h-3.5 w-3.5" />Email customer</button><button type="button" onClick={() => updateState(selectedCustomer.email, { revokedAt: new Date().toISOString() }, 'All customer sessions revoked')} className="flex items-center gap-1.5 rounded-lg border border-amber-500 px-3 py-2 text-[11px] font-bold text-amber-600 hover:bg-amber-50"><ShieldOff className="h-3.5 w-3.5" />Force logout</button><button type="button" onClick={() => deleteCustomer(selectedCustomer.email)} className="flex items-center gap-1.5 rounded-lg border border-red-500 px-3 py-2 text-[11px] font-bold text-red-600 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" />Delete</button></div></div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3"><div className="rounded-xl border border-gray-200 p-3 dark:border-gray-800"><Phone className="mb-2 h-4 w-4 text-[#f68b1e]" /><p className="text-[10px] text-gray-500">Phone</p><strong className="text-xs">{selectedCustomer.phone}</strong></div><div className="rounded-xl border border-gray-200 p-3 dark:border-gray-800"><History className="mb-2 h-4 w-4 text-blue-500" /><p className="text-[10px] text-gray-500">Purchases</p><strong className="text-xs">{selectedCustomer.orders.length} orders</strong></div><div className="rounded-xl border border-gray-200 p-3 dark:border-gray-800"><Mail className="mb-2 h-4 w-4 text-emerald-500" /><p className="text-[10px] text-gray-500">Spent</p><strong className="text-xs">₦{selectedCustomer.orders.reduce((sum, order) => sum + order.total, 0).toLocaleString()}</strong></div></div>
                <div className="flex flex-wrap gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-[#202024]"><button type="button" onClick={() => updateState(selectedCustomer.email, { disabled: !state.disabled }, state.disabled ? 'Customer account enabled' : 'Customer account disabled')} className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-bold text-white ${state.disabled ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-gray-700 hover:bg-gray-800'}`}>{state.disabled ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}{state.disabled ? 'Enable account' : 'Disable account'}</button>{state.revokedAt && <span className="flex items-center gap-1 text-[10px] text-amber-600"><Clock3 className="h-3.5 w-3.5" />Sessions revoked {new Date(state.revokedAt).toLocaleString()}</span>}{state.deletedAt && <span className="text-[10px] font-bold text-red-600">Deletion requested</span>}</div>
                <div><h4 className="mb-2 text-sm font-extrabold">Saved addresses</h4>{selectedCustomer.addresses.length ? <div className="grid gap-2 sm:grid-cols-2">{selectedCustomer.addresses.map((address) => <div key={address} className="flex gap-2 rounded-xl border border-gray-200 p-3 text-xs dark:border-gray-800"><MapPin className="h-4 w-4 shrink-0 text-[#f68b1e]" /><span>{address}</span></div>)}</div> : <p className="text-xs text-gray-500">No saved addresses.</p>}</div>
                <div><h4 className="mb-2 text-sm font-extrabold">Purchase history & activity</h4><div className="space-y-2">{selectedCustomer.orders.map((order) => <div key={order.id} className="rounded-xl border border-gray-200 p-3 dark:border-gray-800"><div className="flex flex-wrap items-center justify-between gap-2"><strong className="font-mono text-xs">#{order.id}</strong><span className="text-xs font-bold text-[#f68b1e]">₦{order.total.toLocaleString()}</span><span className="text-[10px] text-gray-500">{order.date}</span></div><p className="mt-1 text-[11px] text-gray-500">{order.items.map((item) => `${item.name} x${item.qty}`).join(', ')}</p><p className="mt-1 text-[10px] font-bold text-gray-600 dark:text-gray-300">Status: {order.status}</p></div>)}</div></div>
              </div>;
            })()}
          </section>
        </div>
      </div>
    </div>
  );
};
