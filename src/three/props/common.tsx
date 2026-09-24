import { useMemo } from 'react';
import * as THREE from 'three';
import { t } from '../../engine/i18n';
import { useSettings } from '../../engine/store';

export type P = Record<string, string | number | boolean | undefined>;
export interface PropProps {
  params: P;
}

export const str = (p: P, k: string, d: string) => (p[k] === undefined ? d : String(p[k]));
export const num = (p: P, k: string, d: number) => (p[k] === undefined ? d : Number(p[k]));
export const bool = (p: P, k: string) => p[k] === true || p[k] === 'true';

interface LabelOpts {
  bg?: string;
  fg?: string;
  font?: number;
  bold?: boolean;
  align?: CanvasTextAlign;
  border?: string;
  px?: number; // canvas px per meter
}

/** Canvas texture with text (multi-line with \n). No font downloads → works offline. */
export function useLabelTexture(text: string, w: number, h: number, opts: LabelOpts = {}) {
  const { bg = '#ffffff', fg = '#111111', font = 0.5, bold = true, align = 'center', border, px = 512 } = opts;
  return useMemo(() => {
    const cw = Math.max(32, Math.round(w * px));
    const ch = Math.max(32, Math.round(h * px));
    const c = document.createElement('canvas');
    c.width = cw;
    c.height = ch;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, cw, ch);
    if (border) {
      ctx.strokeStyle = border;
      ctx.lineWidth = Math.max(2, ch * 0.05);
      ctx.strokeRect(0, 0, cw, ch);
    }
    const lines = text.split('\n');
    const size = Math.floor((ch * font) / (lines.length > 1 ? lines.length * 1.18 : 1));
    ctx.font = `${bold ? '700' : '500'} ${size}px system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif`;
    ctx.fillStyle = fg;
    ctx.textAlign = align;
    ctx.textBaseline = 'middle';
    const lh = size * 1.18;
    const top = ch / 2 - ((lines.length - 1) * lh) / 2;
    const x = align === 'left' ? cw * 0.05 : align === 'right' ? cw * 0.95 : cw / 2;
    lines.forEach((ln, i) => {
      // shrink to fit width
      let s = size;
      while (s > 8 && ctx.measureText(ln).width > cw * 0.92) {
        s -= 2;
        ctx.font = `${bold ? '700' : '500'} ${s}px system-ui, Arial, sans-serif`;
      }
      ctx.fillText(ln, x, top + i * lh);
      ctx.font = `${bold ? '700' : '500'} ${size}px system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif`;
    });
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }, [text, w, h, bg, fg, font, bold, align, border, px]);
}

/** Flat label plane facing +Z. */
export function LabelPlane({ text, w, h, position, rotation, ...opts }: { text: string; w: number; h: number; position?: [number, number, number]; rotation?: [number, number, number] } & LabelOpts) {
  const tex = useLabelTexture(text, w, h, opts);
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[w, h]} />
      <meshStandardMaterial map={tex} roughness={0.8} />
    </mesh>
  );
}

/** Resolves a param that is either literal `text` or an i18n `textKey`. */
export function usePropText(p: P) {
  const lang = useSettings((s) => s.lang);
  if (p.textKey) return t(lang, String(p.textKey));
  return str(p, 'text', '');
}

export const METAL = '#9aa3ab';
export const DARK_METAL = '#4a5058';
export const COPPER = '#c87533';
