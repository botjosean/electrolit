// window.__sim: tiny hook used by the e2e playthrough (scripts/e2e.mjs). Harmless in production.
import { missions } from './content';
import { useMission, useProgress, useSettings } from './store';

export function installDebugHook() {
  window.__sim = {
    ...(window.__sim ?? {}),
    missions,
    state: () => {
      const s = useMission.getState();
      return {
        missionId: s.mission?.id,
        stepIndex: s.stepIndex,
        step: s.step,
        status: s.status,
        mistakes: s.mistakes,
        hints: s.hints,
        feedback: s.feedback,
        result: s.result,
        dragging: s.dragging,
        flags: s.flags,
      };
    },
    progress: () => useProgress.getState().missions,
    setLang: (l: 'es' | 'en') => useSettings.getState().setLang(l),
  };
}
