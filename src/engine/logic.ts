// Pure mission/step logic. No React, no zustand: easy to unit test and reuse by every module.
import type {
  BossMood,
  ClickStep,
  DragConnectStep,
  InspectStep,
  MeasureStep,
  MeterMode,
  Mission,
  Scores,
  Step,
} from './types';

export interface StepState {
  clicked: string[];
  connections: Record<string, string>;
  selectedSource: string | null;
  meterMode: MeterMode | null;
  probes: { red: string | null; black: string | null };
  holdValue: number;
  inspected: string[];
  chosen: number | null;
  wrongOptions: number[];
  done: boolean;
}

export const emptyStepState = (): StepState => ({
  clicked: [],
  connections: {},
  selectedSource: null,
  meterMode: null,
  probes: { red: null, black: null },
  holdValue: 0,
  inspected: [],
  chosen: null,
  wrongOptions: [],
  done: false,
});

export type Action =
  | { type: 'click'; id: string }
  | { type: 'connect'; src: string; tgt: string }
  | { type: 'option'; index: number }
  | { type: 'meterMode'; mode: MeterMode }
  | { type: 'probe'; id: string }
  | { type: 'confirmMeasure' }
  | { type: 'holdEnd'; value: number }
  | { type: 'inspect'; id: string }
  | { type: 'report' };

export interface Outcome {
  state: StepState;
  /** i18n keys of mistakes made by this action (each costs correctness) */
  mistakes: string[];
  /** i18n key: safety failure → mission failed */
  fail?: string;
  /** i18n key of neutral/positive feedback */
  info?: string;
  /** the step just became complete */
  completed: boolean;
}

const GENERIC_WRONG = 'ui.feedback.wrong';

const samePair = (a: [string, string], b: [string, string]) =>
  (a[0] === b[0] && a[1] === b[1]) || (a[0] === b[1] && a[1] === b[0]);

/** Props that react to pointer input during this step. */
export function interactiveProps(step: Step): string[] {
  switch (step.type) {
    case 'click':
      return unique([
        ...step.targets,
        ...Object.keys(step.wrong ?? {}),
        ...Object.keys(step.unsafe ?? {}),
        ...(step.decoys ?? []),
      ]);
    case 'drag-connect':
      return unique([...Object.keys(step.pairs), ...Object.values(step.pairs), ...(step.decoyTargets ?? [])]);
    case 'measure':
      return [...step.points];
    default:
      return [];
  }
}

export function dragSources(step: DragConnectStep): string[] {
  return Object.keys(step.pairs);
}

export function dragTargets(step: DragConnectStep): string[] {
  return unique([...Object.values(step.pairs), ...(step.decoyTargets ?? [])]);
}

/** The props a hint should point at right now. */
export function hintTargets(step: Step, s: StepState): string[] {
  switch (step.type) {
    case 'click': {
      const remaining = step.targets.filter((t) => !s.clicked.includes(t));
      return step.ordered ? remaining.slice(0, 1) : remaining;
    }
    case 'drag-connect': {
      const src = s.selectedSource ?? Object.keys(step.pairs).find((k) => s.connections[k] !== step.pairs[k]);
      return src ? [src, step.pairs[src]] : [];
    }
    case 'measure':
      return [...step.expect.pair];
    default:
      return [];
  }
}

function unique<T>(a: T[]): T[] {
  return Array.from(new Set(a));
}

export function meterReading(step: MeasureStep, mode: MeterMode | null, red: string | null, black: string | null): string {
  if (!mode) return '';
  if (red && black) {
    const r = step.readings.find((x) => x.mode === mode && samePair(x.pair, [red, black]));
    if (r) return r.value;
  }
  if (mode === 'OHM' || mode === 'CONT') return 'OL';
  return '0.0';
}

export function isMeasureCorrect(step: MeasureStep, s: StepState): boolean {
  const { red, black } = s.probes;
  return s.meterMode === step.expect.mode && !!red && !!black && samePair([red, black], step.expect.pair);
}

export function holdInZone(zone: [number, number], value: number) {
  return value >= zone[0] && value <= zone[1];
}

