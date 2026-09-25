import { describe, expect, it } from 'vitest';
import { applyAction, bossMood, computeScores, emptyStepState, meterReading, termIds } from '../src/engine/logic';
import type { ChooseOptionStep, ClickStep, DragConnectStep, HoldStep, InspectStep, MeasureStep } from '../src/engine/types';

const base = { speaker: 'instructor' as const, text: 'x' };

describe('click', () => {
  const step: ClickStep = { ...base, id: 'c', type: 'click', targets: ['a', 'b'], ordered: true, wrong: { d: 'wrongD' }, unsafe: { u: 'boom' }, earlyUnsafe: { b: 'early' } };
  it('completes in order', () => {
    let s = applyAction(step, emptyStepState(), { type: 'click', id: 'a' });
    expect(s.completed).toBe(false);
    s = applyAction(step, s.state, { type: 'click', id: 'b' });
    expect(s.completed).toBe(true);
  });
  it('wrong prop is a mistake with its feedback', () => {
    expect(applyAction(step, emptyStepState(), { type: 'click', id: 'd' }).mistakes).toEqual(['wrongD']);
  });
  it('unsafe prop and early click fail safety', () => {
    expect(applyAction(step, emptyStepState(), { type: 'click', id: 'u' }).fail).toBe('boom');
    expect(applyAction(step, emptyStepState(), { type: 'click', id: 'b' }).fail).toBe('early');
  });
});

describe('drag-connect', () => {
  const step: DragConnectStep = { ...base, id: 'd', type: 'drag-connect', pairs: { w14: 'b15', w12: 'b20' }, wrong: { 'w14>b20': 'tooBig' }, unsafe: { 'w12>b15': 'nope' } };
  it('connects pairs and completes', () => {
    let o = applyAction(step, emptyStepState(), { type: 'connect', src: 'w14', tgt: 'b15' });
    expect(o.completed).toBe(false);
    o = applyAction(step, o.state, { type: 'connect', src: 'w12', tgt: 'b20' });
    expect(o.completed).toBe(true);
  });
  it('wrong pair = mistake, unsafe pair = fail', () => {
    expect(applyAction(step, emptyStepState(), { type: 'connect', src: 'w14', tgt: 'b20' }).mistakes).toEqual(['tooBig']);
    expect(applyAction(step, emptyStepState(), { type: 'connect', src: 'w12', tgt: 'b15' }).fail).toBe('nope');
  });
});

describe('choose-option', () => {
  const step: ChooseOptionStep = { ...base, id: 'o', type: 'choose-option', options: [{ text: 'a', feedback: 'fa' }, { text: 'b', correct: true }, { text: 'c', unsafe: 'dead' }] };
  it('wrong option disables itself, correct completes, unsafe fails', () => {
    const w = applyAction(step, emptyStepState(), { type: 'option', index: 0 });
    expect(w.mistakes).toEqual(['fa']);
    expect(applyAction(step, w.state, { type: 'option', index: 0 }).mistakes).toEqual([]);
    expect(applyAction(step, w.state, { type: 'option', index: 1 }).completed).toBe(true);
    expect(applyAction(step, emptyStepState(), { type: 'option', index: 2 }).fail).toBe('dead');
  });
});

