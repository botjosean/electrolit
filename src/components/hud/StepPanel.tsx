import { useEffect, useRef, useState } from 'react';
import { getPhrase } from '../../engine/glossary';
import { useT } from '../../engine/i18n';
import { dragSources, termIds } from '../../engine/logic';
import { RichText } from '../../engine/richText';
import { speakEnglish } from '../../engine/speech';
import { useMission, useSettings } from '../../engine/store';
import { useUi } from '../../engine/ui';
import type { ChooseOptionStep, InspectStep, Speaker, Step } from '../../engine/types';
import { HoldGauge } from './HoldGauge';
import { Multimeter } from './Multimeter';
import { TermLine } from './TermCard';

export function Avatar({ who, small }: { who: Speaker; small?: boolean }) {
  return (
    <div className={`avatar ${who} ${small ? 'small' : ''}`} aria-hidden>
      <span className="avatar-hat" />
      <span className="avatar-face">{who === 'foreman' ? '👷‍♂️' : '👷‍♀️'}</span>
    </div>
  );
}

export function OrderBox({ id }: { id: string }) {
  const phrase = getPhrase(id);
  const lang = useSettings((s) => s.lang);
  const t = useT();
  if (!phrase) return null;
  return (
    <div className="order" data-order={id}>
      <div className="order-en">
        <span className="order-quote">“{phrase.en}”</span>
        <button type="button" className="icon-btn" onClick={() => speakEnglish(phrase.en)} aria-label={t('ui.term.listen')}>
          🔊
        </button>
      </div>
      {lang === 'es' ? <div className="order-es">→ {phrase.es}</div> : null}
    </div>
  );
}

function Options({ step }: { step: ChooseOptionStep }) {
  const st = useMission((s) => s.step);
  const hint = useMission((s) => s.hintActive);
  const dispatch = useMission((s) => s.dispatch);
  const t = useT();
  return (
    <div className="options">
      {step.options.map((o, i) => {
        const wrong = st.wrongOptions.includes(i);
        const chosen = st.chosen === i;
        return (
          <button
            key={i}
            type="button"
            data-option={i}
            className={`option ${wrong ? 'wrong' : ''} ${chosen ? 'correct' : ''} ${hint && o.correct && !st.done ? 'hint' : ''}`}
            disabled={wrong || st.done}
            onClick={() => dispatch({ type: 'option', index: i })}
          >
            <span className="option-letter">{String.fromCharCode(65 + i)}</span>
            <span className="option-text">
              <RichText text={t(o.text)} interactive={false} />
            </span>
          </button>
        );
      })}
    </div>
  );
}

function InspectInfo({ step }: { step: InspectStep }) {
  const focus = useUi((s) => s.inspectFocus);
  const st = useMission((s) => s.step);
  const dispatch = useMission((s) => s.dispatch);
  const t = useT();
  const pt = step.points.find((p) => p.id === focus);
  const defects = step.points.filter((p) => p.defect);
  return (
    <div className="inspect">
      {step.mode === 'learn' ? (
        <div className="progress-line">
          {t('ui.inspect.progress', { n: st.inspected.length, total: step.points.length })}
        </div>
      ) : (
        <div className="progress-line">{t('ui.inspect.findTip', { n: st.inspected.length })}</div>
      )}
      {pt && step.mode === 'learn' ? (
        <div className="inspect-card" data-testid="inspect-card">
          <strong>
            <RichText text={t(pt.label)} />
          </strong>
          <p>
            <RichText text={t(pt.info)} />
          </p>
        </div>
      ) : null}
      {pt && step.mode === 'find' && !st.done ? (
        <div className="inspect-card">
          <strong>
            <RichText text={t(pt.label)} />
          </strong>{' '}
          — {st.inspected.includes(pt.id) ? t('ui.inspect.marked') : t('ui.inspect.unmarked')}
        </div>
      ) : null}
      {step.mode === 'find' && st.done ? (
        <div className="inspect-card">
          {defects.map((d) => (
            <p key={d.id}>
              <strong>
                <RichText text={t(d.label)} />
              </strong>
              : <RichText text={t(d.info)} />
            </p>
          ))}
        </div>
      ) : null}
      {step.mode === 'find' && !st.done ? (
        <button type="button" className="btn primary" data-testid="inspect-report" onClick={() => dispatch({ type: 'report' })}>
          {t('ui.inspect.report')}
        </button>
      ) : null}
    </div>
  );
}

