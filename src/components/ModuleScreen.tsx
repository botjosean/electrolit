import { getModule, moduleMissions } from '../engine/content';
import { useT } from '../engine/i18n';
import { useProgress } from '../engine/store';
import { LangToggle } from './LangToggle';
import { go } from './router';

export function ModuleScreen({ id }: { id: string }) {
  const mod = getModule(id);
  const t = useT();
  const progress = useProgress((s) => s.missions);
  if (!mod) {
    go('/');
    return null;
  }
  const list = moduleMissions(mod);
  return (
    <div className="screen module-screen" data-testid="module" data-module={mod.id}>
      <header className="sub-head">
        <button type="button" className="icon-btn" onClick={() => go('/')} aria-label={t('ui.back')}>
          ←
        </button>
        <div className="sub-title">
          <div className="kicker">
            {t('ui.module')} {mod.number} {mod.icon}
          </div>
          <h1>{t(mod.title)}</h1>
        </div>
        <LangToggle />
      </header>
      <p className="module-lead">{t(mod.desc)}</p>
      <ol className="missions">
        {list.map((m, i) => {
          const p = progress[m.id];
          return (
            <li key={m.id} className={`mission-card ${p?.completed ? 'complete' : ''}`}>
              <span className="mission-num">
                {mod.number}.{i + 1}
              </span>
              <div className="mission-text">
                <h3>{t(m.title)}</h3>
                <p>{t(m.desc)}</p>
                <div className="mission-meta">
                  <span className="stars small">
                    {[1, 2, 3].map((s) => (
                      <span key={s} className={p && s <= p.stars ? 'on' : ''}>
                        ★
                      </span>
                    ))}
                  </span>
                  {p ? <span>{t('ui.best', { n: p.best })}</span> : null}
                  <span>· {t('ui.steps', { n: m.steps.length })}</span>
                </div>
              </div>
              <button type="button" className="btn primary" onClick={() => go(`/mission/${m.id}`)} data-play={m.id}>
                {p?.completed ? t('ui.replay') : t('ui.play')}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
