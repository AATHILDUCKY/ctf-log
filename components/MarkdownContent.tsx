'use client';

import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CodeBlock from '@/components/CodeBlock';

export default function MarkdownContent({ content, fallback = 'Start writing to preview your markdown.' }: { content: string; fallback?: string }) {
  return (
    <div className="markdown-body">
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return match ? (
              <CodeBlock language={match[1]} value={String(children).replace(/\n$/, '')} />
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          img({ src = '', alt = '' }) {
            const resolvedSrc = typeof src === 'string' ? src : '';
            const videoId = getYouTubeVideoId(resolvedSrc);

            if (videoId) {
              return (
                <span className="my-6 block overflow-hidden rounded-lg border border-dracula-line/40 bg-dracula-selection/20">
                  <iframe
                    className="aspect-video w-full"
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title={alt || 'Embedded YouTube video'}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </span>
              );
            }

            return <img src={resolvedSrc} alt={alt} loading="lazy" className="my-6 rounded-lg border border-dracula-line/40" />;
          },
        }}
      >
        {content || fallback}
      </Markdown>
    </div>
  );
}

function getYouTubeVideoId(value: string) {
  try {
    const url = new URL(value);
    const hostname = url.hostname.replace(/^www\./, '');

    if (hostname === 'youtu.be') {
      return url.pathname.split('/').filter(Boolean)[0] ?? null;
    }

    if (hostname === 'youtube.com' || hostname === 'm.youtube.com') {
      if (url.pathname === '/watch') return url.searchParams.get('v');
      if (url.pathname.startsWith('/embed/') || url.pathname.startsWith('/shorts/')) {
        return url.pathname.split('/').filter(Boolean)[1] ?? null;
      }
    }
  } catch {
    return null;
  }

  return null;
}
