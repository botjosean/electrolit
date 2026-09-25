import videosData from '../glossary/videos.json';
import type { TermDef } from './types';

/** Curated YouTube searches (always return real, current videos; no dead links). */
export interface VideoTopic {
  id: string;
  en: string;
  es: string;
}

export const videoTopics: VideoTopic[] = videosData as VideoTopic[];
const map = new Map(videoTopics.map((v) => [v.id, v]));
export const getVideoTopic = (id: string) => map.get(id);

export const youtubeSearch = (q: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;

export function termQueries(term: TermDef) {
  return { en: `${term.term} electrician`, es: `${term.es.split('/')[0].trim()} electricista` };
}
