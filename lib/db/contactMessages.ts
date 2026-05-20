import { randomUUID } from 'node:crypto';
import { db } from '@/lib/db/connection';
import type { ContactMessage } from '@/types';

type ContactMessageRow = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: ContactMessage['status'];
  created_at: string;
  updated_at: string;
};

db.exec(`
  CREATE TABLE IF NOT EXISTS contact_messages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_contact_messages_status_created ON contact_messages(status, created_at DESC);
`);

function toContactMessage(row: ContactMessageRow): ContactMessage {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    subject: row.subject,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function listContactMessages() {
  const rows = db.prepare('SELECT * FROM contact_messages ORDER BY created_at DESC').all() as ContactMessageRow[];
  return rows.map(toContactMessage);
}

export function getContactMessageStats() {
  const row = db.prepare(`
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) AS unread
    FROM contact_messages
  `).get() as { total: number; unread: number | null };

  return { total: row.total, unread: row.unread ?? 0 };
}

export function createContactMessage(input: { name: string; email: string; subject: string; message: string }) {
  const now = new Date().toISOString();
  const message = {
    id: randomUUID(),
    name: normalize(input.name, 80),
    email: normalize(input.email, 120).toLowerCase(),
    subject: normalize(input.subject, 140),
    message: normalize(input.message, 5000),
    status: 'new' as const,
    createdAt: now,
    updatedAt: now,
  };

  if (!message.name || !message.email || !message.subject || !message.message) {
    throw new Error('Name, email, subject and message are required.');
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(message.email)) {
    throw new Error('Enter a valid email address.');
  }

  db.prepare(`
    INSERT INTO contact_messages (id, name, email, subject, message, status, created_at, updated_at)
    VALUES (@id, @name, @email, @subject, @message, @status, @createdAt, @updatedAt)
  `).run(message);

  return message;
}

export function updateContactMessageStatus(id: string, status: ContactMessage['status']) {
  if (!['new', 'read', 'archived'].includes(status)) throw new Error('Invalid status.');

  const updatedAt = new Date().toISOString();
  db.prepare('UPDATE contact_messages SET status = ?, updated_at = ? WHERE id = ?').run(status, updatedAt, id);
  const row = db.prepare('SELECT * FROM contact_messages WHERE id = ?').get(id) as ContactMessageRow | undefined;
  if (!row) throw new Error('Message not found.');
  return toContactMessage(row);
}

export function deleteContactMessage(id: string) {
  db.prepare('DELETE FROM contact_messages WHERE id = ?').run(id);
}

function normalize(value: string, maxLength: number) {
  return String(value ?? '').trim().replace(/\s+/g, ' ').slice(0, maxLength);
}
