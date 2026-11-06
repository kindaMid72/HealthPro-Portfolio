import { NextResponse } from 'next/server';
import { getImageById } from '@/lib/images';
import { isUuid } from '@/lib/uuid';

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  if (!isUuid(id)) {
    return new NextResponse('Not found', { status: 404 });
  }

  const image = await getImageById(id);
  if (!image) {
    return new NextResponse('Not found', { status: 404 });
  }

  return new NextResponse(new Uint8Array(image.data), {
    status: 200,
    headers: {
      'Content-Type': image.mimeType,
      'Content-Length': String(image.byteSize),
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
