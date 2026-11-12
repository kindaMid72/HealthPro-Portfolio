export const META_DESCRIPTION_MAX = 160;

/** Collapse whitespace; if > max, cut on a word boundary (if past 60% of max, else hard cut) and append '…'. */
export function truncateMeta(text: string, max: number): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const room = clean.slice(0, max - 1);
  const space = room.lastIndexOf(' ');
  const cut = space > max * 0.6 && clean[max - 1] !== ' ' ? room.slice(0, space) : room;
  return `${cut.replace(/[\s,;:.\-–—]+$/, '')}…`;
}

export function fitTitle(title: string, suffix: string, max = 65): string {
  const full = `${title} — ${suffix}`;
  return full.length <= max ? full : truncateMeta(title, max);
}

export function ensureSentence(text: string): string {
  const t = text.trim();
  return /[.!?…]$/.test(t) ? t : `${t}.`;
}
