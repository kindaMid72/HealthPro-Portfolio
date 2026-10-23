/**
 * app/api/admin/images/route.ts — endpoint upload gambar dari editor/admin.
 * Memerlukan sesi admin yang valid.
 */

import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';
import {
  ALLOWED_IMAGE_MIMES,
  MAX_IMAGE_INPUT_BYTES,
  storeImage,
} from '@/lib/images';

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Format payload tidak valid' }, { status: 400 });
  }

  const file = formData.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 });
  }

  if (file.size > MAX_IMAGE_INPUT_BYTES) {
    return NextResponse.json(
      { error: 'Ukuran file melebihi batas 10 MB' },
      { status: 400 }
    );
  }

  if (!ALLOWED_IMAGE_MIMES.includes(file.type)) {
    return NextResponse.json(
      { error: `Tipe file ${file.type} tidak didukung` },
      { status: 400 }
    );
  }

  const rawArticleId = formData.get('articleId');
  const articleId =
    typeof rawArticleId === 'string' && rawArticleId.trim().length > 0
      ? rawArticleId.trim()
      : null;

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

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
