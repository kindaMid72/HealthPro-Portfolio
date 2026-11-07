import { revalidatePath } from 'next/cache';

export function revalidatePublicSite(articleSlug?: string): void {
  // Revalidate root layout [lang] and homepage in both languages
  revalidatePath('/[lang]', 'layout');
  revalidatePath('/[lang]', 'page');
  revalidatePath('/', 'page');
  revalidatePath('/en', 'page');

  // Revalidate article index and pagination archives
  revalidatePath('/[lang]/artikel', 'page');
  revalidatePath('/artikel', 'page');
  revalidatePath('/en/artikel', 'page');
  revalidatePath('/[lang]/artikel/halaman/[page]', 'page');

  // Revalidate article and service detail patterns
  revalidatePath('/[lang]/artikel/[slug]', 'page');
  revalidatePath('/[lang]/layanan/[slug]', 'page');

  if (articleSlug) {
    revalidatePath(`/artikel/${articleSlug}`, 'page');
    revalidatePath(`/en/artikel/${articleSlug}`, 'page');
    revalidatePath(`/id/artikel/${articleSlug}`, 'page');
  }

  // Revalidate SEO/GEO endpoints
  revalidatePath('/llms.txt');
  revalidatePath('/en/llms.txt');
  revalidatePath('/sitemap.xml');
}
