import type { JSONContent } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { TableKit } from '@tiptap/extension-table/kit';

export type ArticleStatus = 'draft' | 'in_review' | 'published';

export const EMPTY_TIPTAP_DOC: JSONContent = {
  type: 'doc',
  content: [{ type: 'paragraph' }],
};

export function getArticleTiptapExtensions() {
  return [
    StarterKit.configure({
      heading: { levels: [2, 3] },
      link: {
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer nofollow',
          target: '_blank',
          class: 'text-primary underline hover:text-primary-dark',
        },
      },
    }),
    Image.configure({
      inline: false,
      allowBase64: false,
    }),
    TableKit.configure({
      table: {
        resizable: false,
      },
    }),
  ];
}

const BLOCK_NODE_TYPES: Record<string, true> = {
  paragraph: true,
  heading: true,
  listItem: true,
  blockquote: true,
  tableCell: true,
  tableHeader: true,
  codeBlock: true,
};

export function extractPlainText(
  content: JSONContent | null | undefined,
): string {
  if (!content) return '';
  const chunks: string[] = [];

  function walk(node: JSONContent) {
    if (typeof node.text === 'string') {
      chunks.push(node.text);
    }
    if (Array.isArray(node.content)) {
      for (const child of node.content) {
        walk(child);
      }
    }
    if (node.type && BLOCK_NODE_TYPES[node.type]) {
      chunks.push(' ');
    }
  }

  walk(content);
  return chunks.join('').replace(/\s+/g, ' ').trim();
}

export function countWords(content: JSONContent | null | undefined): number {
  const text = extractPlainText(content);
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

export function calculateReadingTimeMinutes(
  content: JSONContent | null | undefined,
): number {
  return Math.max(1, Math.ceil(countWords(content) / 180));
}
