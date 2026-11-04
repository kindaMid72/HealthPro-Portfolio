import sharp from 'sharp';
import { and, eq, isNull } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { articles, images, profile } from '@/db/schema';

export const MAX_IMAGE_INPUT_BYTES = 10 * 1024 * 1024; // 10 MB
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
  byteSize: number;
  mimeType: string;
}

export async function compressImage(
  input: Buffer | Uint8Array,
  options?: { maxWidth?: number; maxHeight?: number; quality?: number },
): Promise<CompressedImage> {
  const maxWidth = options?.maxWidth ?? 1600;
  const maxHeight = options?.maxHeight ?? 1600;
  const quality = options?.quality ?? 80;

  const { data, info } = await sharp(input)
    .rotate()
    .resize({
      width: maxWidth,
      height: maxHeight,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality, effort: 4 })
    .toBuffer({ resolveWithObject: true });

  return {
    data,
    width: info.width,
    height: info.height,
    byteSize: info.size,
    mimeType: 'image/webp',
  };
}

export async function storeImage(params: {
  buffer: Buffer;
  articleId?: string | null;
  createdBy?: string | null;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}): Promise<{
  id: string;
  url: string;
  width: number;
  height: number;
  byteSize: number;
}> {
  const compressed = await compressImage(params.buffer, {
    maxWidth: params.maxWidth,
    maxHeight: params.maxHeight,
    quality: params.quality,
  });

  const [inserted] = await getDb()
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
    .returning({ id: images.id });

  return {
    id: inserted.id,
    url: `/media/${inserted.id}`,
    width: compressed.width,
    height: compressed.height,
    byteSize: compressed.byteSize,
  };
}

export async function getImageById(id: string) {
  const rows = await getDb()
    .select({
      id: images.id,
      mimeType: images.mimeType,
      data: images.data,
      byteSize: images.byteSize,
    })
    .from(images)
    .where(eq(images.id, id))
    .limit(1);

  return rows[0] ?? null;
}

export async function deleteImageIfUnused(imageId: string): Promise<void> {
  const db = getDb();

  const [profRef] = await db
    .select({ id: profile.id })
    .from(profile)
    .where(eq(profile.photoImageId, imageId))
    .limit(1);
  if (profRef) return;

  const [artRef] = await db
    .select({ id: articles.id })
    .from(articles)
    .where(eq(articles.coverImageId, imageId))
    .limit(1);
  if (artRef) return;

  await db
    .delete(images)
    .where(and(eq(images.id, imageId), isNull(images.articleId)));
}
