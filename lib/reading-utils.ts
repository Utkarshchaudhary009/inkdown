export function calculateReadingTime(text: string): number {
  if (!text) return 0;
  const trimmed = text.trim();
  if (!trimmed) return 0;
  const wordCount = trimmed.split(/\s+/).length;
  const DEFAULT_WORDS_PER_MINUTE = 250;
  return Math.max(1, Math.ceil(wordCount / DEFAULT_WORDS_PER_MINUTE));
}

export function extractPlainText(markdown: string): string {
  if (!markdown) return "";
  // Strip simple markdown formatting
  return markdown
    .replace(/#+\s+/g, "") // headings
    .replace(/[*_~`]/g, "") // bold, italic, strikethrough, code
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "") // images
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links
    .replace(/>\s+/g, "") // blockquotes
    .trim();
}
