import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-stone lg:prose-xl max-w-none 
      prose-headings:text-stone-900 prose-headings:font-bold prose-headings:tracking-tight
      prose-h1:text-4xl md:prose-h1:text-5xl prose-h1:mb-8
      prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
      prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
      prose-p:text-stone-600 prose-p:leading-relaxed prose-p:mb-6
      prose-a:text-lime-600 prose-a:no-underline hover:prose-a:underline prose-a:font-bold
      prose-strong:text-stone-900 prose-strong:font-bold
      prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-6
      prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-6
      prose-li:text-stone-600 prose-li:mb-2
      prose-table:w-full prose-table:border-collapse prose-table:my-8
      prose-th:bg-stone-50 prose-th:p-4 prose-th:text-left prose-th:border prose-th:border-stone-200 prose-th:font-bold
      prose-td:p-4 prose-td:border prose-td:border-stone-200 prose-td:text-stone-600
      prose-img:rounded-3xl prose-img:shadow-lg prose-img:my-12 prose-img:mx-auto prose-img:max-w-full
      prose-blockquote:border-l-4 prose-blockquote:border-lime-500 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-stone-700 prose-blockquote:bg-stone-50 prose-blockquote:py-4 prose-blockquote:rounded-r-2xl
    ">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