function StepControls({ step }: { step: Step }) {
  const st = useMission((s) => s.step);
  const mission = useMission((s) => s.mission);
  const t = useT();
  switch (step.type) {
    case 'click':
      return step.targets.length > 1 ? (
        <div className="progress-line">{t('ui.click.progress', { n: st.clicked.length, total: step.targets.length })}</div>
      ) : null;
    case 'drag-connect': {
      const total = dragSources(step).length;
      const n = Object.keys(step.pairs).filter((k) => st.connections[k] === step.pairs[k]).length;
      const sel = st.selectedSource ? mission?.props.find((p) => p.id === st.selectedSource) : null;
      return (
        <div>
          <div className="progress-line">{t('ui.drag.progress', { n, total })}</div>
          <div className="tip">{sel?.label ? <>👉 <RichText text={t(sel.label)} /> — {t('ui.drag.nowTarget')}</> : t('ui.drag.tip')}</div>
        </div>
      );
    }
    case 'choose-option':
      return <Options step={step} />;
    case 'measure':
      return <Multimeter step={step} />;
    case 'hold-action':
      return <HoldGauge step={step} />;
    case 'inspect':
      return <InspectInfo step={step} />;
    default:
      return null;
  }
}

export function Feedback() {
  const feedback = useMission((s) => s.feedback);
  const t = useT();
  if (!feedback) return null;
  return (
    <div key={feedback.n} className={`feedback ${feedback.kind}`} role="status" data-testid="feedback" data-kind={feedback.kind}>
      <span className="feedback-icon">{feedback.kind === 'bad' ? '✗' : feedback.kind === 'good' ? '✓' : 'ℹ'}</span>
      <span>
        <RichText text={t(feedback.key)} />
      </span>
    </div>
  );
}

export function StepPanel() {
  const mission = useMission((s) => s.mission);
  const stepIndex = useMission((s) => s.stepIndex);
  const done = useMission((s) => s.step.done);
  const next = useMission((s) => s.next);
  const showTerms = useSettings((s) => s.showTerms);
  const setShowTerms = useSettings((s) => s.setShowTerms);
  const setFocus = useUi((s) => s.setInspectFocus);
  const [collapsed, setCollapsed] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const t = useT();

  useEffect(() => {
    setCollapsed(false);
    setFocus(null);
  }, [stepIndex, setFocus]);

  // report the area the panel covers so the 3D view can recenter in the free space.
  // Measured on step change / resize only, so feedback messages don't make the scene jump.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      const W = window.innerWidth;
      const H = window.innerHeight;
      const side = r.width < W * 0.7 && r.left > W * 0.3;
      useUi.getState().setPanelInset(side ? { right: W - r.left, bottom: 0 } : { right: 0, bottom: Math.round(Math.min(H * 0.6, H - r.top) / 40) * 40 });
    };
    const raf = requestAnimationFrame(measure);
    window.addEventListener('resize', measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', measure);
    };
  }, [stepIndex]);

  useEffect(() => () => useUi.getState().setPanelInset({ right: 0, bottom: 0 }), []);

  if (!mission) return null;
  const step = mission.steps[stepIndex];
  const text = t(step.text);
  const terms = termIds(text);
  const isLast = stepIndex === mission.steps.length - 1;

  return (
    <section ref={ref} className={`panel ${collapsed ? 'collapsed' : ''} type-${step.type}`} data-testid="step-panel" data-step={step.id} data-step-type={step.type}>
      <div className="panel-head">
        <Avatar who={step.speaker} />
        <div className="panel-who">
          <div className="panel-name">{t(`ui.char.${step.speaker}.name`)}</div>
          <div className="panel-role">{t(`ui.char.${step.speaker}.role`)}</div>
        </div>
        <button type="button" className="icon-btn" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? t('ui.expand') : t('ui.collapse')}>
          {collapsed ? '▴' : '▾'}
        </button>
      </div>
      <div className="panel-body">
        {step.order ? <OrderBox id={step.order} /> : null}
        <div className="bubble">
          <RichText text={text} />
        </div>
        {terms.length ? (
          <div className="terms">
            <button type="button" className="terms-toggle" onClick={() => setShowTerms(!showTerms)}>
              📘 {t('ui.terms')} ({terms.length}) {showTerms ? '▾' : '▸'}
            </button>
            {showTerms ? terms.map((id) => <TermLine key={id} id={id} />) : null}
          </div>
        ) : null}
        <Feedback />
        <StepControls step={step} />
        {done ? (
          <button type="button" className="btn primary continue" data-testid="continue" onClick={next}>
            {isLast ? t('ui.finish') : t('ui.continue')} →
          </button>
        ) : null}
      </div>
    </section>
  );
}
