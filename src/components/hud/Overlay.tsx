import { useT } from '../../engine/i18n';
import { RichText } from '../../engine/richText';
import { useMission } from '../../engine/store';
import { useUi } from '../../engine/ui';
import type { InspectStep, Speaker } from '../../engine/types';
import { trackAnchor } from '../../three/Projector';

function CharTags() {
  const chars = useMission((s) => s.mission?.characters);
  const speaker = useMission((s) => (s.status === 'playing' ? s.mission?.steps[s.stepIndex]?.speaker : null));
  const t = useT();
  if (!chars) return null;
  return (
    <>
      {(Object.keys(chars) as Speaker[]).map((who) => (
        <div key={who} ref={trackAnchor} data-char={who} className={`anchor char-tag ${who} ${speaker === who ? 'speaking' : ''}`}>
          {speaker === who ? '💬 ' : ''}
          {t(`ui.char.${who}.name`)}
        </div>
      ))}
    </>
  );
}

function PropLabels() {
  const mission = useMission((s) => s.mission);
  const identified = useMission((s) => s.identified);
  const hidden = useMission((s) => s.hidden);
  const t = useT();
  if (!mission) return null;
  return (
    <>
      {identified.map((id) => {
        const p = mission.props.find((x) => x.id === id);
        if (!p?.label || hidden[id]) return null;
        return (
          <div key={id} ref={trackAnchor} data-prop={id} data-label={id} className="anchor prop-label">
            <RichText text={t(p.label)} interactive={false} short /> <span className="prop-label-3d">🔍</span>
          </div>
        );
      })}
    </>
  );
}

function Hotspots() {
  const mission = useMission((s) => s.mission);
  const step = useMission((s) => {
    const st = s.mission?.steps[s.stepIndex];
    return st?.type === 'inspect' ? (st as InspectStep) : null;
  });
  const inspected = useMission((s) => s.step.inspected);
  const done = useMission((s) => s.step.done);
  const hint = useMission((s) => s.hintActive);
  const dispatch = useMission((s) => s.dispatch);
  const setFocus = useUi((s) => s.setInspectFocus);
  const t = useT();
  if (!step || !mission) return null;
  const target = mission.props.find((p) => p.id === step.target);
  if (!target) return null;
  return (
    <>
      {step.points.map((p, i) => {
        const on = inspected.includes(p.id);
        const world = [target.pos[0] + p.pos[0], target.pos[1] + p.pos[1], target.pos[2] + p.pos[2]].join(',');
        const showHint = hint && (step.mode === 'learn' ? !on : !!p.defect && !on);
        return (
          <button
            key={`${step.id}:${p.id}`}
            ref={trackAnchor}
            data-world={world}
            type="button"
            className={`anchor hotspot ${step.mode} ${on ? 'on' : ''} ${showHint ? 'hint' : ''}`}
            data-hotspot={p.id}
            disabled={done}
            title={t(p.label)}
            onClick={() => {
              dispatch({ type: 'inspect', id: p.id });
              setFocus(p.id);
            }}
          >
            {step.mode === 'find' ? (on ? '!' : i + 1) : on ? '✓' : i + 1}
          </button>
        );
      })}
    </>
  );
}

/** DOM layer over the canvas; positions are written every frame by <Projector/>. */
export function Overlay() {
  return (
    <div className="overlay-layer" aria-live="off">
      <CharTags />
      <PropLabels />
      <Hotspots />
    </div>
  );
}
