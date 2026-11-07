import { Figtree, Literata } from "next/font/google";

/** Figtree — UI & page body font (variable font). */
export const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  display: "swap", // Prevent CLS during font load
});

/** Literata — display headings (h1/h2) and long-form article/service content. */
export const literata = Literata({
  variable: "--font-literata",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  display: "swap",
});
