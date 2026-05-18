import MarkdownContent from '@/components/MarkdownContent';

export default function MarkdownPreview({ content }: { content: string }) {
  return <MarkdownContent content={content} />;
}
