// Lists every text the app can speak (step narration ES, foreman orders/boss lines EN, glossary
// terms EN, demo prompts ES) with the key the runtime uses to find its pre-recorded clip.
// Used by scripts/tts.py. Keep plainText()/audioKey() identical to src/engine/speech.ts.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';

const read = (p) => JSON.parse(readFileSync(new URL(`../src/${p}`, import.meta.url), 'utf8'));
const glossary = read('glossary/glossary.json');
const phrases = read('glossary/phrases.json');
const terms = new Map(glossary.map((g) => [g.id, g]));

export function plainText(text) {
  return text
    .replace(/\[\[([a-z0-9_-]+)(?:\|([^\]]*))?\]\]/gi, (_, id, disp) => disp || terms.get(id)?.term || id)
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/[“”]/g, '"')
    .trim();
}

export function audioKey(voice, text) {
  // FNV-1a 32-bit over UTF-8
  let h = 0x811c9dc5;
  for (const b of new TextEncoder().encode(`${voice}|${text}`)) {
    h ^= b;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

function lookup(dict, key) {
  let node = dict;
  for (const part of key.split('.').slice(1)) node = node?.[part];
  return typeof node === 'string' ? node : undefined;
}
const es = {};
for (const f of readdirSync(new URL('../src/i18n/es', import.meta.url))) es[f.replace('.json', '')] = read(`i18n/es/${f}`);
const t = (key) => lookup(es[key.split('.')[0]], key);

const items = new Map();
const add = (voice, text) => {
  const plain = plainText(text);
  if (plain) items.set(audioKey(voice, plain), { key: audioKey(voice, plain), voice, text: plain });
};

for (const dir of readdirSync(new URL('../src/missions', import.meta.url), { withFileTypes: true })) {
  if (!dir.isDirectory()) continue;
  for (const f of readdirSync(new URL(`../src/missions/${dir.name}`, import.meta.url))) {
    const m = read(`missions/${dir.name}/${f}`);
    for (const s of m.steps) add(s.speaker === 'foreman' ? 'mike_es' : 'rosa', t(s.text));
  }
}
for (const p of phrases) add('en', p.en);
for (const g of glossary) add('en', g.say ?? g.term);
for (const [k, v] of Object.entries(es.ui.demo)) if (k !== 'button' && k !== 'skip') add('rosa', v);

const out = [...items.values()];
writeFileSync(new URL('./.speech-texts.json', import.meta.url), JSON.stringify(out, null, 1));
console.log(`${out.length} clips (${out.filter((x) => x.voice === 'rosa').length} rosa, ${out.filter((x) => x.voice === 'mike_es').length} mike_es, ${out.filter((x) => x.voice === 'en').length} en)`);
