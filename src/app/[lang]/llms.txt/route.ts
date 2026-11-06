import { buildLlmsTxt } from '@/lib/llms';

export const revalidate = 3600;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ lang: string }> },
) {
  const { lang } = await params;

  if (lang !== 'en') {
    return new Response('Not Found', { status: 404 });
  }

  const content = await buildLlmsTxt('en');

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
