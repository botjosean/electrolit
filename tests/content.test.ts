import { describe, expect, it } from 'vitest';
import { missions, modules } from '../src/engine/content';
import { getPhrase, getTerm, glossary, phrases } from '../src/engine/glossary';
import { allKeys, lookup } from '../src/engine/i18n';
import { applyAction, emptyStepState, missionKeys, termIds, type Action, type StepState } from '../src/engine/logic';
import type { Mission, Step } from '../src/engine/types';
import { propRegistry } from '../src/three/props';
import { getVideoTopic, videoTopics } from '../src/engine/videos';

const langs = ['es', 'en'] as const;
const moods = { great: 3, ok: 3, slow: 2, sloppy: 2, fail: 3 };

function propRefs(step: Step): string[] {
  const r = [...(step.show ?? []), ...(step.hide ?? [])];
  switch (step.type) {
    case 'click':
      r.push(...step.targets, ...Object.keys(step.wrong ?? {}), ...Object.keys(step.unsafe ?? {}), ...Object.keys(step.earlyUnsafe ?? {}), ...(step.decoys ?? []));
      break;
    case 'drag-connect':
      r.push(...Object.keys(step.pairs), ...Object.values(step.pairs), ...(step.decoyTargets ?? []));
      for (const k of [...Object.keys(step.wrong ?? {}), ...Object.keys(step.unsafe ?? {})]) r.push(...k.split('>'));
      break;
    case 'measure':
      r.push(...step.points, ...step.expect.pair);
      for (const x of step.readings) r.push(...x.pair);
      break;
    case 'hold-action':
      if (step.target) r.push(step.target);
      break;
    case 'inspect':
      r.push(step.target);
      break;
  }
  return r;
}

/** The correct sequence of actions for a step. */
export function solution(step: Step): Action[] {
  switch (step.type) {
    case 'dialogue':
      return [];
    case 'click':
      return step.targets.map((id) => ({ type: 'click', id }));
    case 'drag-connect':
      return Object.entries(step.pairs).map(([src, tgt]) => ({ type: 'connect', src, tgt }));
    case 'choose-option':
      return [{ type: 'option', index: step.options.findIndex((o) => o.correct) }];
    case 'measure':
      return [
        { type: 'meterMode', mode: step.expect.mode },
        { type: 'probe', id: step.expect.pair[0] },
        { type: 'probe', id: step.expect.pair[1] },
        { type: 'confirmMeasure' },
      ];
    case 'hold-action':
      return [{ type: 'holdEnd', value: (step.zone[0] + step.zone[1]) / 2 }];
    case 'inspect':
      return step.mode === 'learn'
        ? step.points.map((p) => ({ type: 'inspect', id: p.id }))
        : [...step.points.filter((p) => p.defect).map((p) => ({ type: 'inspect', id: p.id }) as Action), { type: 'report' }];
  }
}

