// Mission JSON schema. Missions live in /src/missions/<module>/*.json and contain only i18n keys.

export type Vec3 = [number, number, number];
export type Lang = 'es' | 'en';
export type Speaker = 'foreman' | 'instructor';
export type EnvKind = 'yard' | 'garage';
export type MeterMode = 'VAC' | 'VDC' | 'OHM' | 'CONT';

export interface CameraShot {
  pos: Vec3;
  target: Vec3;
  /** width (m) around the target that must stay visible; the camera backs off on narrow screens */
  w?: number;
}

export interface PropDef {
  id: string;
  kind: string;
  pos: Vec3;
  rot?: Vec3;
  scale?: number;
  /** i18n key: name shown after the object is identified / on inspect */
  label?: string;
  params?: Record<string, string | number | boolean>;
  /** hidden until a step with `show` includes it */
  hidden?: boolean;
}

export interface Placement {
  pos: Vec3;
  rot?: number;
}

export interface Requirement {
  flag: string;
  /** i18n key of the safety failure explanation */
  fail: string;
}

interface BaseStep {
  id: string;
  speaker: Speaker;
  /** i18n key */
  text: string;
  /** phrase id (glossary/phrases.json): shown as English + translation */
  order?: string;
  camera?: CameraShot;
  /** i18n key shown as positive feedback when the step is completed */
  success?: string;
  /** flags set when the step completes */
  flags?: string[];
  /** flags that must be set before this step is attempted (else safety fail) */
  requires?: Requirement[];
  /** video topic id (glossary/videos.json) for the "see it in real life" link */
  video?: string;
  /** props revealed / hidden when the step starts */
  show?: string[];
  hide?: string[];
}

export interface DialogueStep extends BaseStep {
  type: 'dialogue';
}

export interface ClickStep extends BaseStep {
  type: 'click';
  targets: string[];
  ordered?: boolean;
  hideOnClick?: boolean;
  wrong?: Record<string, string>;
  unsafe?: Record<string, string>;
  earlyUnsafe?: Record<string, string>;
  /** additional clickable decoys (no feedback other than generic "wrong") */
  decoys?: string[];
}

export interface DragConnectStep extends BaseStep {
  type: 'drag-connect';
  /** sourcePropId -> targetPropId */
  pairs: Record<string, string>;
  /** extra drop targets that are never correct */
  decoyTargets?: string[];
  /** "src>tgt" -> i18n key */
  wrong?: Record<string, string>;
  unsafe?: Record<string, string>;
  /** move = source travels onto the target (staging material); wire = a lead is drawn */
  style?: 'move' | 'wire';
}

export interface OptionDef {
  text: string;
  correct?: boolean;
  feedback?: string;
  /** i18n key: choosing this option is a safety failure */
  unsafe?: string;
}

export interface ChooseOptionStep extends BaseStep {
  type: 'choose-option';
  options: OptionDef[];
}

export interface Reading {
  mode: MeterMode;
  pair: [string, string];
  value: string;
}

export interface MeasureStep extends BaseStep {
  type: 'measure';
  points: string[];
  expect: { mode: MeterMode; pair: [string, string] };
  readings: Reading[];
  /** i18n key when the meter is on the wrong mode at confirm time */
  wrongMode?: string;
  /** i18n key when the probes are on the wrong points at confirm time */
  wrongPoints?: string;
}

export interface HoldStep extends BaseStep {
  type: 'hold-action';
  action: 'strip' | 'torque' | 'bend';
  max: number;
  unit: string;
  zone: [number, number];
  durationMs: number;
  tooLow: string;
  tooHigh: string;
  target?: string;
}

export interface InspectPoint {
  id: string;
  pos: Vec3;
  label: string;
  info: string;
  defect?: boolean;
}

export interface InspectStep extends BaseStep {
  type: 'inspect';
  target: string;
  mode: 'learn' | 'find';
  points: InspectPoint[];
  /** find mode: i18n key when reporting with defects missing */
  missed?: string;
}

export type Step =
  | DialogueStep
  | ClickStep
  | DragConnectStep
  | ChooseOptionStep
  | MeasureStep
  | HoldStep
  | InspectStep;

export type StepType = Step['type'];

export interface Mission {
  id: string;
  module: string;
  title: string;
  desc: string;
  env: EnvKind;
  parSeconds: number;
  characters: Partial<Record<Speaker, Placement>>;
  props: PropDef[];
  steps: Step[];
  /** optional initial camera */
  camera?: CameraShot;
  /** default video topic for the mission's steps */
  video?: string;
}

export interface ModuleDef {
  id: string;
  number: number;
  title: string;
  desc: string;
  icon: string;
  available: boolean;
  missions: string[];
}

export interface TermDef {
  id: string;
  term: string;
  es: string;
  explanation_es: string;
  explanation_en: string;
  /** optional text sent to speech synthesis if different from term */
  say?: string;
  /** procedural 3D model for the close-up viewer */
  model?: { kind: string; params?: Record<string, string | number | boolean> };
}

export interface PhraseDef {
  id: string;
  en: string;
  es: string;
}

export interface Feedback {
  kind: 'good' | 'bad' | 'info';
  key: string;
  /** unique id so identical consecutive feedback re-triggers animations */
  n: number;
}

export interface Scores {
  safety: number;
  correctness: number;
  speed: number;
  total: number;
  stars: number;
  elapsed: number;
}

export type BossMood = 'fail' | 'sloppy' | 'slow' | 'great' | 'ok';

export interface MissionResult {
  missionId: string;
  failed: boolean;
  failKey?: string;
  scores: Scores;
  mood: BossMood;
  mistakes: number;
  hints: number;
}
