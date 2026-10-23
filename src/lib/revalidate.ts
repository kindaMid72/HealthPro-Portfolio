/**
 * lib/revalidate.ts — panggil setelah setiap perubahan konten dari admin,
 * supaya halaman publik langsung berubah tanpa menunggu revalidate 1 jam.
 * Hanya dipanggil dari server action / route handler.
 */

import { revalidatePath } from 'next/cache';

export function revalidatePublicSite(): void {
  revalidatePath('/', 'layout');
  revalidatePath('/artikel', 'page');
  revalidatePath('/artikel/[slug]', 'page');
  revalidatePath('/llms.txt');
  revalidatePath('/sitemap.xml');
}
