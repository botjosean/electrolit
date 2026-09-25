// 2D illustration kit. Units are millimeters; x → right, y → down (= the mission's +z, toward the
// viewer). Every sprite is drawn around the same origin its mission position refers to.
import type { ReactNode } from 'react';
import { t } from '../../engine/i18n';
import { useSettings } from '../../engine/store';

export type P = Record<string, string | number | boolean | undefined>;
export interface ArtProps {
  params: P;
}
/** [x0, y0, x1, y1] in mm */
export type Bounds = [number, number, number, number];

export interface SpriteDef {
  draw: (props: ArtProps) => ReactNode;
  bounds: (params: P) => Bounds;
}

export const str = (p: P, k: string, d: string) => (p[k] === undefined ? d : String(p[k]));
export const num = (p: P, k: string, d: number) => (p[k] === undefined ? d : Number(p[k]));
export const bool = (p: P, k: string) => p[k] === true || p[k] === 'true';

export const INK = '#1d232a';
export const STEEL = '#8d969f';
export const STEEL_DARK = '#59616a';
export const COPPER = '#c87533';

/** Outlined group: children inherit a crisp 1.5px outline at any zoom (non-scaling stroke). */
export function Ink({ children, w = 1.5 }: { children: ReactNode; w?: number }) {
  return (
    <g stroke={INK} strokeWidth={w} strokeLinejoin="round" strokeLinecap="round" className="ink">
      {children}
    </g>
  );
}

/** Text of a prop: literal `text` or i18n `textKey`. */
export function usePropText(p: P) {
  const lang = useSettings((s) => s.lang);
  if (p.textKey) return t(lang, String(p.textKey));
  return str(p, 'text', '');
}

/** Multi-line text centered in a box (mm). */
export function BoxText({ text, x, y, w, h, size, color = '#111', weight = 700, anchor = 'middle', mono }: { text: string; x: number; y: number; w: number; h: number; size?: number; color?: string; weight?: number; anchor?: 'start' | 'middle'; mono?: boolean }) {
  const lines = text.split('\n');
  const longest = Math.max(...lines.map((l) => l.length), 1);
  const fs = size ?? Math.min(h / (lines.length * 1.25), (w / longest) * 1.75);
  const top = y + h / 2 - ((lines.length - 1) * fs * 1.2) / 2;
  const tx = anchor === 'middle' ? x + w / 2 : x + w * 0.05;
  return (
    <text
      x={tx}
      fontSize={fs}
      fill={color}
      fontWeight={weight}
      textAnchor={anchor}
      dominantBaseline="middle"
      fontFamily={mono ? 'ui-monospace, Menlo, Consolas, monospace' : 'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif'}
      stroke="none"
    >
      {lines.map((l, i) => (
        <tspan key={i} x={tx} y={top + i * fs * 1.2}>
          {l}
        </tspan>
      ))}
    </text>
  );
}

/** Polygon for a curved plier handle from the pivot (0, ±side·6) back to (-len, ±spread). */
export function handlePoly(len: number, spread: number, r: number, side: 1 | -1): string {
  const pts: [number, number][] = [];
  const n = 14;
  const bez = (u: number): [number, number] => {
    // quadratic curve pivot → control → end
    const p0 = [-4, side * 6];
    const p1 = [-len * 0.45, side * spread * 0.95];
    const p2 = [-len, side * spread];
    const a = (1 - u) * (1 - u);
    const b = 2 * (1 - u) * u;
    const c = u * u;
    return [a * p0[0] + b * p1[0] + c * p2[0], a * p0[1] + b * p1[1] + c * p2[1]];
  };
  const left: [number, number][] = [];
  const right: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const [x, y] = bez(u);
    const [x2, y2] = bez(Math.min(1, u + 0.01));
    const [x1, y1] = bez(Math.max(0, u - 0.01));
    const dx = x2 - x1;
    const dy = y2 - y1;
    const l = Math.hypot(dx, dy) || 1;
    const nx = -dy / l;
    const ny = dx / l;
    const rr = r * (0.85 + 0.15 * u);
    left.push([x + nx * rr, y + ny * rr]);
    right.push([x - nx * rr, y - ny * rr]);
  }
  pts.push(...left, ...right.reverse());
  return pts.map((p) => p.map((v) => v.toFixed(1)).join(',')).join(' ');
}

/** A soft highlight stripe to give flat shapes some volume. */
export function Shine({ d, opacity = 0.35 }: { d: string; opacity?: number }) {
  return <path d={d} fill="#ffffff" opacity={opacity} stroke="none" />;
}
