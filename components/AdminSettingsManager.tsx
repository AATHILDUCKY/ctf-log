'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Save } from 'lucide-react';

type SiteSettings = {
  siteName: string;
  challengeTracks?: string[];
};

export default function AdminSettingsManager({ initialSettings }: { initialSettings: SiteSettings }) {
  const [siteName, setSiteName] = useState(initialSettings.siteName);
  const [challengeTracks, setChallengeTracks] = useState<string[]>(initialSettings.challengeTracks ?? []);
  const [newTrack, setNewTrack] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setSiteName(initialSettings.siteName);
    setChallengeTracks(initialSettings.challengeTracks ?? []);
  }, [initialSettings.siteName, initialSettings.challengeTracks]);

  function addTrack() {
    const normalized = newTrack.trim();
    if (!normalized) return;
    if (challengeTracks.includes(normalized)) {
      setMessage('Track already added.');
      return;
    }

    setChallengeTracks((current) => [...current, normalized].slice(0, 30));
    setNewTrack('');
    setMessage('');
  }

  function removeTrack(track: string) {
    setChallengeTracks((current) => current.filter((item) => item !== track));
    setMessage('');
  }

  async function saveSettings(event: FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteName,
          challengeTracks,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setMessage(payload.error ?? 'Unable to save settings.');
        return;
      }

      setSiteName(payload.settings.siteName);
      setChallengeTracks(payload.settings.challengeTracks ?? []);
      setMessage('Settings saved.');
    } catch {
      setMessage('Saving failed. Try again.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={saveSettings} className="space-y-5">
      {message && <p className="rounded-md border border-dracula-line/40 bg-dracula-selection/20 px-4 py-3 text-sm text-dracula-cyan">{message}</p>}

      <section className="rounded-lg border border-dracula-line/40 bg-dracula-selection/10 p-5">
        <h2 className="text-lg font-bold">Brand Settings</h2>
        <p className="mt-1 text-sm text-dracula-comment">Update top navigation name from one place.</p>

        <div className="mt-4">
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-dracula-comment">Site Name</span>
            <input
              value={siteName}
              onChange={(event) => setSiteName(event.target.value)}
              className="admin-input"
              placeholder="Top navigation name"
              maxLength={40}
            />
          </label>
        </div>

        <div className="mt-5">
          <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-dracula-comment">Challenge Tracks</span>
          <p className="mb-2 text-xs text-dracula-comment">Add tracks used in the home sidebar filter and writeup category picker.</p>
          <div className="flex flex-wrap gap-2">
            <input
              value={newTrack}
              onChange={(event) => setNewTrack(event.target.value)}
              className="admin-input flex-1"
              placeholder="Add a new track (e.g. PicoCTF)"
              maxLength={40}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  addTrack();
                }
              }}
            />
            <button
              type="button"
              onClick={addTrack}
              className="rounded-md border border-dracula-line/50 px-3 py-2 text-sm font-bold text-dracula-fg hover:bg-dracula-selection/30"
            >
              Add
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {challengeTracks.map((track) => (
              <button
                key={track}
                type="button"
                onClick={() => removeTrack(track)}
                className="rounded-md border border-dracula-line/50 bg-dracula-bg/40 px-2 py-1 text-xs font-bold text-dracula-comment hover:text-dracula-red"
                title="Remove track"
              >
                {track} x
              </button>
            ))}
            {challengeTracks.length === 0 && <p className="text-xs text-dracula-comment">No tracks yet. Add at least one.</p>}
          </div>
        </div>
      </section>

      <button
        type="submit"
        disabled={isSaving}
        className="inline-flex items-center gap-2 rounded-md bg-dracula-purple px-4 py-2 text-sm font-bold text-dracula-bg disabled:opacity-60"
      >
        <Save className="h-4 w-4" />
        {isSaving ? 'Saving...' : 'Save Settings'}
      </button>
    </form>
  );
}
