import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';
import {
  ALLOWED_IMAGE_MIMES,
  MAX_IMAGE_INPUT_BYTES,
  storeImage,
} from '@/lib/images';
import { isUuid } from '@/lib/uuid';

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json(
      { error: 'Tidak terautentikasi' },
      { status: 401 },
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: 'File gambar tidak ditemukan' },
        { status: 400 },
      );
    }

    if (file.size <= 0 || file.size > MAX_IMAGE_INPUT_BYTES) {
      return NextResponse.json(
        { error: 'Ukuran gambar maksimal 10 MB' },
        { status: 400 },
      );
    }

    if (!ALLOWED_IMAGE_MIMES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Format gambar harus JPEG, PNG, WebP, AVIF, atau GIF' },
        { status: 400 },
      );
    }

    const rawArticleId = formData.get('articleId');
    let articleId: string | null = null;
    if (typeof rawArticleId === 'string' && rawArticleId.trim() !== '') {
      if (!isUuid(rawArticleId.trim())) {
        return NextResponse.json(
          { error: 'ID artikel tidak valid' },
          { status: 400 },
        );
      }
      articleId = rawArticleId.trim();
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await storeImage({
      buffer,
      articleId,
      createdBy: user.id,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal memproses gambar';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
