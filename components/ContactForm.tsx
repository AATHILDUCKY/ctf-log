'use client';

import { type FormEvent, useState } from 'react';
import { Mail, Send } from 'lucide-react';

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState('');
  const [isSending, setIsSending] = useState(false);

  async function submitMessage(event: FormEvent) {
    event.preventDefault();
    setIsSending(true);
    setStatus('');

    try {
      const response = await fetch('/api/contact-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const payload = await response.json();

      if (!response.ok) {
        setStatus(payload.error ?? 'Unable to send message.');
        return;
      }

      setForm({ name: '', email: '', subject: '', message: '' });
      setStatus('Message sent. It is now available in the admin inbox.');
    } catch {
      setStatus('Sending failed. Please try again.');
    } finally {
      setIsSending(false);
    }
  }

  return (
    <form onSubmit={submitMessage} className="grid gap-4 border border-dracula-line/40 bg-dracula-bg/40 p-5">
      <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-dracula-green">
        <Mail className="h-4 w-4" />
        Send a message
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label>
          <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-dracula-comment">Name</span>
          <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className="admin-input" maxLength={80} required />
        </label>
        <label>
          <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-dracula-comment">Email</span>
          <input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} className="admin-input" maxLength={120} required />
        </label>
      </div>
      <label>
        <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-dracula-comment">Subject</span>
        <input value={form.subject} onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))} className="admin-input" maxLength={140} required />
      </label>
      <label>
        <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-dracula-comment">Message</span>
        <textarea value={form.message} onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))} className="admin-input min-h-40" maxLength={5000} required />
      </label>
      {status && <p className="border border-dracula-line/40 bg-dracula-selection/20 px-4 py-3 text-sm text-dracula-cyan">{status}</p>}
      <button type="submit" disabled={isSending} className="inline-flex w-fit items-center gap-2 bg-dracula-green px-4 py-2 text-sm font-bold text-dracula-bg disabled:opacity-60">
        <Send className="h-4 w-4" />
        {isSending ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}
