import * as Comlink from 'comlink';
import type { markdownParser } from './worker/markdown-parser.worker';

// Create a singleton worker instance
let workerInstance: Comlink.Remote<typeof markdownParser> | null = null;

function getWorker() {
  if (typeof window === 'undefined') {
    // Return a dummy implementation for SSR
    return {
      extractText: async (text: string) => text,
      calculateReadingTime: async (_text: string) => 0
    };
  }

  if (!workerInstance) {
    const worker = new Worker(new URL('./worker/markdown-parser.worker.ts', import.meta.url));
    workerInstance = Comlink.wrap<typeof markdownParser>(worker);
  }
  return workerInstance;
}

export async function calculateReadingTime(text: string): Promise<number> {
  const worker = getWorker();
  return worker.calculateReadingTime(text);
}

export async function extractPlainText(markdown: string): Promise<string> {
  const worker = getWorker();
  return worker.extractText(markdown);
}
