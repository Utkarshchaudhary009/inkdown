import React from "react";
import { Streamdown } from "streamdown";
import { codePlugin } from "@streamdown/code";
import { mathPlugin } from "@streamdown/math";
import { mermaidPlugin } from "@streamdown/mermaid";

// Utility to extract raw text from React children to generate heading IDs
function extractText(node: React.ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (React.isValidElement(node)) {
    return extractText(node.props.children);
  }
  if (Array.isArray(node)) {
    return node.map(extractText).join("");
  }
  return "";
}

function generateId(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
}

const HeadingRenderer = ({ level, children, ...props }: any) => {
  const text = extractText(children);
  const id = generateId(text);
  const Tag = `h${level}` as any;
  return (
    <Tag id={id} {...props}>
      {children}
    </Tag>
  );
};

const ImageRenderer = ({ src, alt, ...props }: any) => {
  return (
    <img 
      src={src} 
      alt={alt || "Markdown image"} 
      className="max-w-full h-auto rounded-md shadow-sm" 
      loading="lazy" 
      {...props} 
    />
  );
};

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <Streamdown
      markdown={content}
      plugins={[codePlugin(), mathPlugin(), mermaidPlugin()]}
      components={{
        h1: (props: any) => <HeadingRenderer level={1} {...props} />,
        h2: (props: any) => <HeadingRenderer level={2} {...props} />,
        h3: (props: any) => <HeadingRenderer level={3} {...props} />,
        h4: (props: any) => <HeadingRenderer level={4} {...props} />,
        h5: (props: any) => <HeadingRenderer level={5} {...props} />,
        h6: (props: any) => <HeadingRenderer level={6} {...props} />,
        img: ImageRenderer,
      }}
    />
  );
}
