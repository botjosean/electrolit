import { useEffect } from 'react';
import { getTerm } from '../engine/glossary';
import { useT } from '../engine/i18n';
import { RichText } from '../engine/richText';
import { useSettings } from '../engine/store';
import { useUi } from '../engine/ui';
import { termQueries } from '../engine/videos';
import { spriteRegistry } from '../scene/art';
import { VideoLinks } from './hud/VideoLinks';
import { SpeakButton } from './SpeakButton';

/** Object "ficha": the illustration big and still, with name, audio, meaning and videos. */
export function ObjectViewer() {
  const target = useUi((s) => s.viewer);
  const open = useUi((s) => s.openViewer);
  const lang = useSettings((s) => s.lang);
  const t = useT();
  useEffect(() => {
    if (!target) return;
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && open(null);
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [target, open]);
  if (!target) return null;
  const sp = spriteRegistry[target.kind];
  if (!sp) return null;
  const Art = sp.draw;
  const [x0, y0, x1, y1] = sp.bounds(target.params ?? {});
  const pad = Math.max(x1 - x0, y1 - y0) * 0.12;
  const term = target.termId ? getTerm(target.termId) : undefined;
  return (
    <div className="modal-backdrop viewer-backdrop" onClick={() => open(null)} data-testid="viewer">
      <div className="viewer" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={term?.term ?? t(target.labelKey ?? '')}>
        <div className="viewer-stage">
          <svg className="viewer-art" viewBox={`${x0 - pad} ${y0 - pad} ${x1 - x0 + pad * 2} ${y1 - y0 + pad * 2}`} preserveAspectRatio="xMidYMid meet">
            <Art params={target.params ?? {}} />
          </svg>
          <button type="button" className="icon-btn viewer-close" onClick={() => open(null)} aria-label={t('ui.close')} data-testid="viewer-close">
            ✕
          </button>
        </div>
        <div className="viewer-info">
          {term ? (
            <>
              <div className="viewer-title">
                <h2>{term.term}</h2>
                <SpeakButton id={`viewer:${term.id}`} items={() => [{ text: term.say ?? term.term, lang: 'en' }]} />
              </div>
              <div className="viewer-es">{term.es}</div>
              <p>{lang === 'es' ? term.explanation_es : term.explanation_en}</p>
              <VideoLinks {...termQueries(term)} />
            </>
          ) : (
            <h2>
              <RichText text={t(target.labelKey ?? '')} interactive={false} />
            </h2>
          )}
        </div>
      </div>
    </div>
  );
}

/** Button that opens the ficha for a glossary term (renders nothing if it has no drawing). */
export function View3DButton({ termId, className = 'btn small' }: { termId: string; className?: string }) {
  const term = getTerm(termId);
  const open = useUi((s) => s.openViewer);
  const t = useT();
  if (!term?.model) return null;
  return (
    <button type="button" className={`${className} view3d-btn`} onClick={() => open({ kind: term.model!.kind, params: term.model!.params, termId })} data-view3d={termId}>
      🔍 {t('ui.viewer.open')}
    </button>
  );
}
