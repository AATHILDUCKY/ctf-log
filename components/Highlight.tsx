'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface HighlightProps {
  language: string;
  value: string;
}

export default function Highlight({ language, value }: HighlightProps) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="rounded-lg overflow-hidden my-6 border border-dracula-selection shadow-2xl">
      <div className="bg-dracula-selection px-4 py-2 flex items-center justify-between">
        <span className="text-xs font-mono text-dracula-comment uppercase tracking-widest">{language || 'text'}</span>
        <button
          type="button"
          onClick={copyCode}
          className="inline-flex items-center gap-1.5 border border-dracula-line/40 px-2 py-1 text-xs font-bold uppercase tracking-widest text-dracula-comment transition-colors hover:border-dracula-cyan hover:text-dracula-cyan"
          title="Copy code"
          aria-label="Copy code"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={dracula}
        customStyle={{
          margin: 0,
          padding: '1.5rem',
          fontSize: '0.875rem',
          backgroundColor: '#282A36',
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
}
