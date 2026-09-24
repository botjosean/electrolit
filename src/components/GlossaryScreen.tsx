import { useMemo, useState } from 'react';
import { glossary } from '../engine/glossary';
import { useT } from '../engine/i18n';
import { speakEnglish } from '../engine/speech';
import { useSettings } from '../engine/store';
import { LangToggle } from './LangToggle';
import { go } from './router';

export function GlossaryScreen() {
  const t = useT();
  const lang = useSettings((s) => s.lang);
  const [q, setQ] = useState('');
  const list = useMemo(() => {
    const n = q.trim().toLowerCase();
    const sorted = [...glossary].sort((a, b) => a.term.localeCompare(b.term));
    if (!n) return sorted;
    return sorted.filter((g) => [g.term, g.es, g.explanation_es, g.explanation_en].some((s) => s.toLowerCase().includes(n)));
  }, [q]);
  return (
    <div className="screen glossary-screen" data-testid="glossary">
      <header className="sub-head">
        <button type="button" className="icon-btn" onClick={() => go('/')} aria-label={t('ui.back')}>
          ←
        </button>
        <div className="sub-title">
          <h1>📘 {t('ui.menu.glossary')}</h1>
        </div>
        <LangToggle />
      </header>
      <input className="search" type="search" placeholder={t('ui.glossary.search')} value={q} onChange={(e) => setQ(e.target.value)} />
      <ul className="glossary-list">
        {list.map((g) => (
          <li key={g.id}>
            <button type="button" className="icon-btn" onClick={() => speakEnglish(g.say ?? g.term)} aria-label={t('ui.term.listen')}>
              🔊
            </button>
            <div>
              <strong>{g.term}</strong> <span className="term-line-es">({g.es})</span>
              <div className="term-line-exp">{lang === 'es' ? g.explanation_es : g.explanation_en}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
