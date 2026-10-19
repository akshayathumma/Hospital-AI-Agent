import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** Renders Markdown and (optionally) reveals it progressively for a streaming effect. */
export default function StreamedMarkdown({ text, animate, onTick }) {
  const [count, setCount] = useState(animate ? 0 : text.length);

  useEffect(() => {
    if (!animate) {
      setCount(text.length);
      return undefined;
    }
    let i = 0;
    const id = setInterval(() => {
      i = Math.min(i + 4, text.length);
      setCount(i);
      onTick?.();
      if (i >= text.length) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, animate]);

  return (
    <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-2 prose-ul:my-2 prose-headings:mb-2 prose-headings:mt-3">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{text.slice(0, count)}</ReactMarkdown>
    </div>
  );
}