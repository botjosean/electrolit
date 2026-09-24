// Web Speech API: en-US pronunciation of terms/orders and Spanish/English narration.
// Silently does nothing where unsupported.
import { getTerm } from './glossary';
import type { Lang } from './types';

let voices: SpeechSynthesisVoice[] = [];

function loadVoices() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  voices = window.speechSynthesis.getVoices();
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices();
  window.speechSynthesis.addEventListener?.('voiceschanged', loadVoices);
}

const NICE = /Google|Samantha|Aria|Jenny|Paulina|Monica|Sabina|Natural|Neural/i;

function pickVoice(lang: Lang): SpeechSynthesisVoice | null {
  const prefs = lang === 'en' ? ['en-US', 'en'] : ['es-US', 'es-MX', 'es-419', 'es'];
  for (const p of prefs) {
    const matching = voices.filter((v) => v.lang.replace('_', '-').startsWith(p));
    const v = matching.find((x) => NICE.test(x.name)) ?? matching[0];
    if (v) return v;
  }
  return null;
}

export const speechSupported = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

/** Markup → plain speakable text: [[id|display]] → display, [[id]] → English term, **b** → b. */
export function plainText(text: string): string {
  return text
    .replace(/\[\[([a-z0-9_-]+)(?:\|([^\]]*))?\]\]/gi, (_, id: string, disp?: string) => disp || getTerm(id)?.term || id)
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/[“”]/g, '"');
}

export function stopSpeech() {
  if (speechSupported()) window.speechSynthesis.cancel();
}

/** Speaks a queue of fragments (each in its own language). Cancels whatever was playing. */
export function speakSequence(items: { text: string; lang: Lang }[], rate = 1) {
  if (!speechSupported()) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  for (const it of items) {
    if (!it.text.trim()) continue;
    const u = new SpeechSynthesisUtterance(plainText(it.text));
    u.lang = it.lang === 'en' ? 'en-US' : 'es-US';
    u.rate = it.lang === 'en' ? rate * 0.92 : rate;
    const v = pickVoice(it.lang);
    if (v) u.voice = v;
    synth.speak(u);
  }
}

export function speakEnglish(text: string, rate = 0.9) {
  speakSequence([{ text, lang: 'en' }], rate / 0.92);
}
