export function estimateReadingTime(text: string): number {
  if (!text) return 0;
  const wordCount = text.trim().split(/\s+/).length;
  const wpm = 250;
  return Math.ceil(wordCount / wpm);
}

export function extractPlainText(markdown: string): string {
  if (!markdown) return "";
  // Strip simple markdown formatting
  return markdown
    .replace(/#+\s+/g, "") // headings
    .replace(/[*_~`]/g, "") // bold, italic, strikethrough, code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "") // images
    .replace(/>\s+/g, "") // blockquotes
    .trim();
}
