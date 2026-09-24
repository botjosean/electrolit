import { useSettings } from '../engine/store';

export function LangToggle() {
  const lang = useSettings((s) => s.lang);
  const setLang = useSettings((s) => s.setLang);
  return (
    <div className="lang-toggle" role="group" aria-label="Idioma / Language">
      {(['es', 'en'] as const).map((l) => (
        <button key={l} type="button" className={lang === l ? 'on' : ''} onClick={() => setLang(l)} data-lang={l} aria-pressed={lang === l}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
