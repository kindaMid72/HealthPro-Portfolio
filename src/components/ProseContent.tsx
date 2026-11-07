interface ProseContentProps {
  html: string;
  className?: string;
}

/** Long-form content (articles/services): the only place where Literata serif font is applied. */
export default function ProseContent({ html, className = "" }: ProseContentProps) {
  return (
    <div
      className={`prose prose-lg article-prose font-reading max-w-[68ch] prose-headings:font-sans prose-headings:text-text-heading prose-a:text-primary prose-strong:text-text-heading prose-img:rounded-xl ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
