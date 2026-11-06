import { revalidatePath } from 'next/cache';

export function revalidatePublicSite(articleSlug?: string): void {
  // Revalidasi root layout [lang] dan halaman utama kedua bahasa
  revalidatePath('/[lang]', 'layout');
  revalidatePath('/[lang]', 'page');
  revalidatePath('/', 'page');
  revalidatePath('/en', 'page');

  // Revalidasi indeks artikel dan arsip paginasi
  revalidatePath('/[lang]/artikel', 'page');
  revalidatePath('/artikel', 'page');
  revalidatePath('/en/artikel', 'page');
  revalidatePath('/[lang]/artikel/halaman/[page]', 'page');

  // Revalidasi pola detail artikel dan layanan
  revalidatePath('/[lang]/artikel/[slug]', 'page');
  revalidatePath('/[lang]/layanan/[slug]', 'page');

  if (articleSlug) {
    revalidatePath(`/artikel/${articleSlug}`, 'page');
    revalidatePath(`/en/artikel/${articleSlug}`, 'page');
    revalidatePath(`/id/artikel/${articleSlug}`, 'page');
  }

  // Revalidasi endpoint SEO/GEO
  revalidatePath('/llms.txt');
  revalidatePath('/en/llms.txt');
  revalidatePath('/sitemap.xml');
}
