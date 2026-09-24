import { useT } from '../../engine/i18n';
import { meterReading } from '../../engine/logic';
import { useMission } from '../../engine/store';
import type { MeasureStep, MeterMode } from '../../engine/types';

const MODES: { mode: MeterMode; sym: string }[] = [
  { mode: 'VAC', sym: 'V~' },
  { mode: 'VDC', sym: 'V⎓' },
  { mode: 'OHM', sym: 'Ω' },
  { mode: 'CONT', sym: '•)))' },
];

const UNIT: Record<MeterMode, string> = { VAC: 'V AC', VDC: 'V DC', OHM: 'Ω', CONT: 'Ω' };

export function Multimeter({ step }: { step: MeasureStep }) {
  const t = useT();
  const st = useMission((s) => s.step);
  const mission = useMission((s) => s.mission);
  const dispatch = useMission((s) => s.dispatch);
  const hint = useMission((s) => s.hintActive);
  const { red, black } = st.probes;
  const reading = meterReading(step, st.meterMode, red, black);
  const beep = st.meterMode === 'CONT' && reading !== 'OL' && reading !== '' && parseFloat(reading) < 30;
  const name = (id: string | null) => {
    if (!id) return '—';
    const p = mission?.props.find((x) => x.id === id);
    return p?.label ? t(p.label).replace(/\[\[[^|\]]+\|?([^\]]*)\]\]/g, '$1') : id;
  };
  return (
    <div className="meter" data-testid="multimeter">
      <div className="meter-body">
        <div className={`meter-display ${beep ? 'beep' : ''}`} data-testid="meter-display">
          <span className="meter-value">{st.meterMode ? reading : '- - -'}</span>
          <span className="meter-unit">{st.meterMode ? UNIT[st.meterMode] : ''}</span>
          {beep ? <span className="meter-beep">🔊 beep</span> : null}
        </div>
        <div className="meter-dial" role="radiogroup" aria-label={t('ui.meter.dial')}>
          {MODES.map((m) => (
            <button
              key={m.mode}
              type="button"
              role="radio"
              aria-checked={st.meterMode === m.mode}
              data-mode={m.mode}
              className={`dial-btn ${st.meterMode === m.mode ? 'on' : ''} ${hint && step.expect.mode === m.mode ? 'hint' : ''}`}
              onClick={() => dispatch({ type: 'meterMode', mode: m.mode })}
              disabled={st.done}
            >
              <span className="dial-sym">{m.sym}</span>
              <span className="dial-name">{t(`ui.meter.mode.${m.mode}`)}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="meter-probes">
        <span className="probe red">● {t('ui.meter.red')}: {name(red)}</span>
        <span className="probe black">● {t('ui.meter.black')}: {name(black)}</span>
      </div>
      <p className="meter-tip">{t('ui.meter.tip')}</p>
      {!st.done ? (
        <button type="button" className="btn primary" data-testid="meter-confirm" disabled={!red || !black || !st.meterMode} onClick={() => dispatch({ type: 'confirmMeasure' })}>
          {t('ui.meter.confirm')}
        </button>
      ) : null}
    </div>
  );
}
