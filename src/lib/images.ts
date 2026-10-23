/**
 * lib/images.ts — utilitas kompresi & penyimpanan gambar.
 *
 * Semua gambar diubah ke WebP:
 * - Batas dimensi default: lebar maks 1600px, tinggi maks 1600px (tanpa perbesaran / withoutEnlargement).
 * - Kualitas WebP 80, auto-rotate dari EXIF, metadata dihapus.
 * - Disimpan langsung ke tabel `images` (bytea).
 */

import sharp from 'sharp';
import { eq } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { images } from '@/db/schema';

export const MAX_IMAGE_INPUT_BYTES = 10 * 1024 * 1024; // 10 MB maks upload awal
export const ALLOWED_IMAGE_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
];

export interface CompressedImage {
  data: Buffer;
  width: number;
  height: number;
  mimeType: 'image/webp';
  byteSize: number;
}

export async function compressImage(
  input: Buffer | Uint8Array,
  options?: { maxWidth?: number; maxHeight?: number; quality?: number }
): Promise<CompressedImage> {
  const maxWidth = options?.maxWidth ?? 1600;
  const maxHeight = options?.maxHeight ?? 1600;
  const quality = options?.quality ?? 80;

  const pipeline = sharp(input)
    .rotate() // auto-orient berdasarkan EXIF
    .resize({
      width: maxWidth,
      height: maxHeight,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality, effort: 4 });

  const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });

  return {
    data,
    width: info.width,
    height: info.height,
    mimeType: 'image/webp',
    byteSize: info.size,
  };
}

export async function storeImage(params: {
  buffer: Buffer;
  articleId?: string | null;
  createdBy?: string | null;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}): Promise<{ id: string; url: string; width: number; height: number; byteSize: number }> {
  const compressed = await compressImage(params.buffer, {
    maxWidth: params.maxWidth,
    maxHeight: params.maxHeight,
    quality: params.quality,
  });

  const db = getDb();
  const [inserted] = await db
    .insert(images)
    .values({
      articleId: params.articleId ?? null,
      mimeType: compressed.mimeType,
      data: compressed.data,
      width: compressed.width,
      height: compressed.height,
      byteSize: compressed.byteSize,
      createdBy: params.createdBy ?? null,
    })
    .returning({ id: images.id, width: images.width, height: images.height, byteSize: images.byteSize });

  return {
    id: inserted.id,
    url: `/media/${inserted.id}`,
    width: inserted.width,
    height: inserted.height,
    byteSize: inserted.byteSize,
  };
}

export async function getImageById(id: string) {
  const db = getDb();
  const [row] = await db
    .select({
      id: images.id,
      mimeType: images.mimeType,
      data: images.data,
      byteSize: images.byteSize,
    })
    .from(images)
    .where(eq(images.id, id))
    .limit(1);

  return row ?? null;
}
