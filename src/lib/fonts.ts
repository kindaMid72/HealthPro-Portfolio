import { Figtree, Literata } from "next/font/google";

/** Figtree — font UI & isi halaman (variable font). */
export const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  display: "swap", // cegah CLS saat font load
});

/** Literata — judul display (h1/h2) dan isi artikel/layanan panjang. */
export const literata = Literata({
  variable: "--font-literata",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  display: "swap",
});
