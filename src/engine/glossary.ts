import glossaryData from '../glossary/glossary.json';
import phrasesData from '../glossary/phrases.json';
import type { PhraseDef, TermDef } from './types';

export const glossary: TermDef[] = glossaryData as TermDef[];
export const phrases: PhraseDef[] = phrasesData as PhraseDef[];

const termMap = new Map(glossary.map((g) => [g.id, g]));
const phraseMap = new Map(phrases.map((p) => [p.id, p]));

export const getTerm = (id: string) => termMap.get(id);
export const getPhrase = (id: string) => phraseMap.get(id);

/** First alternative of the Spanish meaning ("breque / interruptor" → "breque"). */
export const shortEs = (term: TermDef) => term.es.split('/')[0].trim();
