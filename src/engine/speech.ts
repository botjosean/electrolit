// Web Speech API pronunciation (en-US). Silently does nothing where unsupported.
let voice: SpeechSynthesisVoice | null = null;

function pickVoice() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const voices = window.speechSynthesis.getVoices();
  voice =
    voices.find((v) => v.lang === 'en-US' && /Google|Samantha|Aria|Jenny|Natural/i.test(v.name)) ??
    voices.find((v) => v.lang === 'en-US') ??
    voices.find((v) => v.lang.startsWith('en')) ??
    null;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  pickVoice();
  window.speechSynthesis.addEventListener?.('voiceschanged', pickVoice);
}

export const speechSupported = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

export function speakEnglish(text: string, rate = 0.9) {
  if (!speechSupported()) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.rate = rate;
  if (voice) u.voice = voice;
  synth.speak(u);
}