describe('measure', () => {
  const step: MeasureStep = {
    ...base,
    id: 'm',
    type: 'measure',
    points: ['a', 'b', 'c'],
    expect: { mode: 'CONT', pair: ['a', 'b'] },
    readings: [{ mode: 'CONT', pair: ['b', 'a'], value: '0.2' }],
  };
  it('reads values order-insensitively and defaults to OL / 0.0', () => {
    expect(meterReading(step, 'CONT', 'a', 'b')).toBe('0.2');
    expect(meterReading(step, 'CONT', 'a', 'c')).toBe('OL');
    expect(meterReading(step, 'VAC', 'a', 'b')).toBe('0.0');
    expect(meterReading(step, null, 'a', 'b')).toBe('');
  });
  it('probes cycle red → black → reset and confirm checks mode + points', () => {
    let s = emptyStepState();
    s = applyAction(step, s, { type: 'probe', id: 'a' }).state;
    s = applyAction(step, s, { type: 'probe', id: 'c' }).state;
    expect(s.probes).toEqual({ red: 'a', black: 'c' });
    s = applyAction(step, s, { type: 'meterMode', mode: 'VAC' }).state;
    expect(applyAction(step, s, { type: 'confirmMeasure' }).mistakes).toEqual(['ui.meter.wrongMode']);
    s = applyAction(step, s, { type: 'meterMode', mode: 'CONT' }).state;
    expect(applyAction(step, s, { type: 'confirmMeasure' }).mistakes).toEqual(['ui.meter.wrongPoints']);
    s = applyAction(step, s, { type: 'probe', id: 'b' }).state; // third probe resets: red=b
    expect(s.probes).toEqual({ red: 'b', black: null });
    s = applyAction(step, s, { type: 'probe', id: 'a' }).state;
    expect(applyAction(step, s, { type: 'confirmMeasure' }).completed).toBe(true);
  });
});

describe('hold-action', () => {
  const step: HoldStep = { ...base, id: 'h', type: 'hold-action', action: 'strip', max: 1.5, unit: 'in', zone: [0.625, 0.875], durationMs: 3000, tooLow: 'low', tooHigh: 'high' };
  it('zone check', () => {
    expect(applyAction(step, emptyStepState(), { type: 'holdEnd', value: 0.3 }).mistakes).toEqual(['low']);
    expect(applyAction(step, emptyStepState(), { type: 'holdEnd', value: 1.2 }).mistakes).toEqual(['high']);
    expect(applyAction(step, emptyStepState(), { type: 'holdEnd', value: 0.75 }).completed).toBe(true);
  });
});

describe('inspect', () => {
  const step: InspectStep = {
    ...base,
    id: 'i',
    type: 'inspect',
    target: 't',
    mode: 'find',
    points: [
      { id: 'p1', pos: [0, 0, 0], label: 'l', info: 'i', defect: true },
      { id: 'p2', pos: [0, 0, 0], label: 'l', info: 'i' },
    ],
  };
  it('find mode: toggle marks, false positives and misses are mistakes', () => {
    let s = applyAction(step, emptyStepState(), { type: 'inspect', id: 'p2' }).state;
    const fp = applyAction(step, s, { type: 'report' });
    expect(fp.mistakes).toEqual(['ui.inspect.falsePositive']);
    expect(fp.state.inspected).toEqual([]);
    expect(applyAction(step, fp.state, { type: 'report' }).mistakes).toEqual(['ui.inspect.missed']);
    s = applyAction(step, fp.state, { type: 'inspect', id: 'p1' }).state;
    expect(applyAction(step, s, { type: 'inspect', id: 'p1' }).state.inspected).toEqual([]);
    expect(applyAction(step, s, { type: 'report' }).completed).toBe(true);
  });
});

describe('scoring', () => {
  it('perfect fast run = 100 and 3 stars', () => {
    const s = computeScores(50, 100, 0, 0, false);
    expect(s).toMatchObject({ safety: 100, correctness: 100, speed: 100, total: 100, stars: 3 });
    expect(bossMood(s, false)).toBe('great');
  });
  it('mistakes, hints and slowness reduce the score', () => {
    const s = computeScores(200, 100, 2, 1, false);
    expect(s.correctness).toBe(65);
    expect(s.speed).toBe(50);
    expect(bossMood(s, false)).toBe('slow');
    expect(bossMood(computeScores(10, 100, 4, 0, false), false)).toBe('sloppy');
  });
  it('safety fail = 0 and fail mood', () => {
    const s = computeScores(10, 100, 0, 0, true);
    expect(s.total).toBe(0);
    expect(s.stars).toBe(0);
    expect(bossMood(s, true)).toBe('fail');
  });
});

describe('markup', () => {
  it('extracts term ids', () => {
    expect(termIds('Use [[breaker]] and [[awg|calibre]] and [[breaker]]')).toEqual(['breaker', 'awg']);
  });
});
