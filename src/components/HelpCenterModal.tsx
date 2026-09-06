import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, HelpCircle, Mail, MessageCircle, Paperclip, Search, Send, Ticket, X } from 'lucide-react';
import { HelpSectionType, Order, SupportTicket } from '../types';
import { createSupportTicket, getCustomerSupportTickets, replyToSupportTicket, subscribeToCustomerSupportTickets } from '../config/ordersService';

interface HelpCenterModalProps {
  isOpen: boolean;
  section: HelpSectionType;
  onClose: () => void;
  onSelectSection: (section: HelpSectionType) => void;
  onStartShopping: () => void;
  showToast: (message: string) => void;
  orders?: Order[];
  onOpenLiveTracking?: (orderId?: string) => void;
}

const categories = [
  ['Orders', ['How to place an order', 'Where is my order?', 'Track my order', 'Cancel an order', 'Change delivery address', 'Order delayed', 'Order not received']],
  ['Delivery', ['Delivery areas', 'Delivery fees', 'Estimated delivery time', 'How delivery works', 'What happens when the rider arrives?', 'Order on Delivery / Cash on Delivery', 'What if I am not available?']],
  ['Returns & Refunds', ['How to return an item', 'Return eligibility', 'Damaged item', 'Wrong item received', 'Missing item', 'Refund policy']],
  ['Account & Security', ['Google sign-in problems', 'Forgot password', 'Change email or phone number', 'Manage account', 'Account security', 'Log out of other devices']],
  ['Shopping', ['How to search for products', 'How to add products to cart', 'How to place an order', 'Wishlist', 'Product availability']],
  ['Saved Addresses', ['Add delivery address', 'Edit address', 'Delete address', 'Set default address']],
  ['Notifications', ['Order notifications', 'Delivery updates', 'Notification settings']],
] as const;

const answerFor = (item: string) => {
  if (item === 'Order on Delivery / Cash on Delivery') return 'Payment Method: Order on Delivery. Pay when your order arrives. NeoMart does not require online payment for orders.';
  if (item === 'How to place an order') return 'Browse products, add an item to your cart, choose Checkout, confirm your delivery address, and place the order. Payment is collected when your order arrives.';
  if (item === 'What happens when the rider arrives?') return 'Receive your parcel and pay the exact Order on Delivery amount shown in your order summary.';
  if (item === 'How to return an item' || item === 'Damaged item' || item === 'Wrong item received' || item === 'Missing item') return 'Submit a support ticket with your order number, a clear description, and an image when useful. Keep the item and packaging until support confirms next steps.';
  if (item === 'Track my order' || item === 'Where is my order?') return 'Use Track Order in the navbar or open your order history. You can also contact support with your order number.';
  if (item === 'Delivery fees') return 'Any delivery fee is shown clearly during checkout before you place the order.';
  if (item === 'Estimated delivery time') return 'Your estimated delivery time is shown during checkout and may be updated after dispatch.';
  if (item === 'Google sign-in problems') return 'Check that Google sign-in is enabled and try again. Submit a support ticket if the problem continues.';
  if (item === 'Forgot password') return 'Use the password reset option in Account to receive a reset email.';
  return `NeoMart support can help with ${item.toLowerCase()}. Submit a ticket with the relevant order number and details if you need personal assistance.`;
};

const dateText = (value: string) => new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });

