import { useEffect, useLayoutEffect, useMemo, useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import { getTerm } from '../engine/glossary';
import { useT } from '../engine/i18n';
import { dragSources, dragTargets, hintTargets, interactiveProps, termIds } from '../engine/logic';
import { useMission } from '../engine/store';
import type { CameraShot, EnvKind, InspectStep, Mission, PropDef, Speaker, Step } from '../engine/types';
import { useUi } from '../engine/ui';
import { spriteRegistry } from './art';
import { Figure } from './art/characters';
import type { Bounds } from './art/common';
import { screenApi } from './screen';

// Flat 2D illustrated scene (owner feedback: no 3D, no camera handling). Units: mm; x → right,
// y → down (= mission z). Each step's `camera` only picks what to frame (target x/z + width w).

type Role = 'none' | 'click' | 'source' | 'target' | 'probe';
const TOPBAR = 58;
const MIN_TOUCH_PX = 44;

declare global {
  interface Window {
    __sim?: Record<string, unknown>;
  }
}

function roleOf(step: Step | undefined, id: string, st: ReturnType<typeof useMission.getState>): Role {
  if (!step || st.status !== 'playing' || st.step.done) return 'none';
  if (step.type === 'drag-connect') {
    if (dragSources(step).includes(id)) return st.step.connections[id] === step.pairs[id] ? 'none' : 'source';
    if (dragTargets(step).includes(id)) return 'target';
    return 'none';
  }
  if (step.type === 'measure') return step.points.includes(id) ? 'probe' : 'none';
  if (step.type === 'click') return interactiveProps(step).includes(id) && !st.step.clicked.includes(id) ? 'click' : 'none';
  return 'none';
}

/** Camera shot in effect: the last one defined at or before the current step. */
function useShot(mission: Mission): { shot: CameraShot | undefined; key: string } {
  const idx = useMission((s) => {
    for (let i = s.stepIndex; i >= 0; i--) if (s.mission?.steps[i]?.camera) return i;
    return -1;
  });
  return idx >= 0 ? { shot: mission.steps[idx].camera, key: `${mission.id}:${idx}` } : { shot: mission.camera, key: `${mission.id}:init` };
}

function rotatedBounds(b: Bounds, rotY: number, scale: number): Bounds {
  const c = Math.cos(-rotY);
  const s = Math.sin(-rotY);
  const xs: number[] = [];
  const ys: number[] = [];
  for (const [x, y] of [
    [b[0], b[1]],
    [b[2], b[1]],
    [b[0], b[3]],
    [b[2], b[3]],
  ]) {
    xs.push((x * c - y * s) * scale);
    ys.push((x * s + y * c) * scale);
  }
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}

interface Item {
  def: PropDef;
  x: number;
  y: number;
  local: Bounds; // bounds around (x, y) after rotation/scale
}

const ease = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);

function Background({ env }: { env: EnvKind }) {
  const yard = env === 'yard';
  return (
    <g>
      <defs>
        <pattern id="ground" width="400" height="400" patternUnits="userSpaceOnUse">
          <rect width="400" height="400" fill={yard ? '#cdb089' : '#b3b0aa'} />
          {Array.from({ length: 36 }).map((_, i) => (
            <circle key={i} cx={(i * 97) % 400} cy={(i * 57) % 400} r={3 + (i % 4) * 2.5} fill={yard ? (i % 3 ? '#b99a70' : '#dcc39e') : i % 3 ? '#a3a09a' : '#c2bfb9'} />
          ))}
        </pattern>
      </defs>
      <rect x={-40000} y={-40000} width={80000} height={80000} fill="url(#ground)" />
      {yard ? (
        <g>
          {/* concrete slab of the house being built, framing in the back */}
          <rect x={-5000} y={-10500} width={10000} height={7000} fill="#d2d0ca" stroke="#9c9a94" strokeWidth={30} />
          <rect x={-5000} y={-3620} width={10000} height={90} fill="#d9b77e" />
        </g>
      ) : (
        <g>
          <rect x={-6000} y={-3200} width={12000} height={1000} fill="#dcd6ca" />
          <rect x={-6000} y={-2240} width={12000} height={60} fill="#b9b2a4" />
        </g>
      )}
    </g>
  );
}

