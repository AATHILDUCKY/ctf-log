'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, LogIn, Shield } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');

    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const payload = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(payload.error ?? 'Unable to login.');
      return;
    }

    router.push('/admin');
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-dracula-bg text-dracula-fg flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-dracula-line/50 bg-dracula-selection/15 p-8">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-widest font-bold text-dracula-cyan">PwnTrends</p>
          <h1 className="mt-2 text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-dracula-green" />
            Admin Login
          </h1>
          <p className="mt-2 text-sm text-dracula-comment">Login to manage private and public writeups.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-dracula-comment">Username</span>
            <input value={username} onChange={(event) => setUsername(event.target.value)} className="admin-input" autoComplete="username" required />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-dracula-comment">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="admin-input"
              autoComplete="current-password"
              required
            />
          </label>

          {error ? <p className="text-sm text-dracula-red">{error}</p> : null}

          <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-dracula-purple px-4 py-2 text-sm font-bold text-dracula-bg disabled:opacity-60">
            {loading ? <Lock className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-dracula-line/30">
          <Link href="/" className="text-sm text-dracula-comment hover:text-dracula-fg">
            Back to public writeups
          </Link>
        </div>
      </div>
    </main>
  );
}
