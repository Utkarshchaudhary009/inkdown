import * as Comlink from 'comlink';
import { remark } from 'remark';
import { visit } from 'unist-util-visit';
import type { Root } from 'mdast';

// A simple plugin to extract text and inline code, ignoring formatting
const textExtractionPlugin = () => (tree: Root) => {
  // We don't actually modify the tree, we just use remark to parse it
  return tree;
};

const processor = remark().use(textExtractionPlugin);

export const markdownParser = {
  extractText(markdown: string): string {
    if (!markdown) return "";
    let extractedText = '';
    
    // Parse synchronous because remark plugins here are synchronous
    const ast = processor.parse(markdown);
    
    visit(ast, (node) => {
      if (node.type === 'text' || node.type === 'inlineCode') {
        extractedText += (node as { value: string }).value + ' ';
      }
    });
    
    return extractedText.trim();
  },
  
  calculateReadingTime(text: string): number {
    if (!text) return 0;
    const trimmed = text.trim();
    if (!trimmed) return 0;
    const wordCount = trimmed.split(/\s+/).length;
    const DEFAULT_WORDS_PER_MINUTE = 250;
    return Math.max(1, Math.ceil(wordCount / DEFAULT_WORDS_PER_MINUTE));
  }
};

Comlink.expose(markdownParser);
