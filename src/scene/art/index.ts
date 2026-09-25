import type { SpriteDef } from './common';
import { materials } from './materials';
import { ppe } from './ppe';
import { site } from './site';
import { tools } from './tools';

/** kind (used in mission JSON) → 2D illustration + footprint (mm) */
export const spriteRegistry: Record<string, SpriteDef> = { ...ppe, ...tools, ...materials, ...site };