export function inspectComplete(step: InspectStep, s: StepState): boolean {
  if (step.mode === 'learn') return step.points.every((p) => s.inspected.includes(p.id));
  return step.points.filter((p) => p.defect).every((p) => s.inspected.includes(p.id));
}

export function applyAction(step: Step, prev: StepState, action: Action): Outcome {
  const state: StepState = {
    ...prev,
    clicked: [...prev.clicked],
    connections: { ...prev.connections },
    probes: { ...prev.probes },
    inspected: [...prev.inspected],
    wrongOptions: [...prev.wrongOptions],
  };
  const out: Outcome = { state, mistakes: [], completed: false };
  if (prev.done) return out;

  const complete = () => {
    state.done = true;
    out.completed = true;
  };

  switch (step.type) {
    case 'dialogue':
      return out;

    case 'click': {
      if (action.type !== 'click') return out;
      return clickLogic(step, state, action.id, out, complete);
    }

    case 'drag-connect': {
      if (action.type !== 'connect') return out;
      const key = `${action.src}>${action.tgt}`;
      if (!(action.src in step.pairs)) return out;
      if (step.unsafe?.[key]) {
        out.fail = step.unsafe[key];
        return out;
      }
      state.selectedSource = null;
      if (step.pairs[action.src] === action.tgt) {
        state.connections[action.src] = action.tgt;
        if (Object.keys(step.pairs).every((k) => state.connections[k] === step.pairs[k])) complete();
      } else {
        out.mistakes.push(step.wrong?.[key] ?? GENERIC_WRONG);
      }
      return out;
    }

    case 'choose-option': {
      if (action.type !== 'option') return out;
      const opt = step.options[action.index];
      if (!opt || state.wrongOptions.includes(action.index)) return out;
      if (opt.unsafe) {
        state.chosen = action.index;
        out.fail = opt.unsafe;
        return out;
      }
      if (opt.correct) {
        state.chosen = action.index;
        if (opt.feedback) out.info = opt.feedback;
        complete();
      } else {
        state.wrongOptions.push(action.index);
        out.mistakes.push(opt.feedback ?? GENERIC_WRONG);
      }
      return out;
    }

    case 'measure': {
      if (action.type === 'meterMode') {
        state.meterMode = action.mode;
      } else if (action.type === 'probe') {
        if (!step.points.includes(action.id)) return out;
        const p = state.probes;
        if (p.red === action.id) p.red = null;
        else if (p.black === action.id) p.black = null;
        else if (!p.red) p.red = action.id;
        else if (!p.black) p.black = action.id;
        else {
          p.red = action.id;
          p.black = null;
        }
      } else if (action.type === 'confirmMeasure') {
        const { red, black } = state.probes;
        if (!red || !black) return out; // UI prevents this
        if (state.meterMode !== step.expect.mode) {
          out.mistakes.push(step.wrongMode ?? 'ui.meter.wrongMode');
        } else if (!samePair([red, black], step.expect.pair)) {
          out.mistakes.push(step.wrongPoints ?? 'ui.meter.wrongPoints');
        } else complete();
      }
      return out;
    }

    case 'hold-action': {
      if (action.type !== 'holdEnd') return out;
      state.holdValue = action.value;
      if (holdInZone(step.zone, action.value)) complete();
      else out.mistakes.push(action.value < step.zone[0] ? step.tooLow : step.tooHigh);
      return out;
    }

    case 'inspect': {
      if (action.type === 'inspect') {
        const pt = step.points.find((p) => p.id === action.id);
        if (!pt) return out;
        if (step.mode === 'find' && state.inspected.includes(pt.id)) {
          state.inspected = state.inspected.filter((id) => id !== pt.id);
        } else if (!state.inspected.includes(pt.id)) state.inspected.push(pt.id);
        if (step.mode === 'learn' && inspectComplete(step, state)) complete();
      } else if (action.type === 'report' && step.mode === 'find') {
        const wrong = step.points.filter((p) => !p.defect && state.inspected.includes(p.id));
        if (wrong.length) {
          out.mistakes.push('ui.inspect.falsePositive');
          state.inspected = state.inspected.filter((id) => !wrong.some((w) => w.id === id));
        } else if (!inspectComplete(step, state)) {
          out.mistakes.push(step.missed ?? 'ui.inspect.missed');
        } else complete();
      }
      return out;
    }
  }
}

