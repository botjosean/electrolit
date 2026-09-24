import { useEffect, useState } from 'react';
import { useT } from '../../engine/i18n';
import { now, useMission } from '../../engine/store';
import { go } from '../router';
import { LangToggle } from '../LangToggle';

function Timer() {
  const startedAt = useMission((s) => s.startedAt);
  const status = useMission((s) => s.status);
  const [, tick] = useState(0);
  useEffect(() => {
    if (status !== 'playing') return;
    const i = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(i);
  }, [status]);
  const sec = Math.max(0, Math.floor((now() - startedAt) / 1000));
  return (
    <span className="timer" aria-label="timer">
      ⏱ {Math.floor(sec / 60)}:{String(sec % 60).padStart(2, '0')}
    </span>
  );
}

export function TopBar() {
  const mission = useMission((s) => s.mission);
  const stepIndex = useMission((s) => s.stepIndex);
  const useHint = useMission((s) => s.useHint);
  const hintActive = useMission((s) => s.hintActive);
  const done = useMission((s) => s.step.done);
  const t = useT();
  if (!mission) return null;
  const step = mission.steps[stepIndex];
  const canHint = step.type !== 'dialogue' && !done;
  return (
    <header className="topbar">
      <button type="button" className="icon-btn" onClick={() => go(`/module/${mission.module}`)} aria-label={t('ui.back')} data-testid="back">
        ←
      </button>
      <div className="topbar-title">
        <div className="topbar-mission">{t(mission.title)}</div>
        <div className="topbar-sub">
          {t('ui.step', { n: stepIndex + 1, total: mission.steps.length })} · <Timer />
        </div>
      </div>
      <button
        type="button"
        className={`icon-btn hint-btn ${hintActive ? 'on' : ''}`}
        onClick={useHint}
        disabled={!canHint || hintActive}
        title={t('ui.hint')}
        aria-label={t('ui.hint')}
        data-testid="hint"
      >
        💡
      </button>
      <LangToggle />
      <div className="step-progress" style={{ width: `${(100 * stepIndex) / mission.steps.length}%` }} />
    </header>
  );
}
