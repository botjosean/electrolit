import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { applyAction, bossMood, checkRequirements, computeScores, emptyStepState, type Action, type StepState } from './logic';
import type { Feedback, Lang, Mission, MissionResult, Vec3 } from './types';

export interface WireLink {
  from: string;
  to: string;
  color: string;
}

// ---------- Settings (persisted) ----------
interface SettingsState {
  lang: Lang;
  showTerms: boolean;
  /** Rosa reads every step aloud */
  voice: boolean;
  setVoice: (v: boolean) => void;
  setLang: (l: Lang) => void;
  toggleLang: () => void;
  setShowTerms: (v: boolean) => void;
}

const storage = createJSONStorage(() => {
  try {
    return window.localStorage;
  } catch {
    return undefined as unknown as Storage;
  }
});

export const useSettings = create<SettingsState>()(
  persist(
    (set, get) => ({
      lang: 'es',
      showTerms: true,
      voice: false,
      setVoice: (voice) => set({ voice }),
      setLang: (lang) => set({ lang }),
      toggleLang: () => set({ lang: get().lang === 'es' ? 'en' : 'es' }),
      setShowTerms: (showTerms) => set({ showTerms }),
    }),
    { name: 'esu-settings', storage },
  ),
);

// ---------- Progress (persisted) ----------
export interface MissionProgress {
  completed: boolean;
  best: number;
  stars: number;
  attempts: number;
}

interface ProgressState {
  missions: Record<string, MissionProgress>;
  record: (r: MissionResult) => void;
  reset: () => void;
}

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      missions: {},
      record: (r) => {
        const prev = get().missions[r.missionId] ?? { completed: false, best: 0, stars: 0, attempts: 0 };
        set({
          missions: {
            ...get().missions,
            [r.missionId]: {
              completed: prev.completed || !r.failed,
              best: Math.max(prev.best, r.scores.total),
              stars: Math.max(prev.stars, r.scores.stars),
              attempts: prev.attempts + 1,
            },
          },
        });
      },
      reset: () => set({ missions: {} }),
    }),
    { name: 'esu-progress', storage },
  ),
);

// ---------- Mission runtime ----------
export type RunStatus = 'idle' | 'playing' | 'failed' | 'done';

interface RuntimeState {
  mission: Mission | null;
  stepIndex: number;
  step: StepState;
  flags: string[];
  hidden: Record<string, boolean>;
  identified: string[];
  /** props moved by drag-connect style "move": new world position */
  moved: Record<string, Vec3>;
  wires: WireLink[];
  mistakes: number;
  hints: number;
  hintActive: boolean;
  startedAt: number;
  status: RunStatus;
  failKey?: string;
  feedback: Feedback | null;
  result: MissionResult | null;
  /** source prop currently being dragged (drag-connect) */
  dragging: string | null;
  start: (m: Mission) => void;
  dispatch: (a: Action) => void;
  next: () => void;
  useHint: () => void;
  setDragging: (id: string | null) => void;
  selectSource: (id: string | null) => void;
  setHoldValue: (v: number) => void;
  clearFeedback: () => void;
  exit: () => void;
}

let feedbackN = 0;
const fb = (kind: Feedback['kind'], key: string): Feedback => ({ kind, key, n: ++feedbackN });

export const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