function clickLogic(step: ClickStep, state: StepState, id: string, out: Outcome, complete: () => void): Outcome {
  if (step.unsafe?.[id]) {
    out.fail = step.unsafe[id];
    return out;
  }
  if (state.clicked.includes(id)) return out;
  if (step.targets.includes(id)) {
    const expected = step.targets.find((t) => !state.clicked.includes(t));
    if (step.ordered && expected !== id) {
      if (step.earlyUnsafe?.[id]) {
        out.fail = step.earlyUnsafe[id];
        return out;
      }
      out.mistakes.push('ui.feedback.order');
      return out;
    }
    state.clicked.push(id);
    if (step.targets.every((t) => state.clicked.includes(t))) complete();
    return out;
  }
  out.mistakes.push(step.wrong?.[id] ?? GENERIC_WRONG);
  return out;
}

/** Safety requirements checked when a step starts. Returns the fail key if violated. */
export function checkRequirements(step: Step, flags: string[]): string | undefined {
  for (const r of step.requires ?? []) if (!flags.includes(r.flag)) return r.fail;
  return undefined;
}

export function computeScores(elapsedSec: number, parSeconds: number, mistakes: number, hints: number, failed: boolean): Scores {
  const safety = failed ? 0 : 100;
  const correctness = Math.max(0, 100 - 15 * mistakes - 5 * hints);
  const speed = elapsedSec <= parSeconds ? 100 : Math.max(40, Math.round((100 * parSeconds) / elapsedSec));
  const total = failed ? 0 : Math.round(0.5 * safety + 0.3 * correctness + 0.2 * speed);
  const stars = failed ? 0 : total >= 90 ? 3 : total >= 75 ? 2 : 1;
  return { safety, correctness, speed, total, stars, elapsed: Math.round(elapsedSec) };
}

export function bossMood(s: Scores, failed: boolean): BossMood {
  if (failed) return 'fail';
  if (s.correctness < 60) return 'sloppy';
  if (s.speed < 60) return 'slow';
  if (s.total >= 90) return 'great';
  return 'ok';
}

/** Collects every glossary id referenced with [[id]] markup in a text. */
export function termIds(text: string): string[] {
  const out: string[] = [];
  const re = /\[\[([a-z0-9_-]+)(?:\|[^\]]*)?\]\]/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) if (!out.includes(m[1])) out.push(m[1]);
  return out;
}

/** i18n keys used by a step (prompt, feedback, options, inspect points...). */
export function stepKeys(step: Step): string[] {
  const keys = [step.text];
  if (step.success) keys.push(step.success);
  for (const r of step.requires ?? []) keys.push(r.fail);
  switch (step.type) {
    case 'click':
      keys.push(...Object.values(step.wrong ?? {}), ...Object.values(step.unsafe ?? {}), ...Object.values(step.earlyUnsafe ?? {}));
      break;
    case 'drag-connect':
      keys.push(...Object.values(step.wrong ?? {}), ...Object.values(step.unsafe ?? {}));
      break;
    case 'choose-option':
      for (const o of step.options) {
        keys.push(o.text);
        if (o.feedback) keys.push(o.feedback);
        if (o.unsafe) keys.push(o.unsafe);
      }
      break;
    case 'measure':
      if (step.wrongMode) keys.push(step.wrongMode);
      if (step.wrongPoints) keys.push(step.wrongPoints);
      break;
    case 'hold-action':
      keys.push(step.tooLow, step.tooHigh);
      break;
    case 'inspect':
      for (const p of step.points) keys.push(p.label, p.info);
      if (step.missed) keys.push(step.missed);
      break;
  }
  return keys;
}

export function missionKeys(m: Mission): string[] {
  const keys = [m.title, m.desc];
  for (const p of m.props) if (p.label) keys.push(p.label);
  for (const s of m.steps) keys.push(...stepKeys(s));
  return keys;
}
