import { revalidatePath } from 'next/cache';

export function revalidatePublicSite(articleSlug?: string): void {
  revalidatePath('/', 'layout');
  revalidatePath('/artikel', 'page');
  revalidatePath('/artikel/halaman/[page]', 'page');
  revalidatePath('/artikel/[slug]', 'page');
  revalidatePath('/layanan/[slug]', 'page');
  if (articleSlug) {
    revalidatePath(`/artikel/${articleSlug}`, 'page');
  }
  revalidatePath('/llms.txt');
  revalidatePath('/sitemap.xml');
}
