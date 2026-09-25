import { speakSequence, stopSpeech, useSpeech, type SpeechItem } from '../engine/speech';
import { useT } from '../engine/i18n';

/** 🔊 button that plays recorded audio and visibly animates while speaking (tap again = stop). */
export function SpeakButton({ id, items, className = 'icon-btn', label }: { id: string; items: () => SpeechItem[]; className?: string; label?: string }) {
  const playing = useSpeech((s) => s.playing === id);
  const t = useT();
  return (
    <button
      type="button"
      className={`${className} speak-btn ${playing ? 'speaking' : ''}`}
      data-speak={id}
      aria-pressed={playing}
      aria-label={t('ui.term.listen')}
      title={t('ui.term.listen')}
      onClick={(e) => {
        e.stopPropagation();
        if (playing) stopSpeech();
        else speakSequence(items(), id);
      }}
    >
      <span className="speak-icon" aria-hidden>
        {playing ? '⏹' : '🔊'}
      </span>
      {label ? <span className="speak-label">{label}</span> : null}
      {playing ? (
        <span className="speak-bars" aria-hidden>
          <i />
          <i />
          <i />
        </span>
      ) : null}
    </button>
  );
}
