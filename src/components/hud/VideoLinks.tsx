import { useT } from '../../engine/i18n';
import { useSettings } from '../../engine/store';
import { youtubeSearch } from '../../engine/videos';

/** Small "see how it's done in real life" links (YouTube searches). */
export function VideoLinks({ en, es, compact }: { en: string; es: string; compact?: boolean }) {
  const lang = useSettings((s) => s.lang);
  const t = useT();
  return (
    <div className={`video-links ${compact ? 'compact' : ''}`}>
      <span className="video-icon" aria-hidden>
        ▶
      </span>
      {lang === 'es' ? (
        <>
          <a href={youtubeSearch(es)} target="_blank" rel="noopener noreferrer" data-video="es">
            {t('ui.video.watch')}
          </a>
          <a href={youtubeSearch(en)} target="_blank" rel="noopener noreferrer" className="video-alt" data-video="en">
            {t('ui.video.english')}
          </a>
        </>
      ) : (
        <a href={youtubeSearch(en)} target="_blank" rel="noopener noreferrer" data-video="en">
          {t('ui.video.watch')}
        </a>
      )}
    </div>
  );
}