export function Scene2D({ mission }: { mission: Mission }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragLineRef = useRef<SVGLineElement>(null);
  const dragDotRef = useRef<SVGCircleElement>(null);
  const [size, setSize] = useState({ w: typeof window !== 'undefined' ? window.innerWidth : 800, h: typeof window !== 'undefined' ? window.innerHeight : 600 });
  const inset = useUi((s) => s.panelInset);
  const { shot, key } = useShot(mission);
  const t = useT();

  const stepIndex = useMission((s) => s.stepIndex);
  const status = useMission((s) => s.status);
  const stepState = useMission((s) => s.step);
  const hidden = useMission((s) => s.hidden);
  const moved = useMission((s) => s.moved);
  const identified = useMission((s) => s.identified);
  const wires = useMission((s) => s.wires);
  const hintActive = useMission((s) => s.hintActive);
  const dragging = useMission((s) => s.dragging);
  const dispatch = useMission((s) => s.dispatch);
  const step = status === 'playing' ? mission.steps[stepIndex] : undefined;
  const [hover, setHover] = useState<string | null>(null);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    setSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  // ---------- framing ----------
  const view = useMemo(() => {
    const s = shot ?? { pos: [0, 1.6, 2] as [number, number, number], target: [0, 0.7, 0] as [number, number, number] };
    const dist = Math.hypot(s.pos[0] - s.target[0], s.pos[1] - s.target[1], s.pos[2] - s.target[2]);
    const wantW = (s.w ?? dist * 1.25) * 1000;
    const freeW = Math.max(160, size.w - inset.right);
    const freeH = Math.max(160, size.h - TOPBAR - inset.bottom);
    let ppm = freeW / wantW;
    if (freeH / ppm < wantW * 0.42) ppm = freeH / (wantW * 0.42);
    const cx = freeW / 2;
    const cy = TOPBAR + freeH / 2;
    return { x: s.target[0] * 1000 - cx / ppm, y: s.target[2] * 1000 - cy / ppm, w: size.w / ppm, h: size.h / ppm, ppm };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, size.w, size.h, inset.right, inset.bottom]);

  const cur = useRef<typeof view | null>(null);
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const apply = (v: typeof view) => svg.setAttribute('viewBox', `${v.x} ${v.y} ${v.w} ${v.h}`);
    const from = cur.current;
    if (!from) {
      cur.current = view;
      apply(view);
      window.__sim = { ...(window.__sim ?? {}), camSettled: true };
      return;
    }
    window.__sim = { ...(window.__sim ?? {}), camSettled: false };
    const t0 = performance.now();
    let raf = 0;
    const tick = () => {
      const u = Math.min(1, (performance.now() - t0) / 650);
      const k = ease(u);
      const v = {
        x: from.x + (view.x - from.x) * k,
        y: from.y + (view.y - from.y) * k,
        w: from.w + (view.w - from.w) * k,
        h: from.h + (view.h - from.h) * k,
        ppm: view.ppm,
      };
      cur.current = v;
      apply(v);
      if (u < 1) raf = requestAnimationFrame(tick);
      else window.__sim = { ...(window.__sim ?? {}), camSettled: true };
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [view]);

  const px = 1 / view.ppm; // mm per screen px (for constant-size UI)

  // ---------- items (props) with world bounds ----------
  const items: Item[] = useMemo(() => {
    const list: Item[] = [];
    for (const def of mission.props) {
      if (hidden[def.id]) continue;
      const sp = spriteRegistry[def.kind];
      if (!sp) continue;
      const pos = moved[def.id] ?? def.pos;
      const local = rotatedBounds(sp.bounds(def.params ?? {}), def.rot?.[1] ?? 0, def.scale ?? 1);
      list.push({ def, x: pos[0] * 1000, y: pos[2] * 1000, local });
    }
    const posOf = (d: PropDef) => moved[d.id] ?? d.pos;
    list.sort((a, b) => posOf(a.def)[1] - posOf(b.def)[1] || a.y - b.y);
    return list;
  }, [mission.props, hidden, moved]);

  const roles = useMemo(() => {
    const st = useMission.getState();
    const r: Record<string, Role> = {};
    for (const it of items) r[it.def.id] = roleOf(step, it.def.id, st);
    return r;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, step, stepState, status]);

  const viewable = (it: Item) => roles[it.def.id] === 'none' && identified.includes(it.def.id) && !!it.def.label;
  const hinted = useMemo(() => (step && hintActive ? hintTargets(step, stepState) : []), [step, hintActive, stepState]);

  /** Touch-friendly hit box in world mm. */
  const hitBox = (it: Item): Bounds => {
    const [x0, y0, x1, y1] = it.local;
    const w = x1 - x0;
    const h = y1 - y0;
    const minMm = MIN_TOUCH_PX * px;
    const gx = Math.max(w * 0.075, (minMm - w) / 2, 0);
    const gy = Math.max(h * 0.075, (minMm - h) / 2, 0);
    return [it.x + x0 - gx, it.y + y0 - gy, it.x + x1 + gx, it.y + y1 + gy];
  };

  const active = items.filter((it) => roles[it.def.id] !== 'none' || viewable(it));

  const toScene = (clientX: number, clientY: number) => {
    const svg = svgRef.current!;
    const m = svg.getScreenCTM();
    if (!m) return { x: 0, y: 0 };
    const p = new DOMPoint(clientX, clientY).matrixTransform(m.inverse());
    return { x: p.x, y: p.y };
  };
  const topmost = (x: number, y: number, pred: (it: Item) => boolean) => {
    for (let i = active.length - 1; i >= 0; i--) {
      const it = active[i];
      if (!pred(it)) continue;
      const b = hitBox(it);
      if (x >= b[0] && x <= b[2] && y >= b[1] && y <= b[3]) return it;
    }
    return null;
  };

  // ---------- pointer handling (tap, drag, tap-then-tap) ----------
  const tapStart = useRef<{ id: string; x: number; y: number } | null>(null);

  const tap = (it: Item) => {
    const id = it.def.id;
    const st = useMission.getState();
    const role = roles[id];
    if (role === 'click') dispatch({ type: 'click', id });
    else if (role === 'probe') dispatch({ type: 'probe', id });
    else if (role === 'source') st.selectSource(id);
    else if (role === 'target' && st.step.selectedSource) dispatch({ type: 'connect', src: st.step.selectedSource, tgt: id });
    else if (viewable(it)) {
      const label = it.def.label ?? '';
      useUi.getState().openViewer({ kind: it.def.kind, params: it.def.params, termId: termIds(t(label))[0], labelKey: label });
    }
  };

  const onPointerDown = (e: RPointerEvent<SVGSVGElement>) => {
    if ((e.target as Element).closest('[data-hotspot]')) return;
    const p = toScene(e.clientX, e.clientY);
    const hit = topmost(p.x, p.y, () => true);
    if (!hit) {
      if (useMission.getState().step.selectedSource) useMission.getState().selectSource(null);
      tapStart.current = null;
      return;
    }
    tapStart.current = { id: hit.def.id, x: e.clientX, y: e.clientY };
    if (roles[hit.def.id] === 'source') {
      const st = useMission.getState();
      st.selectSource(hit.def.id);
      st.setDragging(hit.def.id);
      svgRef.current?.setPointerCapture?.(e.pointerId);
      const line = dragLineRef.current;
      if (line) {
        line.setAttribute('x1', String(hit.x + (hit.local[0] + hit.local[2]) / 2));
        line.setAttribute('y1', String(hit.y + (hit.local[1] + hit.local[3]) / 2));
        line.setAttribute('x2', line.getAttribute('x1')!);
        line.setAttribute('y2', line.getAttribute('y1')!);
      }
    }
  };

  const onPointerMove = (e: RPointerEvent<SVGSVGElement>) => {
    const p = toScene(e.clientX, e.clientY);
    if (useMission.getState().dragging) {
      dragLineRef.current?.setAttribute('x2', String(p.x));
      dragLineRef.current?.setAttribute('y2', String(p.y));
      dragDotRef.current?.setAttribute('cx', String(p.x));
      dragDotRef.current?.setAttribute('cy', String(p.y));
      return;
    }
    if (e.pointerType === 'mouse') {
      const h = topmost(p.x, p.y, () => true);
      const id = h?.def.id ?? null;
      if (id !== hover) setHover(id);
    }
  };

  const onPointerUp = (e: RPointerEvent<SVGSVGElement>) => {
    const p = toScene(e.clientX, e.clientY);
    const st = useMission.getState();
    const start = tapStart.current;
    tapStart.current = null;
    const small = !!start && Math.hypot(e.clientX - start.x, e.clientY - start.y) < 12;
    if (st.dragging) {
      const src = st.dragging;
      st.setDragging(null);
      const drop = topmost(p.x, p.y, (it) => roles[it.def.id] === 'target');
      if (drop) dispatch({ type: 'connect', src, tgt: drop.def.id });
      return; // a tap on a source just keeps it selected (tap-then-tap mode)
    }
    if (!start || !small) return;
    const hit = topmost(p.x, p.y, (it) => it.def.id === start.id);
    if (hit) tap(hit);
  };

  // ---------- test / demo bridge ----------
  useEffect(() => {
    const project = (id: string) => {
      const svg = svgRef.current;
      const it = items.find((i) => i.def.id === id);
      if (!svg || !it) return null;
      const m = svg.getScreenCTM();
      if (!m) return null;
      const q = new DOMPoint(it.x + (it.local[0] + it.local[2]) / 2, it.y + (it.local[1] + it.local[3]) / 2).matrixTransform(m);
      const r = svg.getBoundingClientRect();
      return { x: q.x, y: q.y, visible: q.x >= r.left && q.x <= r.right && q.y >= r.top && q.y <= r.bottom };
    };
    const hitTest = (x: number, y: number) =>
      document
        .elementsFromPoint(x, y)
        .map((el) => el.closest('[data-prop]')?.getAttribute('data-prop'))
        .filter(Boolean);
    const topProp = (x: number, y: number) => {
      const p = toScene(x, y);
      return topmost(p.x, p.y, () => true)?.def.id ?? null;
    };
    screenApi.project = project;
    window.__sim = { ...(window.__sim ?? {}), project, hitTest, topProp };
    return () => {
      if (screenApi.project === project) screenApi.project = null;
    };
  });

  // ---------- render ----------
  const speaker: Speaker | undefined = step?.speaker;
  const inspect = step?.type === 'inspect' ? (step as InspectStep) : null;
  const selected = stepState.selectedSource;
  const probes = step?.type === 'measure' ? stepState.probes : { red: null, black: null };
  const itemById = (id: string | null) => (id ? items.find((i) => i.def.id === id) : undefined);
  const center = (it: Item) => ({ x: it.x + (it.local[0] + it.local[2]) / 2, y: it.y + (it.local[1] + it.local[3]) / 2 });

  return (
    <div ref={wrapRef} className="scene2d" data-testid="scene">
      <svg
        ref={svgRef}
        className={`scene-svg ${dragging ? 'dragging' : ''}`}
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid slice"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          useMission.getState().setDragging(null);
          tapStart.current = null;
        }}
        onPointerLeave={() => hover && setHover(null)}
        style={{ cursor: hover ? 'pointer' : 'default' }}
      >
        <Background env={mission.env} />
        {/* characters stand behind the work area (drawn first, like paper cut-outs) */}
        {(Object.keys(mission.characters) as Speaker[]).map((who) => {
          const c = mission.characters[who]!;
          return (
            <g key={who} transform={`translate(${c.pos[0] * 1000},${c.pos[2] * 1000})`} className={`figure ${speaker === who ? 'speaking' : ''}`}>
              <ellipse cx={0} cy={0} rx={180} ry={50} fill="#00000030" />
              <Figure who={who} />
              {speaker === who ? (
                <g transform="translate(150,-1900)">
                  <path d="M0,0 h260 a40,40 0 0 1 40,40 v90 a40,40 0 0 1 -40,40 h-180 l-60,50 l10,-50 h-30 a40,40 0 0 1 -40,-40 v-90 a40,40 0 0 1 40,-40 z" fill="#fff" stroke="#1d232a" strokeWidth={6} />
                  <circle cx={80} cy={85} r={18} fill="#1d232a" />
                  <circle cx={150} cy={85} r={18} fill="#1d232a" />
                  <circle cx={220} cy={85} r={18} fill="#1d232a" />
                </g>
              ) : null}
            </g>
          );
        })}
        {items.map((it) => {
          const role = roles[it.def.id];
          const isView = viewable(it);
          const Art = spriteRegistry[it.def.kind].draw;
          const cls = [
            'prop',
            role !== 'none' ? `role-${role}` : '',
            isView ? 'viewable' : '',
            hinted.includes(it.def.id) ? 'hint' : '',
            selected === it.def.id || dragging === it.def.id ? 'selected' : '',
            hover === it.def.id ? 'hover' : '',
          ].join(' ');
          return (
            <g key={it.def.id} data-prop={it.def.id} className={cls} style={{ transform: `translate(${it.x}px, ${it.y}px)` }}>
              <g className="art" transform={`rotate(${(-(it.def.rot?.[1] ?? 0) * 180) / Math.PI}) scale(${it.def.scale ?? 1})`}>
                <Art params={it.def.params ?? {}} />
              </g>
              {role !== 'none' || isView ? (
                (() => {
                  const b = hitBox(it);
                  return <rect data-prop-hit={it.def.id} x={b[0] - it.x} y={b[1] - it.y} width={b[2] - b[0]} height={b[3] - b[1]} fill="transparent" className="hit" />;
                })()
              ) : null}
            </g>
          );
        })}
        {/* connections made in "wire" style */}
        {wires.map((w) => {
          const a = itemById(w.from);
          const b = itemById(w.to);
          if (!a || !b) return null;
          const p = center(a);
          const q = center(b);
          const d = `M${p.x},${p.y} Q${(p.x + q.x) / 2},${Math.max(p.y, q.y) + 60} ${q.x},${q.y}`;
          return (
            <g key={`${w.from}>${w.to}`} pointerEvents="none">
              <path d={d} fill="none" stroke="#1d232a" strokeWidth={13} strokeLinecap="round" />
              <path d={d} fill="none" stroke={w.color} strokeWidth={9} strokeLinecap="round" />
            </g>
          );
        })}
        {/* multimeter probes */}
        {(['red', 'black'] as const).map((k) => {
          const it = itemById(probes[k]);
          if (!it) return null;
          const c = center(it);
          const s = px * 1.6;
          return (
            <g key={k} transform={`translate(${c.x},${c.y}) scale(${s})`} pointerEvents="none" className="probe-tip">
              <path d="M0,0 L10,-18 L60,-100 L78,-88 L28,-6 Z" fill={k === 'red' ? '#d42020' : '#161616'} stroke="#fff" strokeWidth={3} />
              <path d="M0,0 L10,-18 L16,-12 Z" fill="#cfcfcf" />
            </g>
          );
        })}
        {/* drag line */}
        <g pointerEvents="none" style={{ display: dragging ? undefined : 'none' }}>
          <line ref={dragLineRef} stroke="#38d9ff" strokeWidth={4 * px} strokeDasharray={`${10 * px} ${7 * px}`} strokeLinecap="round" />
          <circle ref={dragDotRef} r={10 * px} fill="#38d9ff" />
        </g>
        {/* labels of identified objects (English name) */}
        {items
          .filter((it) => it.def.label && identified.includes(it.def.id))
          .map((it) => {
            const raw = t(it.def.label!);
            const ids = termIds(raw);
            const text = ids.length ? (getTerm(ids[0])?.term ?? raw) : raw.replace(/\[\[[^|\]]+\|?([^\]]*)\]\]/g, '$1');
            const fs = 12 * px;
            const w = text.length * fs * 0.58 + 16 * px;
            const c = center(it);
            const y = it.y + it.local[1] - 6 * px;
            return (
              <g key={`lab-${it.def.id}`} transform={`translate(${c.x},${y})`} pointerEvents="none" className="prop-label2d" data-label={it.def.id}>
                <rect x={-w / 2} y={-fs * 1.5} width={w} height={fs * 1.5} rx={fs * 0.5} fill="#15181cdd" />
                <text x={0} y={-fs * 0.72} fontSize={fs} fill="#ffe08a" fontWeight={700} textAnchor="middle" dominantBaseline="middle">
                  {text}
                </text>
              </g>
            );
          })}
        {/* inspection points */}
        {inspect
          ? (() => {
              const target = mission.props.find((p) => p.id === inspect.target);
              if (!target) return null;
              return inspect.points.map((p, i) => {
                const on = stepState.inspected.includes(p.id);
                const showHint = hintActive && (inspect.mode === 'learn' ? !on : !!p.defect && !on);
                const r = 19 * px;
                return (
                  <g
                    key={p.id}
                    data-hotspot={p.id}
                    className={`hotspot2d ${inspect.mode} ${on ? 'on' : ''} ${showHint ? 'hint' : ''}`}
                    transform={`translate(${(target.pos[0] + p.pos[0]) * 1000},${(target.pos[2] + p.pos[2]) * 1000})`}
                    onClick={() => {
                      if (stepState.done) return;
                      dispatch({ type: 'inspect', id: p.id });
                      useUi.getState().setInspectFocus(p.id);
                    }}
                    role="button"
                    aria-label={t(p.label)}
                  >
                    <circle r={r * 1.5} fill="transparent" />
                    <circle r={r} className="hs-dot" strokeWidth={3 * px} />
                    <text y={1 * px} fontSize={15 * px} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontWeight={900}>
                      {inspect.mode === 'find' ? (on ? '!' : i + 1) : on ? '✓' : i + 1}
                    </text>
                  </g>
                );
              });
            })()
          : null}
      </svg>
    </div>
  );
}
