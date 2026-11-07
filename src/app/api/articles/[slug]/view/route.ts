import { NextResponse } from 'next/server';
import { getArticleViewCount, incrementArticleViewCount } from '@/lib/articles';
import { getClientIp } from '@/lib/client-ip';
import { visitorBucket } from '@/lib/view-hash';

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SLUG_MAX_LENGTH = 100;

export async function POST(
  req: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const site = req.headers.get('sec-fetch-site');
  if (site !== null && site !== 'same-origin') {
    return NextResponse.json({ counted: false, viewCount: null }, { status: 403 });
  }

  const { slug } = await context.params;
  if (slug.length > SLUG_MAX_LENGTH || !SLUG_RE.test(slug)) {
    return NextResponse.json({ counted: false, viewCount: null }, { status: 400 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const bucket = visitorBucket(getClientIp(req.headers), today);
  if (bucket === null) {
    // Fail closed: without secret, views are not counted; only current viewCount is returned.
    console.error('VIEW_HASH_SECRET not configured; views will not be counted');
    return NextResponse.json({
      counted: false,
      viewCount: await getArticleViewCount(slug),
    });
  }

  const result = await incrementArticleViewCount(slug, bucket, today);
  if (result === null) {
    return NextResponse.json({ counted: false, viewCount: null }, { status: 404 });
  }

  return NextResponse.json(result);
}
