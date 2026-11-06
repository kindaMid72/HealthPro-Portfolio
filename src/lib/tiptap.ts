import type { JSONContent } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { TableKit } from '@tiptap/extension-table/kit';

export const ARTICLE_STATUSES = ['draft', 'in_review', 'published'] as const;
export type ArticleStatus = (typeof ARTICLE_STATUSES)[number];

export function isArticleStatus(val: unknown): val is ArticleStatus {
  return typeof val === 'string' && (ARTICLE_STATUSES as readonly string[]).includes(val);
}

export const EMPTY_TIPTAP_DOC: JSONContent = {
  type: 'doc',
  content: [{ type: 'paragraph' }],
};

function baseStarterKit() {
  return StarterKit.configure({
    heading: { levels: [2, 3] },
    link: {
      openOnClick: false,
      HTMLAttributes: {
        rel: 'noopener noreferrer nofollow',
        target: '_blank',
        class: 'text-primary underline hover:text-primary-dark',
      },
    },
  });
}

const tableKit = () => TableKit.configure({ table: { resizable: false } });

export function getArticleTiptapExtensions() {
  return [
    baseStarterKit(),
    Image.configure({
      inline: false,
      allowBase64: false,
    }),
    tableKit(),
  ];
}

/** Konten layanan: tanpa gambar, jadi tidak perlu GC blob gambar. */
export function getServiceTiptapExtensions() {
  return [baseStarterKit(), tableKit()];
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

const MEDIA_SRC_RE =
  /^\/media\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SAFE_HREF_RE = /^(https?:\/\/|mailto:|tel:|#|\/(?!\/))/i;

function intInRange(value: unknown, min: number, max: number): number | null {
  return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max
    ? value
    : null;
}

function normalizeColwidth(value: unknown): number[] | null {
  if (!Array.isArray(value)) return null;
  return value.every((w) => intInRange(w, 1, 2000) !== null) ? (value as number[]) : null;
}

function normalizeMark(mark: JSONContent): JSONContent | null {
  if (mark.type !== 'link') return mark;
  const href = typeof mark.attrs?.href === 'string' ? mark.attrs.href.trim() : '';
  return SAFE_HREF_RE.test(href) ? { type: 'link', attrs: { href } } : null;
}

/**
 * Normalisasi JSON Tiptap sebelum dirender atau disimpan: gambar hanya dari
 * /media/<uuid>, span tabel dibatasi, colwidth hanya integer wajar (dimasukkan ke
 * style), dan mark link dibangun ulang sehingga rel/target/class dari klien dibuang.
 * Rekursif dan tidak memutasi input.
 */
export function normalizeTiptapDoc(node: JSONContent): JSONContent {
  if (node.type === 'image') {
    const src = node.attrs?.src;
    return typeof src === 'string' && MEDIA_SRC_RE.test(src) ? node : { type: 'paragraph' };
  }

  const out: JSONContent = { ...node };

  if (node.type === 'tableCell' || node.type === 'tableHeader') {
    out.attrs = {
      ...node.attrs,
      colspan: intInRange(node.attrs?.colspan, 1, 20) ?? 1,
      rowspan: intInRange(node.attrs?.rowspan, 1, 50) ?? 1,
      colwidth: normalizeColwidth(node.attrs?.colwidth),
    };
  }

  if (Array.isArray(node.marks)) {
    out.marks = node.marks
      .map(normalizeMark)
      .filter((mark): mark is NonNullable<JSONContent['marks']>[number] => mark !== null && typeof mark.type === 'string');
  }

  if (Array.isArray(node.content)) {
    out.content = node.content.map((child) => normalizeTiptapDoc(child));
  }

  return out;
}
