import { lang } from 'next/root-params';
import { notFound } from 'next/navigation';
import { hasLocale, type Locale } from './config';
import type { Dictionary } from './dictionaries/id';

export { format, plural } from './format';

const dictionaries = {
  id: () => import('./dictionaries/id').then((m) => m.id),
  en: () => import('./dictionaries/en').then((m) => m.en),
};

export async function getDictionaryFor(locale: Locale): Promise<Dictionary> {
  const load = dictionaries[locale];
  if (!load) {
    notFound();
  }
  return load();
}

export async function getDictionary(): Promise<Dictionary> {
  const locale = await lang();
  if (!hasLocale(locale)) {
    notFound();
  }
  return getDictionaryFor(locale);
}
