import { Fragment, type ReactNode } from 'react';
import { getTerm, shortEs } from './glossary';
import { useSettings } from './store';
import { useUi } from './ui';

// Markup: [[termId]] or [[termId|display text]] → tappable term; **bold**; \n → line break.
const TOKEN = /(\[\[[a-z0-9_-]+(?:\|[^\]]*)?\]\]|\*\*[^*]+\*\*|\n)/gi;

/** interactive=false renders terms as highlighted text (use inside buttons). */
export function RichText({ text, interactive = true }: { text: string; interactive?: boolean }) {
  const lang = useSettings((s) => s.lang);
  const openTerm = useUi((s) => s.openTerm);
  const parts = text.split(TOKEN).filter((p) => p !== '');
  const nodes: ReactNode[] = parts.map((p, i) => {
    if (p === '\n') return <br key={i} />;
    if (p.startsWith('**')) return <strong key={i}>{p.slice(2, -2)}</strong>;
    const m = p.match(/^\[\[([a-z0-9_-]+)(?:\|([^\]]*))?\]\]$/i);
    if (m) {
      const term = getTerm(m[1]);
      const display = m[2] || term?.term || m[1];
      if (!interactive)
        return (
          <span key={i} className="term static">
            {display}
            {lang === 'es' && term ? <span className="term-es"> ({shortEs(term)})</span> : null}
          </span>
        );
      return (
        <button
          key={i}
          type="button"
          className="term"
          data-term={m[1]}
          onClick={(e) => {
            e.stopPropagation();
            openTerm(m[1]);
          }}
        >
          {display}
          {lang === 'es' && term ? <span className="term-es"> ({shortEs(term)})</span> : null}
        </button>
      );
    }
    return <Fragment key={i}>{p}</Fragment>;
  });
  return <>{nodes}</>;
}
