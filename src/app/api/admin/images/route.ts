import { NextResponse } from 'next/server';
import { UserFacingError } from '@/lib/action-error';
import { getSessionUser } from '@/lib/session';
import {
  ALLOWED_IMAGE_MIMES,
  MAX_IMAGE_INPUT_BYTES,
  storeImage,
} from '@/lib/images';
import { isUuid } from '@/lib/uuid';

// Ruang untuk envelope multipart di sekitar berkas gambar.
const MULTIPART_OVERHEAD_BYTES = 64 * 1024;

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json(
      { error: 'Tidak terautentikasi' },
      { status: 401 },
    );
  }

  // Tolak permintaan lintas-origin: Origin harus sama dengan Host.
  const origin = request.headers.get('origin');
  if (origin) {
    let sameOrigin = false;
    try {
      sameOrigin = new URL(origin).host === request.headers.get('host');
    } catch {
      sameOrigin = false;
    }
    if (!sameOrigin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  // Tolak body besar sebelum formData() membuffernya ke memori. Tanpa
  // content-length yang valid permintaan ditolak, agar tidak ada jalur tanpa batas.
  const rawLength = request.headers.get('content-length');
  const contentLength = rawLength === null ? Number.NaN : Number(rawLength);
  if (
    !Number.isFinite(contentLength) ||
    contentLength > MAX_IMAGE_INPUT_BYTES + MULTIPART_OVERHEAD_BYTES
  ) {
    return NextResponse.json(
      { error: 'Ukuran gambar maksimal 10 MB' },
      { status: 413 },
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
    if (err instanceof UserFacingError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error('[api/admin/images]', err);
    return NextResponse.json({ error: 'Gagal memproses gambar' }, { status: 500 });
  }
}
