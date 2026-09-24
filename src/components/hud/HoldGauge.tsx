import { useEffect, useRef, useState } from 'react';
import { useT } from '../../engine/i18n';
import { useMission } from '../../engine/store';
import type { HoldStep } from '../../engine/types';

const fmt = (v: number, unit: string) => {
  if (unit === 'in') {
    // show inches as nearest 1/16 fraction for realism
    const s = Math.round(v * 16);
    const whole = Math.floor(s / 16);
    let num = s % 16;
    let den = 16;
    while (num && num % 2 === 0) {
      num /= 2;
      den /= 2;
    }
    const frac = num ? `${num}/${den}` : '';
    return `${whole ? whole + (frac ? ' ' : '') : ''}${frac || (whole ? '' : '0')}"`;
  }
  return `${Math.round(v)} ${unit}`;
};

export function HoldGauge({ step }: { step: HoldStep }) {
  const t = useT();
  const done = useMission((s) => s.step.done);
  const value = useMission((s) => s.step.holdValue);
  const setHoldValue = useMission((s) => s.setHoldValue);
  const dispatch = useMission((s) => s.dispatch);
  const hint = useMission((s) => s.hintActive);
  const [holding, setHolding] = useState(false);
  const startRef = useRef(0);
  const raf = useRef(0);
  const valRef = useRef(0);

  const release = () => {
    if (!holding) return;
    setHolding(false);
    cancelAnimationFrame(raf.current);
    // value at the exact release time (not the last rendered frame → fair on slow phones)
    const v = Math.min(step.max, (step.max * (performance.now() - startRef.current)) / step.durationMs);
    valRef.current = v;
    setHoldValue(v);
    dispatch({ type: 'holdEnd', value: Math.round(v * 1000) / 1000 });
  };

  useEffect(() => {
    if (!holding) return;
    const tick = () => {
      const v = Math.min(step.max, (step.max * (performance.now() - startRef.current)) / step.durationMs);
      valRef.current = v;
      setHoldValue(v);
      if (v >= step.max) {
        release();
        return;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [holding]);

  useEffect(() => {
    const up = () => release();
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  });

  const pct = (v: number) => `${(100 * v) / step.max}%`;
  return (
    <div className="hold" data-testid="hold">
      <div className="hold-bar" aria-hidden>
        <div className={`hold-zone ${hint ? 'hint' : ''}`} style={{ left: pct(step.zone[0]), width: `calc(${pct(step.zone[1])} - ${pct(step.zone[0])})` }} />
        <div className="hold-fill" style={{ width: pct(value) }} />
      </div>
      <div className="hold-legend">
        <span>0</span>
        <span className="hold-target">
          {t('ui.hold.target')}: {fmt(step.zone[0], step.unit)} – {fmt(step.zone[1], step.unit)}
        </span>
        <span>{fmt(step.max, step.unit)}</span>
      </div>
      <div className="hold-value" data-testid="hold-value">
        {fmt(value, step.unit)}
      </div>
      {!done ? (
        <button
          type="button"
          className={`btn hold-btn ${holding ? 'active' : ''}`}
          data-testid="hold-btn"
          onPointerDown={(e) => {
            e.preventDefault();
            (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
            startRef.current = performance.now();
            valRef.current = 0;
            setHoldValue(0);
            setHolding(true);
          }}
          onContextMenu={(e) => e.preventDefault()}
        >
          {holding ? t(`ui.hold.holding.${step.action}`) : t(`ui.hold.press.${step.action}`)}
        </button>
      ) : null}
    </div>
  );
}