describe('modules', () => {
  it('lists all 11 modules in order with i18n', () => {
    expect(modules.map((m) => m.number)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    for (const m of modules) for (const l of langs) {
      expect(lookup(l, m.title), `${l} ${m.title}`).toBeTruthy();
      expect(lookup(l, m.desc), `${l} ${m.desc}`).toBeTruthy();
    }
  });
  it('available modules reference existing missions of that module', () => {
    for (const m of modules.filter((x) => x.available)) {
      expect(m.missions.length).toBeGreaterThan(0);
      for (const id of m.missions) {
        expect(missions[id], id).toBeTruthy();
        expect(missions[id].module).toBe(m.id);
      }
    }
  });
  it('every mission file belongs to a module list', () => {
    const listed = new Set(modules.flatMap((m) => m.missions));
    for (const id of Object.keys(missions)) expect(listed.has(id), id).toBe(true);
  });
});

describe('i18n', () => {
  it('es and en have exactly the same keys', () => {
    const es = new Set(allKeys('es'));
    const en = new Set(allKeys('en'));
    expect([...es].filter((k) => !en.has(k))).toEqual([]);
    expect([...en].filter((k) => !es.has(k))).toEqual([]);
  });
  it('every [[term]] in every text exists in the glossary', () => {
    for (const l of langs) for (const k of allKeys(l)) for (const id of termIds(lookup(l, k)!)) expect(getTerm(id), `${l}:${k} → [[${id}]]`).toBeTruthy();
  });
  it('boss phrases exist for every mood variant', () => {
    for (const [mood, n] of Object.entries(moods)) for (let i = 1; i <= n; i++) expect(getPhrase(`boss_${mood}_${i}`), `boss_${mood}_${i}`).toBeTruthy();
  });
});

describe('videos', () => {
  it('topics have unique ids and both queries', () => {
    expect(new Set(videoTopics.map((v) => v.id)).size).toBe(videoTopics.length);
    for (const v of videoTopics) {
      expect(v.en.length, v.id).toBeGreaterThan(8);
      expect(v.es.length, v.id).toBeGreaterThan(8);
    }
  });
});

describe('glossary', () => {
  it('entries are complete and unique', () => {
    const ids = new Set<string>();
    for (const g of glossary) {
      expect(ids.has(g.id), g.id).toBe(false);
      ids.add(g.id);
      for (const f of ['term', 'es', 'explanation_es', 'explanation_en'] as const) expect(g[f], `${g.id}.${f}`).toBeTruthy();
      expect(g.explanation_es.length, `${g.id} explanation too long`).toBeLessThan(170);
    }
    for (const g of glossary) if (g.model) expect(propRegistry[g.model.kind], `${g.id} model ${g.model.kind}`).toBeTruthy();
    expect(glossary.filter((g) => g.model).length).toBeGreaterThan(20);
    const pids = new Set(phrases.map((p) => p.id));
    expect(pids.size).toBe(phrases.length);
  });
});

describe.each(Object.values(missions).map((m) => [m.id, m] as [string, Mission]))('mission %s', (_id, m) => {
  it('has all i18n keys in es and en', () => {
    for (const k of missionKeys(m)) for (const l of langs) expect(lookup(l, k), `${l}: ${k}`).toBeTruthy();
  });
  it('references existing props, kinds, phrases and unique ids', () => {
    const ids = new Set(m.props.map((p) => p.id));
    expect(ids.size).toBe(m.props.length);
    for (const p of m.props) {
      expect(propRegistry[p.kind], `kind ${p.kind}`).toBeTruthy();
      if (p.params?.textKey) for (const l of langs) expect(lookup(l, String(p.params.textKey)), String(p.params.textKey)).toBeTruthy();
    }
    const stepIds = new Set(m.steps.map((s) => s.id));
    expect(stepIds.size).toBe(m.steps.length);
    for (const s of m.steps) {
      for (const r of propRefs(s)) expect(ids.has(r), `${s.id} → prop ${r}`).toBe(true);
      if (s.order) expect(getPhrase(s.order), `${s.id} order ${s.order}`).toBeTruthy();
    }
  });
  it('video topics exist (mission default + per step)', () => {
    if (m.video) expect(getVideoTopic(m.video), m.video).toBeTruthy();
    for (const s of m.steps) if (s.video) expect(getVideoTopic(s.video), `${s.id} ${s.video}`).toBeTruthy();
    expect(m.video, 'every mission links real-life videos').toBeTruthy();
  });
  it('choose-option steps have exactly one correct answer', () => {
    for (const s of m.steps) if (s.type === 'choose-option') expect(s.options.filter((o) => o.correct).length, s.id).toBe(1);
  });
  it('hold zones and measure expectations are coherent', () => {
    for (const s of m.steps) {
      if (s.type === 'hold-action') {
        expect(s.zone[0]).toBeLessThan(s.zone[1]);
        expect(s.zone[1]).toBeLessThan(s.max);
        expect(s.durationMs).toBeGreaterThan(800);
      }
      if (s.type === 'measure') for (const p of s.expect.pair) expect(s.points).toContain(p);
    }
  });
  it('every step is solvable with its correct actions and never fails safety', () => {
    let flags: string[] = [];
    for (const s of m.steps) {
      for (const r of s.requires ?? []) expect(flags, `${s.id} requires ${r.flag}`).toContain(r.flag);
      let st: StepState = emptyStepState();
      let completed = s.type === 'dialogue';
      for (const a of solution(s)) {
        const out = applyAction(s, st, a);
        expect(out.fail, `${s.id} ${JSON.stringify(a)}`).toBeUndefined();
        expect(out.mistakes, `${s.id} ${JSON.stringify(a)}`).toEqual([]);
        st = out.state;
        completed = completed || out.completed;
      }
      expect(completed, `${s.id} completes`).toBe(true);
      flags = [...flags, ...(s.flags ?? [])];
    }
  });
});
