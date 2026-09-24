import { useSyncExternalStore } from 'react';

export type Route =
  | { name: 'menu' }
  | { name: 'module'; id: string }
  | { name: 'mission'; id: string }
  | { name: 'glossary' };

export function parseHash(hash: string): Route {
  const h = hash.replace(/^#\/?/, '');
  const [a, b] = h.split('/');
  if (a === 'module' && b) return { name: 'module', id: b };
  if (a === 'mission' && b) return { name: 'mission', id: b };
  if (a === 'glossary') return { name: 'glossary' };
  return { name: 'menu' };
}

const subscribe = (cb: () => void) => {
  window.addEventListener('hashchange', cb);
  return () => window.removeEventListener('hashchange', cb);
};

export function useRoute(): Route {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash, () => '');
  return parseHash(hash);
}

export function go(path: string) {
  window.location.hash = path;
}
