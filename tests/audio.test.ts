/// <reference types="node" />
import { describe, expect, it } from 'vitest';
import { missions } from '../src/engine/content';
import { glossary, phrases } from '../src/engine/glossary';
import { t } from '../src/engine/i18n';
import { clipFor } from '../src/engine/speech';
import { existsSync } from 'node:fs';

// Every spoken text must have a pre-recorded clip (phone webviews have no speechSynthesis).
// If this fails: node scripts/speech-export.mjs && python3 scripts/tts.py
const fileOf = (url: string | null) => (url ? `public/audio/${url.split('/').pop()}` : null);

describe('recorded audio', () => {
  it('every step (Spanish narration) has a clip', () => {
    for (const m of Object.values(missions))
      for (const s of m.steps) {
        const url = clipFor({ text: t('es', s.text), lang: 'es', voice: s.speaker === 'foreman' ? 'mike_es' : 'rosa' });
        expect(url, `${m.id} ${s.id}`).toBeTruthy();
        expect(existsSync(fileOf(url)!), `${m.id} ${s.id} file`).toBe(true);
      }
  });
  it('every foreman order / boss line and every glossary term has an English clip', () => {
    for (const p of phrases) expect(clipFor({ text: p.en, lang: 'en' }), p.id).toBeTruthy();
    for (const g of glossary) expect(clipFor({ text: g.say ?? g.term, lang: 'en' }), g.id).toBeTruthy();
  });
});
