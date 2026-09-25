import { getTerm } from '../../engine/glossary';
import { useT } from '../../engine/i18n';
import { SpeakButton } from '../SpeakButton';
import { useSettings } from '../../engine/store';
import { useUi } from '../../engine/ui';
import { termQueries } from '../../engine/videos';
import { View3DButton } from '../ObjectViewer';
import { VideoLinks } from './VideoLinks';

export function TermCard() {
  const id = useUi((s) => s.termCard);
  const openTerm = useUi((s) => s.openTerm);
  const lang = useSettings((s) => s.lang);
  const t = useT();
  if (!id) return null;
  const term = getTerm(id);
  if (!term) return null;
  return (
    <div className="modal-backdrop" onClick={() => openTerm(null)} data-testid="term-card">
      <div className="term-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={term.term}>
        <div className="term-card-head">
          <div>
            <div className="term-card-kicker">{t('ui.term.english')}</div>
            <h2 className="term-card-word">{term.term}</h2>
          </div>
          <button type="button" className="icon-btn close" onClick={() => openTerm(null)} aria-label={t('ui.close')}>
            ✕
          </button>
        </div>
        <SpeakButton id={`term:${term.id}`} className="btn speak" label={t('ui.term.listen')} items={() => [{ text: term.say ?? term.term, lang: 'en' }]} />
        <div className="term-card-row">
          <div className="term-card-kicker">{t('ui.term.spanish')}</div>
          <div className="term-card-es">{term.es}</div>
        </div>
        <div className="term-card-row">
          <div className="term-card-kicker">{t('ui.term.what')}</div>
          <p>{lang === 'es' ? term.explanation_es : term.explanation_en}</p>
        </div>
        <View3DButton termId={term.id} className="btn view3d-card" />
        <VideoLinks {...termQueries(term)} />
      </div>
    </div>
  );
}

/** Full-format term line: "Breaker (breque / interruptor) — explicación". */
export function TermLine({ id }: { id: string }) {
  const term = getTerm(id);
  const lang = useSettings((s) => s.lang);
  const openTerm = useUi((s) => s.openTerm);
  if (!term) return null;
  return (
    <button type="button" className="term-line" onClick={() => openTerm(id)} data-term-line={id}>
      <strong className="term-line-en">{term.term}</strong>
      <span className="term-line-es"> ({term.es})</span>
      <span className="term-line-exp"> — {lang === 'es' ? term.explanation_es : term.explanation_en}</span>
    </button>
  );
}
