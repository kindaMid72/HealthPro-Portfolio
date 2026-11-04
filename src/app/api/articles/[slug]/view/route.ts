import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  getArticleViewCount,
  incrementArticleViewCount,
} from '@/lib/articles';

const VIEWED_COOKIE = 'mami_viewed';
const VIEW_TTL_SECONDS = 60 * 60 * 12; // 12 jam

export async function POST(
  _req: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const cleanSlug = slug.trim();
  if (!cleanSlug) {
    return NextResponse.json({ counted: false, viewCount: null }, { status: 400 });
  }

  const store = await cookies();
  const rawViewed = store.get(VIEWED_COOKIE)?.value ?? '';
  const viewedList = rawViewed
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (viewedList.includes(cleanSlug)) {
    // Sudah dihitung: kembalikan angka terkini agar UI tidak menampilkan
    // angka basi dari halaman ISR.
    return NextResponse.json({
      counted: false,
      viewCount: await getArticleViewCount(cleanSlug),
    });
  }

  const newViewCount = await incrementArticleViewCount(cleanSlug);
  if (newViewCount === null) {
    return NextResponse.json({ counted: false, viewCount: null }, { status: 404 });
  }

  const updatedList = [...viewedList.slice(-49), cleanSlug];
  store.set(VIEWED_COOKIE, updatedList.join(','), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: VIEW_TTL_SECONDS,
    path: '/',
  });

  return NextResponse.json({
    counted: true,
    viewCount: newViewCount,
  });
}
