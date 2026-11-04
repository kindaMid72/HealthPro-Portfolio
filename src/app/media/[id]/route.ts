import { NextResponse } from 'next/server';
import { getImageById } from '@/lib/images';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  if (!UUID_REGEX.test(id)) {
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
