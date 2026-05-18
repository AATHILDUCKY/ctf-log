'use client';

import dynamic from 'next/dynamic';

const Highlight = dynamic(() => import('@/components/Highlight'), {
  ssr: false,
  loading: () => <div className="bg-dracula-bg border border-dracula-selection rounded-lg my-6 h-24" />,
});

interface CodeBlockProps {
  language: string;
  value: string;
}

export default function CodeBlock({ language, value }: CodeBlockProps) {
  return <Highlight language={language} value={value} />;
}
