import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MessageCircle, Search, Send } from 'lucide-react';
import { SupportTicket, SupportTicketStatus } from '../types';
import { replyToSupportTicket, subscribeToAllSupportTickets, updateSupportTicketStatus } from '../config/ordersService';

export const AdminSupportRoom: React.FC<{ onToast: (message: string) => void }> = ({ onToast }) => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selected, setSelected] = useState<SupportTicket | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'All' | SupportTicketStatus>('All');
  const [category, setCategory] = useState('All');
  const [reply, setReply] = useState('');
  const knownTickets = useRef<Set<string> | null>(null);

  useEffect(() => subscribeToAllSupportTickets((next) => {
    setTickets(next);
    setSelected((current) => current ? next.find((ticket) => ticket.id === current.id) || current : next[0] || null);
    if (knownTickets.current && next.some((ticket) => !knownTickets.current?.has(ticket.id)) && 'Notification' in window && Notification.permission === 'granted') new Notification('New NeoMart support ticket', { body: 'A customer needs assistance.' });
    knownTickets.current = new Set(next.map((ticket) => ticket.id));
  }), []);

  const categories = useMemo(() => ['All', ...new Set(tickets.map((ticket) => ticket.category))], [tickets]);
  const visible = tickets.filter((ticket) => {
    const term = search.toLowerCase();
    return (status === 'All' || ticket.status === status) && (category === 'All' || ticket.category === category) && `${ticket.id} ${ticket.subject} ${ticket.customerEmail || ''} ${ticket.customerName || ''}`.toLowerCase().includes(term);
  });
  const changeStatus = async (next: SupportTicketStatus) => {
    if (!selected) return;
    try { await updateSupportTicketStatus(selected.id, next); onToast(`Ticket ${selected.id} marked ${next}`); } catch (error) { onToast(error instanceof Error ? error.message : 'Could not update ticket'); }
  };
  const sendReply = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selected || !reply.trim()) return;
    try { await replyToSupportTicket(selected.id, reply.trim()); setReply(''); onToast('Reply sent'); } catch (error) { onToast(error instanceof Error ? error.message : 'Could not send reply'); }
  };

  return <div className="space-y-5"><div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]"><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tickets, customers, or order numbers" className="w-full rounded-xl border border-gray-700 bg-gray-900/70 py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-orange-500" /></div><select value={status} onChange={(event) => setStatus(event.target.value as 'All' | SupportTicketStatus)} className="rounded-xl border border-gray-700 bg-gray-900 px-3 py-3 text-sm text-white outline-none"><option>All</option><option>Open</option><option>In Progress</option><option>Resolved</option><option>Closed</option></select><select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-xl border border-gray-700 bg-gray-900 px-3 py-3 text-sm text-white outline-none">{categories.map((item) => <option key={item}>{item}</option>)}</select></div><div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)]"><div className="space-y-2">{visible.length === 0 ? <div className="rounded-2xl border border-dashed border-gray-700 p-8 text-center text-sm text-gray-500">No support tickets found.</div> : visible.map((ticket) => <button key={ticket.id} type="button" onClick={() => setSelected(ticket)} className={`w-full rounded-2xl border p-4 text-left ${selected?.id === ticket.id ? 'border-orange-500 bg-orange-500/10' : 'border-gray-800 bg-gray-900/50 hover:border-gray-600'}`}><div className="flex items-center justify-between gap-3"><span className="font-mono text-xs font-bold text-orange-300">{ticket.id}</span><span className="text-[10px] font-bold text-gray-400">{ticket.status}</span></div><p className="mt-2 font-bold text-white">{ticket.subject}</p><p className="mt-1 truncate text-xs text-gray-400">{ticket.customerName || ticket.customerEmail || ticket.userId}</p><p className="mt-2 text-[10px] text-gray-500">{new Date(ticket.updatedAt).toLocaleString()}</p></button>)}</div>{selected ? <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-5"><div className="flex flex-col gap-4 border-b border-gray-800 pb-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-mono text-xs font-bold text-orange-300">{selected.id}</p><h2 className="mt-1 text-xl font-black text-white">{selected.subject}</h2><p className="mt-1 text-xs text-gray-400">{selected.customerName || 'Customer'} · {selected.customerEmail || selected.userId}</p><p className="mt-1 text-xs text-gray-500">Category: {selected.category}{selected.orderId ? ` · Order #${selected.orderId}` : ''}</p></div><select value={selected.status} onChange={(event) => void changeStatus(event.target.value as SupportTicketStatus)} className="rounded-xl border border-gray-700 bg-gray-950 px-3 py-2 text-xs font-bold text-white"><option>Open</option><option>In Progress</option><option>Resolved</option><option>Closed</option></select></div><div className="my-5 space-y-3">{selected.messages.map((message) => <div key={message.id} className={`rounded-xl p-3 text-sm ${message.senderRole === 'admin' ? 'ml-8 bg-orange-500/10 text-orange-100' : 'mr-8 bg-gray-800 text-gray-300'}`}><p>{message.text}</p><time className="mt-2 block text-[10px] text-gray-500">{message.senderRole === 'admin' ? 'Admin' : 'Customer'} · {new Date(message.createdAt).toLocaleString()}</time></div>)}</div><form onSubmit={sendReply} className="flex gap-2"><input value={reply} onChange={(event) => setReply(event.target.value)} placeholder="Reply to customer" className="min-w-0 flex-1 rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 text-sm text-white outline-none focus:border-orange-500" /><button type="submit" aria-label="Send reply" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-orange-500 text-white hover:bg-orange-400"><Send className="h-4 w-4" /></button></form></div> : <div className="grid min-h-60 place-items-center rounded-2xl border border-dashed border-gray-700 text-center text-sm text-gray-500"><div><MessageCircle className="mx-auto mb-3 h-8 w-8 text-gray-600" /><p>Select a ticket to view its history.</p></div></div>}</div></div>;
};
