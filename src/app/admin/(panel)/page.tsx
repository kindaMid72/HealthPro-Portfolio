/**
 * app/admin/(panel)/page.tsx — beranda panel admin.
 */

import { requireUser } from '@/lib/session';

export default async function AdminHomePage() {
  const user = await requireUser();

  return (
    <section>
      <h1 className="text-xl font-semibold">Halo, {user.name}</h1>
      <p className="mt-2 text-sm text-gray-600">
        Pilih menu di atas untuk mengelola konten website.
      </p>
    </section>
  );
}
