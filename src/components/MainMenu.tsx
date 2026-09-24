import { modules } from '../engine/content';
import { useT } from '../engine/i18n';
import { useProgress } from '../engine/store';
import { Channels } from './Channels';
import { LangToggle } from './LangToggle';
import { go } from './router';

export function Logo() {
  return (
    <svg className="logo" viewBox="0 0 64 64" aria-hidden>
      <rect width="64" height="64" rx="14" fill="#1b1f24" />
      <path d="M36 6 14 36h14l-4 22 22-30H32z" fill="#ffc21a" />
    </svg>
  );
}

export function MainMenu() {
  const t = useT();
  const progress = useProgress((s) => s.missions);
  const totalMissions = modules.filter((m) => m.available).reduce((a, m) => a + m.missions.length, 0);
  const doneMissions = modules.flatMap((m) => m.missions).filter((id) => progress[id]?.completed).length;
  return (
    <div className="screen menu" data-testid="menu">
      <header className="menu-head">
        <Logo />
        <div className="menu-title">
          <h1>Electrician Sim US</h1>
          <p>{t('ui.menu.tagline')}</p>
        </div>
        <LangToggle />
      </header>
      <div className="menu-intro">
        <p>{t('ui.menu.intro')}</p>
        <div className="menu-actions">
          <button type="button" className="btn" onClick={() => go('/glossary')} data-testid="open-glossary">
            📘 {t('ui.menu.glossary')}
          </button>
          <span className="overall">
            {t('ui.menu.overall', { n: doneMissions, total: totalMissions })}
          </span>
        </div>
      </div>
      <ol className="modules">
        {modules.map((m) => {
          const done = m.missions.filter((id) => progress[id]?.completed).length;
          const stars = m.missions.reduce((a, id) => a + (progress[id]?.stars ?? 0), 0);
          const pct = m.missions.length ? (100 * done) / m.missions.length : 0;
          return (
            <li key={m.id}>
              <button
                type="button"
                className={`module-card ${m.available ? '' : 'locked'} ${m.available && done === m.missions.length && done > 0 ? 'complete' : ''}`}
                disabled={!m.available}
                onClick={() => go(`/module/${m.id}`)}
                data-module={m.id}
              >
                <span className="module-num">{m.number}</span>
                <span className="module-icon" aria-hidden>
                  {m.icon}
                </span>
                <span className="module-text">
                  <span className="module-title">{t(m.title)}</span>
                  <span className="module-desc">{t(m.desc)}</span>
                  {m.available ? (
                    <span className="module-progress">
                      <span className="bar">
                        <span style={{ width: `${pct}%` }} />
                      </span>
                      <span className="module-count">
                        {done}/{m.missions.length} · ★ {stars}/{m.missions.length * 3}
                      </span>
                    </span>
                  ) : (
                    <span className="soon">{t('ui.menu.soon')}</span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <Channels />
      <footer className="menu-foot">
        <button
          type="button"
          className="link"
          onClick={() => {
            if (window.confirm(t('ui.menu.resetConfirm'))) useProgress.getState().reset();
          }}
        >
          {t('ui.menu.reset')}
        </button>
        <span>{t('ui.menu.disclaimer')}</span>
      </footer>
    </div>
  );
}
