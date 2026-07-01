'use client';

import React, { ElementType, useId, useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Virtuoso } from "react-virtuoso";
import { unified } from "unified";
import remarkParse from "remark-parse";

// Utility to extract raw text from React children to generate heading IDs
function extractText(node: React.ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
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

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level: 1 | 2 | 3 | 4 | 5 | 6;
}

const HeadingRenderer = ({ level, children, className, ...props }: HeadingProps) => {
  const text = extractText(children);
  const baseId = generateId(text);
  const reactId = useId().replace(/:/g, '');
  
  // Combine semantic base ID with guaranteed unique reactId
  const id = `${baseId}-${reactId}`;
  
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

function omitNode<T extends StreamdownComponentProps>(props: T) {
  const { node, ...rest } = props;
  void node;
  return rest;
}

// Stable component map defined outside render to prevent Virtuoso from constantly
// remounting these components when scrolling
const markdownComponents = {
  h1: (props: StreamdownComponentProps) => <HeadingRenderer level={1} {...omitNode(props)} />,
  h2: (props: StreamdownComponentProps) => <HeadingRenderer level={2} {...omitNode(props)} />,
  h3: (props: StreamdownComponentProps) => <HeadingRenderer level={3} {...omitNode(props)} />,
  h4: (props: StreamdownComponentProps) => <HeadingRenderer level={4} {...omitNode(props)} />,
  h5: (props: StreamdownComponentProps) => <HeadingRenderer level={5} {...omitNode(props)} />,
  h6: (props: StreamdownComponentProps) => <HeadingRenderer level={6} {...omitNode(props)} />,
  img: (props: StreamdownComponentProps & React.ImgHTMLAttributes<HTMLImageElement>) => <ImageRenderer {...omitNode(props)} />,
  p: (componentProps: StreamdownComponentProps) => {
    const { className, children, ...props } = omitNode(componentProps);
    return <p className={cn("leading-7 [&:not(:first-child)]:mt-6", className)} {...props}>{children}</p>;
  },
  a: (componentProps: StreamdownComponentProps & React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    const { className, children, ...props } = omitNode(componentProps);
    return <a className={cn("font-medium text-primary underline underline-offset-4", className)} {...props}>{children}</a>;
  },
  ul: (componentProps: StreamdownComponentProps) => {
    const { className, children, ...props } = omitNode(componentProps);
    return <ul className={cn("my-6 ml-6 list-disc [&>li]:mt-2", className)} {...props}>{children}</ul>;
  },
  ol: (componentProps: StreamdownComponentProps) => {
    const { className, children, ...props } = omitNode(componentProps);
    return <ol className={cn("my-6 ml-6 list-decimal [&>li]:mt-2", className)} {...props}>{children}</ol>;
  },
  li: (componentProps: StreamdownComponentProps & React.LiHTMLAttributes<HTMLLIElement>) => {
    const { className, children, ...props } = omitNode(componentProps);
    return <li className={cn("leading-7", className)} {...props}>{children}</li>;
  },
  blockquote: (componentProps: StreamdownComponentProps & React.BlockquoteHTMLAttributes<HTMLQuoteElement>) => {
    const { className, children, ...props } = omitNode(componentProps);
    return <blockquote className={cn("mt-6 border-l-2 border-primary pl-6 italic", className)} {...props}>{children}</blockquote>;
  },
  inlineCode: (componentProps: StreamdownComponentProps) => {
    const { className, children, ...props } = omitNode(componentProps);
    return <code className={cn("relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold", className)} {...props}>{children}</code>;
  },
};

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const [StreamdownModule, setStreamdownModule] = useState<React.ElementType | null>(null);
  const [plugins, setPlugins] = useState<Record<string, unknown> | null>(null);

  const chunks = useMemo(() => {
    const processor = unified().use(remarkParse);
    try {
      const ast = processor.parse(content);
      const newChunks: string[] = [];
      let currentGroup = "";
      const definitions: string[] = [];

      for (const node of ast.children) {
        if (node.position && node.position.start?.offset !== undefined && node.position.end?.offset !== undefined) {
          const block = content.slice(node.position.start.offset, node.position.end.offset);
          
          if (node.type === 'definition' || node.type === 'footnoteDefinition') {
            definitions.push(block);
          } else {
            currentGroup += block + "\n\n";
            if (currentGroup.length > 1500) {
              newChunks.push(currentGroup);
              currentGroup = "";
            }
          }
        }
      }
      if (currentGroup) {
        newChunks.push(currentGroup);
      }
      
      const definitionsString = definitions.join("\n\n");
      const finalChunks = newChunks.length ? newChunks : [content];
      
      if (definitionsString) {
        return finalChunks.map(chunk => definitionsString + "\n\n" + chunk);
      }
      return finalChunks;
    } catch (e) {
      console.error("Failed to parse markdown for chunking", e);
      return [content];
    }
  }, [content]);

  useEffect(() => {
    let isMounted = true;
    async function loadHeavyDeps() {
      try {
        const [
          streamdownMod,
          codeMod,
          mathMod,
          mermaidMod
        ] = await Promise.all([
          import("streamdown"),
          import("@streamdown/code"),
          import("@streamdown/math"),
          import("@streamdown/mermaid")
        ]);
        
        if (isMounted) {
          setStreamdownModule(() => streamdownMod.Streamdown);
          setPlugins({
            code: codeMod.code,
            math: mathMod.math,
            mermaid: mermaidMod.mermaid,
          });
        }
      } catch (err) {
        console.error("Failed to load markdown renderer dependencies", err);
      }
    }
    loadHeavyDeps();
    return () => { isMounted = false; };
  }, []);

  if (!StreamdownModule || !plugins || chunks.length === 0) {
    return (
      <div className="space-y-4 pt-10 max-w-full">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-64 w-full mt-8" />
      </div>
    );
  }

  const Streamdown = StreamdownModule;

  return (
    <div className="markdown-body">
      <Virtuoso
        useWindowScroll
        data={chunks}
        itemContent={(_, chunk) => (
          <Streamdown
            plugins={plugins}
            components={markdownComponents}
          >
            {chunk}
          </Streamdown>
        )}
      />
    </div>
  );
}
