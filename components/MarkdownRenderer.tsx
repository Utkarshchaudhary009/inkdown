'use client';

import React, { ElementType } from "react";
import { Streamdown } from "streamdown";
import { code } from "@streamdown/code";
import { math } from "@streamdown/math";
import { mermaid } from "@streamdown/mermaid";
import { cn } from "@/lib/utils";

// Utility to extract raw text from React children to generate heading IDs
function extractText(node: React.ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (React.isValidElement(node)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return extractText((node.props as any).children);
  }
  if (Array.isArray(node)) {
    return node.map(extractText).join("");
  }
  return "";
}

function generateId(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
}

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level: 1 | 2 | 3 | 4 | 5 | 6;
}

const HeadingRenderer = ({ level, children, className, ...props }: HeadingProps) => {
  const text = extractText(children);
  const id = generateId(text);
  const Tag = `h${level}` as ElementType;
  
  let sizeClass = "";
  if (level === 1) sizeClass = "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mt-10 mb-4 first:mt-0";
  if (level === 2) sizeClass = "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight mt-10 mb-4 first:mt-0";
  if (level === 3) sizeClass = "scroll-m-20 text-2xl font-semibold tracking-tight mt-8 mb-4";
  if (level === 4) sizeClass = "scroll-m-20 text-xl font-semibold tracking-tight mt-8 mb-4";
  if (level === 5) sizeClass = "scroll-m-20 text-lg font-semibold tracking-tight mt-6 mb-2";
  if (level === 6) sizeClass = "scroll-m-20 text-base font-semibold tracking-tight mt-6 mb-2";

  return (
    <Tag id={id} className={cn(sizeClass, className)} {...props}>
      {children}
    </Tag>
  );
};

const ImageRenderer = ({ src, alt, className, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img 
      src={src} 
      alt={alt || "Markdown image"} 
      className={cn("max-w-full h-auto rounded-md shadow-sm my-6", className)} 
      loading="lazy" 
      {...props} 
    />
  );
};

interface MarkdownRendererProps {
  content: string;
}

interface StreamdownComponentProps extends React.HTMLAttributes<HTMLElement> {
  node?: unknown;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="markdown-body">
      <Streamdown
        plugins={{
          code,
          math,
          mermaid,
        }}
        components={{
          h1: ({ node: _, ...props }: StreamdownComponentProps) => <HeadingRenderer level={1} {...props} />,
          h2: ({ node: _, ...props }: StreamdownComponentProps) => <HeadingRenderer level={2} {...props} />,
          h3: ({ node: _, ...props }: StreamdownComponentProps) => <HeadingRenderer level={3} {...props} />,
          h4: ({ node: _, ...props }: StreamdownComponentProps) => <HeadingRenderer level={4} {...props} />,
          h5: ({ node: _, ...props }: StreamdownComponentProps) => <HeadingRenderer level={5} {...props} />,
          h6: ({ node: _, ...props }: StreamdownComponentProps) => <HeadingRenderer level={6} {...props} />,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          img: ImageRenderer as any,
          p: ({ node: _, className, children, ...props }: StreamdownComponentProps) => (
            <p className={cn("leading-7 [&:not(:first-child)]:mt-6", className)} {...props}>{children}</p>
          ),
          a: ({ node: _, className, children, ...props }: StreamdownComponentProps & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
            <a className={cn("font-medium text-primary underline underline-offset-4", className)} {...props}>{children}</a>
          ),
          ul: ({ node: _, className, children, ...props }: StreamdownComponentProps) => (
            <ul className={cn("my-6 ml-6 list-disc [&>li]:mt-2", className)} {...props}>{children}</ul>
          ),
          ol: ({ node: _, className, children, ...props }: StreamdownComponentProps) => (
            <ol className={cn("my-6 ml-6 list-decimal [&>li]:mt-2", className)} {...props}>{children}</ol>
          ),
          li: ({ node: _, className, children, ...props }: StreamdownComponentProps & React.LiHTMLAttributes<HTMLLIElement>) => (
            <li className={cn("leading-7", className)} {...props}>{children}</li>
          ),
          blockquote: ({ node: _, className, children, ...props }: StreamdownComponentProps & React.BlockquoteHTMLAttributes<HTMLQuoteElement>) => (
            <blockquote className={cn("mt-6 border-l-2 border-primary pl-6 italic", className)} {...props}>{children}</blockquote>
          ),
          inlineCode: ({ node: _, className, children, ...props }: StreamdownComponentProps) => (
            <code className={cn("relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold", className)} {...props}>{children}</code>
          ),
        }}
      >
        {content}
      </Streamdown>
    </div>
  );
}