export const HelpCenterModal: React.FC<HelpCenterModalProps> = ({ isOpen, section, onClose, onSelectSection, onStartShopping, showToast, orders = [] }) => {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [reply, setReply] = useState('');
  const [attachment, setAttachment] = useState('');
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ subject: '', category: 'Orders', description: '', orderId: '' });
  const knownReplies = useRef<Record<string, number>>({});

  useEffect(() => {
    if (!isOpen) return;
    void getCustomerSupportTickets().then(setTickets).catch(() => setTickets([]));
    const unsubscribe = subscribeToCustomerSupportTickets((next) => {
      setTickets(next);
      setSelectedTicket((current) => current ? next.find((ticket) => ticket.id === current.id) || current : current);
      next.forEach((ticket) => {
        const previousCount = knownReplies.current[ticket.id];
        const adminReplyCount = ticket.messages.filter((message) => message.senderRole === 'admin').length;
        if (previousCount !== undefined && adminReplyCount > previousCount) {
          showToast(`NeoMart Support replied to ${ticket.id}`);
          if ('Notification' in window && Notification.permission === 'granted') new Notification('NeoMart Support replied', { body: `Open ticket ${ticket.id} to read the reply.` });
        }
        knownReplies.current[ticket.id] = adminReplyCount;
      });
    });
    return unsubscribe;
  }, [isOpen]);

  const visibleCategories = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return categories;
    return categories.map(([title, items]) => [title, items.filter((item) => `${title} ${item} ${answerFor(item)}`.toLowerCase().includes(term))] as const).filter(([, items]) => items.length);
  }, [search]);

  const submitTicket = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.subject.trim() || !form.description.trim()) return;
    setBusy(true);
    try {
      const ticket = await createSupportTicket({ subject: form.subject.trim(), category: form.category, description: form.description.trim(), orderId: form.orderId.trim() || undefined, attachmentName: attachment || undefined });
      setTickets((current) => [ticket, ...current]);
      setSelectedTicket(ticket);
      setForm({ subject: '', category: 'Orders', description: '', orderId: '' });
      setAttachment('');
      showToast(`Ticket ${ticket.id} submitted`);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Sign in to submit a support ticket');
    } finally {
      setBusy(false);
    }
  };

  const sendReply = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedTicket || !reply.trim()) return;
    setBusy(true);
    try {
      await replyToSupportTicket(selectedTicket.id, reply.trim());
      setReply('');
      showToast('Reply sent to support');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not send reply');
    } finally {
      setBusy(false);
    }
  };

  if (!isOpen) return null;
  const showingSupport = section === 'help-support' || section === 'live-chat';
  const customerOrders = orders.filter((order) => order.orderSource === 'customer');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-2 backdrop-blur-sm sm:p-4">
      <div className="flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-[#18181b]">
        <header className="flex items-center justify-between gap-4 border-b border-gray-800 bg-[#222222] px-4 py-4 text-white sm:px-6">
          <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-300">NeoMart Customer Care</p><h2 className="mt-1 text-xl font-black sm:text-2xl">Help &amp; Support</h2><p className="mt-1 text-xs text-gray-300">Answers, order help, and direct support.</p></div>
          <button type="button" onClick={onClose} aria-label="Close help and support" className="rounded-xl p-2 text-gray-300 hover:bg-white/10"><X className="h-5 w-5" /></button>
        </header>
        <div className="grid min-h-0 flex-1 md:grid-cols-[220px_1fr]">
          <aside className="border-b border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-[#202024] md:border-b-0 md:border-r">
            <button type="button" onClick={() => onSelectSection('help-support')} className={`mb-3 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-extrabold ${showingSupport ? 'bg-orange-500 text-white' : 'text-gray-700 dark:text-gray-200'}`}><Ticket className="h-4 w-4" />Support centre</button>
            <div className="grid max-h-40 grid-cols-2 gap-1 overflow-y-auto md:block md:max-h-none">{categories.map(([title]) => <button key={title} type="button" onClick={() => { setSearch(title); onSelectSection('help-support'); }} className="block w-full rounded-lg px-3 py-2 text-left text-xs font-bold text-gray-600 dark:text-gray-300">{title}</button>)}</div>
            <div className="mt-4 hidden border-t border-gray-200 pt-4 dark:border-gray-700 md:block"><p className="px-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">Quick contact</p><a href="https://wa.me/2348135648242" target="_blank" rel="noreferrer" className="mt-2 flex items-center gap-2 px-3 py-2 text-xs font-bold text-emerald-600"><MessageCircle className="h-4 w-4" />WhatsApp Support</a><a href="mailto:support@neomart.ng" className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-600 dark:text-gray-300"><Mail className="h-4 w-4" />Email Support</a></div>
          </aside>
          <main className="min-h-0 overflow-y-auto p-4 sm:p-6">
            {!showingSupport ? (
              <div className="space-y-5">
                <div className="relative"><Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="How can we help you?" className="w-full rounded-2xl border border-gray-300 bg-gray-50 py-4 pl-12 pr-4 text-sm outline-none focus:border-orange-500 dark:border-gray-700 dark:bg-[#202024]" /></div>
                <div className="grid gap-3 sm:grid-cols-2">{visibleCategories.map(([title, items]) => <section key={title} className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800"><h3 className="mb-3 flex items-center gap-2 font-black text-gray-900 dark:text-white"><HelpCircle className="h-4 w-4 text-orange-500" />{title}</h3>{items.map((item) => <div key={item} className="border-b border-gray-100 last:border-0 dark:border-gray-800"><button type="button" onClick={() => setExpanded(expanded === item ? null : item)} className="flex w-full items-center justify-between gap-3 py-2 text-left text-xs font-bold text-gray-700 dark:text-gray-300"><span>{item}</span><ChevronDown className={`h-4 w-4 shrink-0 ${expanded === item ? 'rotate-180 text-orange-500' : 'text-gray-400'}`} /></button>{expanded === item && <p className="pb-3 text-xs leading-5 text-gray-500 dark:text-gray-400">{answerFor(item)}</p>}</div>)}</section>)}</div>
                {visibleCategories.length === 0 && <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-gray-500">No help articles matched that search.</p>}
                <div className="grid gap-3 border-t border-gray-200 pt-5 sm:grid-cols-2 dark:border-gray-800"><button type="button" onClick={() => onSelectSection('help-support')} className="rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white">Contact Support</button><button type="button" onClick={onStartShopping} className="rounded-xl border border-gray-300 px-4 py-3 text-sm font-bold text-gray-700 dark:border-gray-700 dark:text-gray-200">Continue shopping</button></div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-orange-500">Direct support</p><h3 className="mt-1 text-2xl font-black text-gray-900 dark:text-white">How can we help?</h3><p className="mt-1 text-sm text-gray-500">Live Chat, WhatsApp Support, Email Support, and tickets.</p></div><div className="flex gap-2"><a href="https://wa.me/2348135648242" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white"><MessageCircle className="h-4 w-4" />WhatsApp</a><a href="mailto:support@neomart.ng" className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-3 py-2 text-xs font-bold dark:border-gray-700"><Mail className="h-4 w-4" />Email</a></div></div>
                <div className="grid gap-5 lg:grid-cols-2">
                  <form onSubmit={submitTicket} className="space-y-3 rounded-2xl border border-gray-200 p-4 dark:border-gray-800"><h4 className="font-black text-gray-900 dark:text-white">Submit a Support Ticket</h4><input required value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} placeholder="Subject" className="w-full rounded-xl border border-gray-300 bg-transparent px-3 py-3 text-sm outline-none focus:border-orange-500 dark:border-gray-700" /><select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="w-full rounded-xl border border-gray-300 bg-transparent px-3 py-3 text-sm dark:border-gray-700"><option>Orders</option><option>Delivery</option><option>Returns &amp; Refunds</option><option>Account &amp; Security</option><option>Shopping</option><option>Saved Addresses</option><option>Notifications</option><option>Other</option></select><textarea required value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Describe the problem" rows={4} className="w-full resize-none rounded-xl border border-gray-300 bg-transparent px-3 py-3 text-sm outline-none focus:border-orange-500 dark:border-gray-700" /><select value={form.orderId} onChange={(event) => setForm({ ...form, orderId: event.target.value })} className="w-full rounded-xl border border-gray-300 bg-transparent px-3 py-3 text-sm dark:border-gray-700"><option value="">Order number (optional)</option>{customerOrders.map((order) => <option key={order.id} value={order.id}>#{order.id}</option>)}</select><label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-gray-300 px-3 py-3 text-xs font-bold text-gray-500 dark:border-gray-700"><Paperclip className="h-4 w-4" />{attachment || 'Attach an image or file'}<input type="file" className="hidden" onChange={(event) => setAttachment(event.target.files?.[0]?.name || '')} /></label><button disabled={busy} type="submit" className="w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white disabled:opacity-50">{busy ? 'Sending...' : 'Submit Ticket'}</button></form>
                  <div className="space-y-3"><h4 className="font-black text-gray-900 dark:text-white">My Support Tickets</h4>{tickets.length === 0 ? <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-gray-500">No tickets yet. Support is ready when you need us.</div> : tickets.map((ticket) => <button key={ticket.id} type="button" onClick={() => setSelectedTicket(ticket)} className={`w-full rounded-2xl border p-4 text-left ${selectedTicket?.id === ticket.id ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20' : 'border-gray-200 dark:border-gray-800'}`}><div className="flex items-center justify-between gap-3"><span className="font-mono text-xs font-black">{ticket.id}</span><span className="rounded-full bg-orange-100 px-2 py-1 text-[10px] font-bold text-orange-700 dark:bg-orange-950/40 dark:text-orange-300">{ticket.status}</span></div><p className="mt-2 font-bold text-gray-900 dark:text-white">{ticket.subject}</p><p className="mt-1 text-[11px] text-gray-500">Updated {dateText(ticket.updatedAt)}</p></button>)}</div>
                </div>
                {selectedTicket && <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800"><div className="flex items-start justify-between gap-3"><div><p className="font-mono text-xs font-black text-orange-500">{selectedTicket.id}</p><h4 className="mt-1 font-black text-gray-900 dark:text-white">{selectedTicket.subject}</h4><p className="mt-1 text-xs text-gray-500">{selectedTicket.status} · {dateText(selectedTicket.createdAt)}</p></div><button type="button" onClick={() => setSelectedTicket(null)} aria-label="Close ticket details"><X className="h-4 w-4" /></button></div><div className="mt-4 space-y-3">{selectedTicket.messages.map((message) => <div key={message.id} className={`rounded-xl p-3 text-sm ${message.senderRole === 'customer' ? 'ml-8 bg-orange-50 dark:bg-orange-950/20' : 'mr-8 bg-gray-100 dark:bg-gray-800'}`}><p className="text-gray-800 dark:text-gray-200">{message.text}</p><time className="mt-2 block text-[10px] text-gray-500">{message.senderRole === 'admin' ? 'NeoMart Support' : 'You'} · {dateText(message.createdAt)}</time></div>)}</div>{selectedTicket.status !== 'Closed' && <form onSubmit={sendReply} className="mt-4 flex gap-2"><input value={reply} onChange={(event) => setReply(event.target.value)} placeholder="Reply to support" className="min-w-0 flex-1 rounded-xl border border-gray-300 bg-transparent px-3 py-3 text-sm outline-none dark:border-gray-700" /><button disabled={busy} type="submit" aria-label="Send reply" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-orange-500 text-white disabled:opacity-50"><Send className="h-4 w-4" /></button></form>}</div>}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
