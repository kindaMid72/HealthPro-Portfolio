import { buildLlmsTxt } from '@/lib/llms';

export const revalidate = 3600;

export async function GET() {
  const content = await buildLlmsTxt('id');

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
