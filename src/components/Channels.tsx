import channels from '../glossary/channels.json';
import { useT } from '../engine/i18n';

/** Curated real-electrician YouTube channels (from docs/RESEARCH.md). */
export function Channels() {
  const t = useT();
  return (
    <section className="channels" data-testid="channels">
      <h2>{t('ui.channels.title')}</h2>
      <p className="channels-note">{t('ui.channels.note')}</p>
      <ul>
        {channels.map((c) => (
          <li key={c.id}>
            <a href={c.url} target="_blank" rel="noopener noreferrer">
              <span className="video-icon" aria-hidden>
                ▶
              </span>
              <strong>{c.name}</strong>
              <span className="channel-lang">{c.lang.toUpperCase()}</span>
            </a>
            <span className="channel-desc">{t(`ui.channels.${c.id}`)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
