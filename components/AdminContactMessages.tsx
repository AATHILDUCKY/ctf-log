'use client';

import { useMemo, useState } from 'react';
import { Archive, MailOpen, Search, Trash2 } from 'lucide-react';
import type { ContactMessage } from '@/types';

export default function AdminContactMessages({ initialMessages }: { initialMessages: ContactMessage[] }) {
  const [messages, setMessages] = useState(initialMessages);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ContactMessage['status'] | 'all'>('all');
  const [notice, setNotice] = useState('');

  const filteredMessages = useMemo(() => {
    const normalized = query.toLowerCase();
    return messages.filter((message) => {
      const matchesStatus = statusFilter === 'all' || message.status === statusFilter;
      const matchesQuery = [message.name, message.email, message.subject, message.message].some((value) => value.toLowerCase().includes(normalized));
      return matchesStatus && matchesQuery;
    });
  }, [messages, query, statusFilter]);

  async function setStatus(id: string, status: ContactMessage['status']) {
    const response = await fetch(`/api/contact-messages/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const payload = await response.json();
    if (!response.ok) {
      setNotice(payload.error ?? 'Unable to update message.');
      return;
    }

    setMessages((current) => current.map((message) => (message.id === id ? payload.message : message)));
    setNotice('Message updated.');
  }

  async function removeMessage(id: string) {
    const response = await fetch(`/api/contact-messages/${id}`, { method: 'DELETE' });
    if (!response.ok) {
      setNotice('Unable to delete message.');
      return;
    }

    setMessages((current) => current.filter((message) => message.id !== id));
    setNotice('Message deleted.');
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 border border-dracula-line/40 bg-dracula-selection/10 p-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 items-center gap-2 border border-dracula-line/50 bg-dracula-bg/70 px-3 py-2 xl:w-96">
          <Search className="h-4 w-4 text-dracula-comment" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search messages..." className="w-full bg-transparent text-sm outline-none placeholder:text-dracula-line" />
        </div>
        <div className="flex flex-wrap gap-2">
          {(['all', 'new', 'read', 'archived'] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-2 text-xs font-bold uppercase transition-colors ${
                statusFilter === status ? 'bg-dracula-cyan text-dracula-bg' : 'bg-dracula-selection/40 text-dracula-comment hover:text-dracula-fg'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {notice && <p className="border border-dracula-line/40 bg-dracula-selection/20 px-4 py-3 text-sm text-dracula-cyan">{notice}</p>}

      <section className="border border-dracula-line/40 bg-dracula-selection/10">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="border-b border-dracula-line/30 text-xs uppercase text-dracula-comment">
              <tr>
                <th className="px-4 py-3 font-bold">Message</th>
                <th className="px-4 py-3 font-bold">Sender</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 font-bold">Date</th>
                <th className="px-4 py-3 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMessages.map((message) => (
                <tr key={message.id} className="border-b border-dracula-line/20 align-top last:border-0 hover:bg-dracula-selection/20">
                  <td className="max-w-xl px-4 py-4">
                    <p className="font-bold text-dracula-fg">{message.subject}</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-dracula-comment">{message.message}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-bold text-dracula-fg">{message.name}</p>
                    <a href={`mailto:${message.email}`} className="mt-1 block text-xs text-dracula-cyan hover:underline">
                      {message.email}
                    </a>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-bold uppercase ${message.status === 'new' ? 'bg-dracula-green/10 text-dracula-green' : 'bg-dracula-selection/40 text-dracula-comment'}`}>
                      {message.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-mono text-xs text-dracula-comment">{formatDate(message.createdAt)}</td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <button type="button" title="Mark read" onClick={() => setStatus(message.id, 'read')} className="flex h-9 w-9 items-center justify-center border border-dracula-line/40 text-dracula-cyan hover:bg-dracula-cyan/10">
                        <MailOpen className="h-4 w-4" />
                      </button>
                      <button type="button" title="Archive" onClick={() => setStatus(message.id, 'archived')} className="flex h-9 w-9 items-center justify-center border border-dracula-line/40 text-dracula-orange hover:bg-dracula-orange/10">
                        <Archive className="h-4 w-4" />
                      </button>
                      <button type="button" title="Delete" onClick={() => removeMessage(message.id)} className="flex h-9 w-9 items-center justify-center border border-dracula-red/50 text-dracula-red hover:bg-dracula-red/10">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredMessages.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-dracula-comment">
                    No contact messages match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function formatDate(value: string) {
  return new Date(value).toISOString().replace('T', ' ').slice(0, 16);
}
