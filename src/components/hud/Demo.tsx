import { useEffect, useRef, useState } from 'react';
import { t as translate } from '../../engine/i18n';
import { dragSources } from '../../engine/logic';
import { speakSequence, stopSpeech } from '../../engine/speech';
import { useMission, useSettings } from '../../engine/store';
import type { Step } from '../../engine/types';
import { useUi } from '../../engine/ui';
import { screenApi } from '../../three/screen';

// "Show me how": an animated hand performs the correct moves on screen (without doing them),
// narrated by Rosa — an in-engine demo video generated from the mission data. Then you do it.

type Target = { prop: string } | { sel: string };
type Move =
  | { kind: 'tap'; at: Target; say: string }
  | { kind: 'drag'; from: Target; to: Target; say: string }
  | { kind: 'hold'; at: Target; say: string };

export function demoMoves(step: Step): Move[] {
  const st = useMission.getState().step;
  switch (step.type) {
    case 'click':
      return step.targets.filter((id) => !st.clicked.includes(id)).map((id) => ({ kind: 'tap', at: { prop: id }, say: 'ui.demo.tapHere' }));
    case 'drag-connect':
      return dragSources(step)
        .filter((src) => st.connections[src] !== step.pairs[src])
        .map((src) => ({ kind: 'drag', from: { prop: src }, to: { prop: step.pairs[src] }, say: 'ui.demo.dragHere' }));
    case 'choose-option':
      return [{ kind: 'tap', at: { sel: `[data-option="${step.options.findIndex((o) => o.correct)}"]` }, say: 'ui.demo.thisOne' }];
    case 'measure':
      return [
        { kind: 'tap', at: { sel: `[data-mode="${step.expect.mode}"]` }, say: 'ui.demo.dial' },
        { kind: 'tap', at: { prop: step.expect.pair[0] }, say: 'ui.demo.red' },
        { kind: 'tap', at: { prop: step.expect.pair[1] }, say: 'ui.demo.black' },
        { kind: 'tap', at: { sel: '[data-testid=meter-confirm]' }, say: 'ui.demo.record' },
      ];
    case 'hold-action':
      return [{ kind: 'hold', at: { sel: '[data-testid=hold-btn]' }, say: 'ui.demo.hold' }];
    case 'inspect': {
      const pts = step.mode === 'learn' ? step.points.filter((p) => !st.inspected.includes(p.id)) : step.points.filter((p) => p.defect);
      const moves: Move[] = pts.map((p) => ({ kind: 'tap', at: { sel: `[data-hotspot="${p.id}"]` }, say: step.mode === 'find' ? 'ui.demo.problem' : 'ui.demo.tapHere' }));
      if (step.mode === 'find') moves.push({ kind: 'tap', at: { sel: '[data-testid=inspect-report]' }, say: 'ui.demo.report' });
      return moves;
    }
    default:
      return [];
  }
}

function pointOf(t: Target): { x: number; y: number } | null {
  if ('prop' in t) {
    const p = screenApi.project?.(t.prop);
    return p && p.visible ? p : null;
  }
  const el = document.querySelector(t.sel);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function DemoLayer() {
  const token = useUi((s) => s.demo);
  const setDemo = useUi((s) => s.setDemo);
  const [hand, setHand] = useState<{ x: number; y: number; press: boolean; drag: { x: number; y: number } | null; caption: string } | null>(null);
  const alive = useRef(0);

  useEffect(() => {
    if (token == null) return;
    const run = ++alive.current;
    const live = () => alive.current === run;
    (async () => {
      const { mission, stepIndex } = useMission.getState();
      const lang = useSettings.getState().lang;
      const step = mission?.steps[stepIndex];
      if (!step) return setDemo(null);
      const moves = demoMoves(step);
      speakSequence([{ text: translate(lang, 'ui.demo.intro'), lang }, { text: translate(lang, step.text), lang }]);
      let pos = { x: window.innerWidth / 2, y: window.innerHeight * 0.45 };
      const say = (k: string) => translate(lang, k);
      setHand({ ...pos, press: false, drag: null, caption: say('ui.demo.watch') });
      await wait(700);
      for (const m of moves) {
        if (!live()) return;
        const a = pointOf(m.kind === 'drag' ? m.from : m.at);
        if (!a) continue;
        pos = a;
        setHand({ ...a, press: false, drag: null, caption: say(m.say) });
        await wait(750);
        setHand({ ...a, press: true, drag: null, caption: say(m.say) });
        if (m.kind === 'drag') {
          const b = pointOf(m.to);
          await wait(250);
          if (b && live()) {
            setHand({ ...b, press: true, drag: a, caption: say(m.say) });
            await wait(900);
          }
        } else if (m.kind === 'hold' && step.type === 'hold-action') {
          // animate the gauge (and the 3D wire) up to the middle of the target zone, then reset
          const target = (step.zone[0] + step.zone[1]) / 2;
          const t0 = performance.now();
          const ms = (step.durationMs * target) / step.max;
          while (live() && performance.now() - t0 < ms) {
            useMission.getState().setHoldValue((step.max * (performance.now() - t0)) / step.durationMs);
            await wait(30);
          }
          useMission.getState().setHoldValue(target);
          setHand({ ...a, press: false, drag: null, caption: say('ui.demo.release') });
          await wait(1300);
          useMission.getState().setHoldValue(0);
        } else await wait(350);
        if (!live()) return;
        setHand((h) => (h ? { ...h, press: false, drag: null } : h));
        await wait(350);
      }
      if (!live()) return;
      setHand({ ...pos, press: false, drag: null, caption: say('ui.demo.yourTurn') });
      await wait(1400);
      if (live()) {
        setHand(null);
        setDemo(null);
      }
    })();
    return () => {
      alive.current++;
    };
  }, [token, setDemo]);

  if (token == null || !hand) return null;
  const stop = () => {
    alive.current++;
    stopSpeech();
    if (useMission.getState().step.holdValue && !useMission.getState().step.done) useMission.getState().setHoldValue(0);
    setHand(null);
    setDemo(null);
  };
  return (
    <div className="demo-layer" onPointerDown={stop} data-testid="demo">
      {hand.drag ? (
        <svg className="demo-trail" width="100%" height="100%">
          <line x1={hand.drag.x} y1={hand.drag.y} x2={hand.x} y2={hand.y} />
        </svg>
      ) : null}
      <div className={`demo-hand ${hand.press ? 'press' : ''}`} style={{ transform: `translate(${hand.x}px, ${hand.y}px)` }}>
        <span className="demo-ring" />
        <span className="demo-emoji">👆</span>
      </div>
      <div className="demo-caption">
        🎬 {hand.caption} <span className="demo-skip">{translate(useSettings.getState().lang, 'ui.demo.skip')}</span>
      </div>
    </div>
  );
}
