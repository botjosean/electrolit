import modulesData from '../missions/modules.json';
import type { Mission, ModuleDef } from './types';

export const modules: ModuleDef[] = modulesData as ModuleDef[];

const files = import.meta.glob('../missions/*/*.json', { eager: true, import: 'default' }) as Record<string, Mission>;

export const missions: Record<string, Mission> = {};
for (const m of Object.values(files)) missions[m.id] = m;

export const getModule = (id: string) => modules.find((m) => m.id === id);
export const getMission = (id: string) => missions[id];

export function moduleMissions(mod: ModuleDef): Mission[] {
  return mod.missions.map((id) => missions[id]).filter(Boolean);
}

/** Next mission in the same module (or first of the next available module). */
export function nextMissionId(id: string): string | undefined {
  const flat = modules.filter((m) => m.available).flatMap((m) => m.missions);
  const i = flat.indexOf(id);
  return i >= 0 ? flat[i + 1] : undefined;
}