export const useMission = create<RuntimeState>()((set, get) => {
  const enterStep = (index: number) => {
    const { mission, hidden, flags } = get();
    if (!mission) return;
    const step = mission.steps[index];
    const nextHidden = { ...hidden };
    for (const id of step.show ?? []) nextHidden[id] = false;
    for (const id of step.hide ?? []) nextHidden[id] = true;
    const st = emptyStepState();
    st.done = step.type === 'dialogue';
    set({ stepIndex: index, step: st, hidden: nextHidden, hintActive: false, feedback: null, dragging: null });
    const fail = checkRequirements(step, flags);
    if (fail) finish(true, fail);
  };

  const finish = (failed: boolean, failKey?: string) => {
    const { mission, startedAt, mistakes, hints } = get();
    if (!mission) return;
    const elapsed = (now() - startedAt) / 1000;
    const scores = computeScores(elapsed, mission.parSeconds, mistakes, hints, failed);
    const result: MissionResult = {
      missionId: mission.id,
      failed,
      failKey,
      scores,
      mood: bossMood(scores, failed),
      mistakes,
      hints,
    };
    useProgress.getState().record(result);
    set({ status: failed ? 'failed' : 'done', failKey, result, dragging: null });
  };

  return {
    mission: null,
    stepIndex: 0,
    step: emptyStepState(),
    flags: [],
    hidden: {},
    identified: [],
    moved: {},
    wires: [],
    mistakes: 0,
    hints: 0,
    hintActive: false,
    startedAt: 0,
    status: 'idle',
    feedback: null,
    result: null,
    dragging: null,

    start: (mission) => {
      const hidden: Record<string, boolean> = {};
      for (const p of mission.props) if (p.hidden) hidden[p.id] = true;
      set({
        mission,
        flags: [],
        hidden,
        identified: [],
        moved: {},
        wires: [],
        mistakes: 0,
        hints: 0,
        startedAt: now(),
        status: 'playing',
        failKey: undefined,
        result: null,
      });
      enterStep(0);
    },

    dispatch: (action) => {
      const { mission, stepIndex, step: st, status } = get();
      if (!mission || status !== 'playing') return;
      const step = mission.steps[stepIndex];
      const out = applyAction(step, st, action);
      if (out.fail) {
        set({ step: out.state });
        finish(true, out.fail);
        return;
      }
      const patch: Partial<RuntimeState> = { step: out.state };
      if (out.mistakes.length) {
        patch.mistakes = get().mistakes + out.mistakes.length;
        patch.feedback = fb('bad', out.mistakes[0]);
      }
      if (step.type === 'click' && action.type === 'click' && out.state.clicked.length > st.clicked.length) {
        patch.identified = [...get().identified, action.id];
        if (step.hideOnClick) patch.hidden = { ...get().hidden, [action.id]: true };
        if (!out.completed && !out.mistakes.length) patch.feedback = fb('good', 'ui.feedback.good');
      }
      if (step.type === 'drag-connect' && action.type === 'connect' && out.state.connections[action.src] === action.tgt && st.connections[action.src] !== action.tgt) {
        const src = mission.props.find((p) => p.id === action.src);
        const tgt = mission.props.find((p) => p.id === action.tgt);
        if (step.style === 'move' && tgt) {
          const dropY = Number(tgt.params?.dropY ?? 0.05);
          const spread = Number(tgt.params?.spread ?? 0.3);
          const k = Object.entries(out.state.connections).filter(([, t]) => t === action.tgt).length - 1;
          const pos: Vec3 = [tgt.pos[0] + [0, -1, 1][k % 3] * spread, tgt.pos[1] + dropY, tgt.pos[2] + Math.floor(k / 3) * spread];
          patch.moved = { ...get().moved, [action.src]: pos };
        } else {
          patch.wires = [...get().wires, { from: action.src, to: action.tgt, color: String(src?.params?.color ?? '#d4a017') }];
        }
        if (!out.completed) patch.feedback = fb('good', 'ui.feedback.good');
      }
      if (out.completed) {
        patch.feedback = fb('good', out.info ?? step.success ?? 'ui.feedback.done');
        patch.hintActive = false;
        if (step.flags?.length) patch.flags = Array.from(new Set([...get().flags, ...step.flags]));
      } else if (out.info) patch.feedback = fb('info', out.info);
      set(patch);
    },

    next: () => {
      const { mission, stepIndex, step, status } = get();
      if (!mission || status !== 'playing' || !step.done) return;
      const s = mission.steps[stepIndex];
      if (s.type === 'dialogue' && s.flags?.length) set({ flags: Array.from(new Set([...get().flags, ...s.flags])) });
      if (stepIndex + 1 >= mission.steps.length) finish(false);
      else enterStep(stepIndex + 1);
    },

    useHint: () => {
      const { hintActive, step, status } = get();
      if (hintActive || step.done || status !== 'playing') return;
      set({ hintActive: true, hints: get().hints + 1 });
    },

    setDragging: (dragging) => set({ dragging }),
    selectSource: (id) => set({ step: { ...get().step, selectedSource: id } }),
    setHoldValue: (v) => set({ step: { ...get().step, holdValue: v } }),
    clearFeedback: () => set({ feedback: null }),
    exit: () => set({ mission: null, status: 'idle', result: null, feedback: null, dragging: null }),
  };
});
