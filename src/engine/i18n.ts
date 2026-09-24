import type { Lang } from './types';
import { useSettings } from './store';

type Dict = { [k: string]: string | Dict };

const files = import.meta.glob('../i18n/*/*.json', { eager: true, import: 'default' }) as Record<string, Dict>;

export const dictionaries: Record<Lang, Record<string, Dict>> = { es: {}, en: {} };
for (const [path, data] of Object.entries(files)) {
  const m = path.match(/i18n\/(es|en)\/([\w-]+)\.json$/);
  if (m) dictionaries[m[1] as Lang][m[2]] = data;
}

export function lookup(lang: Lang, key: string): string | undefined {
  const [ns, ...rest] = key.split('.');
  let node: string | Dict | undefined = dictionaries[lang][ns];
  for (const part of rest) {
    if (!node || typeof node === 'string') return undefined;
    node = node[part];
  }
  return typeof node === 'string' ? node : undefined;
}

export function t(lang: Lang, key: string, params?: Record<string, string | number>): string {
  let s = lookup(lang, key) ?? lookup(lang === 'es' ? 'en' : 'es', key) ?? key;
  if (params) for (const [k, v] of Object.entries(params)) s = s.split(`{${k}}`).join(String(v));
  return s;
}

/** Flattens every key of a language (used by content tests). */
export function allKeys(lang: Lang): string[] {
  const out: string[] = [];
  const walk = (prefix: string, d: Dict) => {
    for (const [k, v] of Object.entries(d)) {
      if (typeof v === 'string') out.push(`${prefix}.${k}`);
      else walk(`${prefix}.${k}`, v);
    }
  };
  for (const [ns, d] of Object.entries(dictionaries[lang])) walk(ns, d);
  return out;
}

export function useT() {
  const lang = useSettings((s) => s.lang);
  return (key: string, params?: Record<string, string | number>) => t(lang, key, params);
}
