# Electrician Sim US — CLAUDE.md

An interactive, illustrated (2D) course that teaches **practical US electrical work (not theory)** to Spanish
speakers. It must feel like a realistic job site with an instructor guiding you step by step.

> Work autonomously: do not stop to ask questions; make reasonable decisions and document them
> here (see **Decisions log**).

---

## 0. North star (product vision from the owner)

- **Learn by doing, like a game.** It should feel as fun and simple as Roblox, but when you finish you
  can actually do the job. So simple it surprises people, and it truly trains them. Every mission is a
  hands-on task, never a lecture: touch the tool, drag the wire, hold to strip, measure, inspect.
- **A platform, not one course.** Think Hotmart (a marketplace where people pay for courses on
  anything: fitness, nails, video editing…) but with interactive simulations instead of videos.
  Electricity is the first trade, and more will follow. So the engine must stay **trade-agnostic**:
  missions are data (JSON + i18n), and step types, safety, scoring, glossary, instructor and progress
  are reusable. Nothing electrical is hard-coded in `src/engine/`.
- Future platform ideas (not in scope yet): course catalog per trade, completion certificates,
  accounts/cloud progress, creator tools to author missions without code. **Free for learners.**
- **Learn from what exists, don't reinvent it**: research in `docs/RESEARCH.md` (Platzi, Coursera,
  Duolingo, Khan Academy, Hotmart; simulation-training evidence; YouTube channels; multiplayer options).
- Teaching loop for every step: **show** ("👀 Muéstrame cómo" demo + narration) → **practice**
  (the step) → **without help** (future "Modo Foreman") + a link to **real videos** of pros doing it.

### Roadmap (after the modules, from docs/RESEARCH.md)
- [x] Real-life video links per step and per term (YouTube searches in ES + EN) + curated channels
- [x] "Muéstrame cómo": animated demo of the correct step, narrated (worked example)
- [x] Voice: Rosa reads steps aloud (Web Speech, es-US); foreman orders spoken in English
- [x] "Retar a un amigo": share score + mission link
- [ ] PWA / offline for phones with limited data
- [ ] Mastery levels per skill (separate from effort XP), daily 2-min "turno" + streak
- [ ] Free verifiable certificates per path (practical capstone mission, QR/link)
- [ ] More "spot the violation" hazard rounds; faded "Modo Foreman" checks without help
- [ ] Supabase: accounts, progress sync, leaderboards, then 2–8 player co-op crews (room code)
- [ ] Better voice: pre-rendered Kokoro TTS (Apache-2.0) instead of device voices
- Not doing: Roblox rewrite (maybe later as a marketing funnel only), WoW/Tibia server emulators
  (wrong genre + legal risk), AI video generators for technique (they fail at hands and details)

## 1. Full specification

### Language rules
- Spanish is the default language for all UI, instructions and instructor dialogue.
- Every technical term is shown as: **English term + Spanish meaning + one short simple explanation**.
  Example: "Breaker (breque / interruptor termomagnético) — corta la corriente si pasa más amperaje
  del que aguanta el cable."
- Terms are highlighted and tappable: card with English word, pronunciation button
  (Web Speech API, en-US), Spanish meaning, short explanation.
- Foreman orders show the English phrase + Spanish translation below
  ("Kill the main" → "Baja el breaker principal").
- ES/EN toggle switches the full UI. This is NOT an English course: keep language help short and practical.

### Stack
Vite + React + TypeScript + zustand. Progress saved in localStorage. Mobile + desktop controls
(tap, drag, tap-then-tap).
**Owner decision after playtesting (supersedes the original "React Three Fiber + drei" spec):
no 3D at all.** Scenes are flat 2D illustrations (inline SVG, drawn in code, no external assets):
"less movement, more visuals". No camera handling: each step frames what matters automatically.
Audio is pre-recorded (Piper TTS, open voices) because phone webviews have no speechSynthesis.

### Deploy
GitHub Actions workflow that builds and deploys to GitHub Pages on every push to `main`
(Vite base `/electrician-sim-us/`).

### Core engine (reusable by all modules)
- Missions as JSON in `/src/missions/`. Step types: `dialogue`, `click`, `drag-connect`,
  `choose-option`, `measure` (multimeter), `hold-action` (strip/torque/bend), `inspect`.
- All text in i18n files (es/en) plus a shared glossary JSON (term, es, explanation_es, explanation_en).
- Instructor/foreman character with speech bubbles.
- Safety system: skipping lockout/tagout or not verifying dead = fail with explanation.
- Scoring: safety, correctness, speed. End-of-mission "lo que diría el jefe".
- Flat 2D illustrations drawn in code (SVG), highlight interactive objects. *(was: low-poly 3D)*
- Main menu showing all modules with progress.

### Modules (in this order)
0. Primer día en la obra: PPE, tool bag, material delivery (wire spools, boxes, breakers), cómo el
   foreman da órdenes y cómo responder.
1. Herramientas y cable: identify tools, AWG sizes, NM-B vs THHN, US color codes, stripping practice,
   wire-to-breaker sizing (14→15A, 12→20A, 10→30A).
2. Panel residencial 200A: kill main, verify dead, install breakers, land hot/neutral/ground,
   neutral-ground bond only at main.
3. Rough-in de una casa desde el plano: mount boxes, drill studs, home runs, staple cable, label.
4. Trim out: receptacles, single-pole and 3-way switches, GFCI/AFCI.
5. Troubleshooting: multimeter readings, open neutral, tripped breaker, dead outlet.
6. Comercial: EMT bending (90, offset, saddle), pulling THHN, 3-phase 208/120 and 480/277.
7. Generador + automatic transfer switch.
8. Data center: cable tray, busway, UPS, PDUs, redundant A/B feeds.
9. Lectura de planos: symbols, panel schedules, basic load calculation.
10. Modo Foreman: read the plan, material takeoff, assign tasks to crew NPCs, inspect their work.

### Process
1. Write CLAUDE.md with this full spec plus a PROGRESS checklist of all modules.
2. Scaffold, build the engine, then build modules one by one.
3. After EACH module: run the build, test every mission step, fix all errors, mark it done in
   CLAUDE.md, commit and push.
4. STOP after module 1 is done, tested, committed and pushed. Summarize what was built.

---

## 2. PROGRESS

- [x] CLAUDE.md + scaffold (Vite, React, TS, zustand) — 3D (R3F) replaced by 2D SVG after playtest
- [x] GitHub Pages deploy workflow (`.github/workflows/deploy.yml`) + CI workflow
- [x] Core engine (mission runner, 7 step types, i18n, glossary + term cards, speech,
      safety system, scoring, boss verdict, progress persistence, main menu)
- [x] Module 0 — Primer día en la obra (4 missions: PPE + cord inspection, tool bag orders,
      material delivery/staging, foreman orders & replies) — e2e desktop + mobile ✔
- [x] Module 1 — Herramientas y cable (5 missions: identify tools, AWG + NM-B/THHN, color codes
      incl. 208/480, stripping + nick inspection + continuity, wire-to-breaker + LOTO) — e2e desktop + mobile ✔
- [ ] Module 2 — Panel residencial 200A
- [ ] Module 3 — Rough-in de una casa desde el plano
- [ ] Module 4 — Trim out
- [ ] Module 5 — Troubleshooting
- [ ] Module 6 — Comercial (EMT, THHN, 3-phase)
- [ ] Module 7 — Generador + ATS
- [ ] Module 8 — Data center
- [ ] Module 9 — Lectura de planos
- [ ] Module 10 — Modo Foreman

---

## 3. Commands

```bash
npm install
npm run dev        # local dev server (http://localhost:5173/electrician-sim-us/)
npm run build      # typecheck + production build into dist/
npm test           # vitest: engine logic + content validation (every mission, key, term, prop)
node scripts/speech-export.mjs && python3 scripts/tts.py
                   # (re)record audio clips after changing any spoken text (needs
                   # `pip install piper-tts lameenc`; voices download from Hugging Face)
npm run e2e        # needs a build first (npm run build). Plays EVERY mission step in headless
                   # Chromium: desktop with real mouse clicks/drags on the scene, then a phone
                   # viewport with touch taps; plus failure paths (mistake, hint, term card, ES/EN,
                   # safety fail, retry). Screenshots → e2e-out/.  Options: --only m1-2,m1-3  --no-shots
```

`npm test` fails if a spoken text has no recorded clip (tests/audio.test.ts).
`npm run e2e` uses `playwright-core` pinned to the Chromium in `/opt/pw-browsers`
(override with `CHROMIUM_PATH=...`).

---

## 4. Architecture

```
src/
  main.tsx, App.tsx          hash router: #/  |  #/module/<id>  |  #/mission/<id>
  styles.css                 all UI styling (mobile first)
  engine/
    types.ts                 Mission / Step / Prop type definitions (the mission JSON schema)
    store.ts                 zustand stores: settings + progress (persisted), mission runtime
    logic.ts                 pure step logic (click/connect/option/measure/hold/inspect) + scoring
    i18n.ts                  t(key) with namespaced JSON files, useT() hook
    glossary.ts              glossary + phrases (foreman orders / boss lines) lookup
    richText.tsx             [[termId]] / [[termId|display]] / **bold** markup renderer
    speech.ts                recorded-clip playback (public/audio, src/audio/manifest.json) with
                             Web Speech fallback; useSpeech() drives the animated 🔊 buttons
    content.ts               loads modules.json + all mission JSON (import.meta.glob)
    debug.ts                 window.__sim test hook (used by e2e)
  i18n/es/*.json, i18n/en/*.json   one file per namespace: ui, props, m0, m1, ...
  glossary/glossary.json     [{id, term, es, explanation_es, explanation_en, pron?}]
  glossary/phrases.json      foreman orders + boss lines [{id, en, es}]
  missions/modules.json      module list (all 11, `available` flag)
  missions/m0/*.json         missions of module 0 …
  components/                MainMenu, ModuleScreen, MissionScreen, ObjectViewer (ficha), hud/*
  scene/
    Scene2D.tsx              the 2D scene: auto framing per step, props, characters, taps/drags,
                             hints, labels, wires, probes, inspection points
    art/                     SVG illustrations in mm (ppe, tools, materials, site, characters)
                             + registry kind → {draw, bounds}
  audio/manifest.json        keys of the recorded clips (public/audio/<key>.mp3)
scripts/e2e.mjs              headless end-to-end playthrough of every mission
scripts/speech-export.mjs    lists every spoken text + its clip key
scripts/tts.py               records the clips with Piper voices (Rosa es_MX-claude, Mike es_MX-ald,
                             English en_US-ryan)
tests/                       vitest suites
```

### Mission JSON schema (summary — see `src/engine/types.ts`)
```jsonc
{
  "id": "m1-4", "module": "m1", "title": "m1.m4.title", "desc": "m1.m4.desc",
  "env": "garage",                 // yard | garage (2D background)
  "parSeconds": 240,               // for the speed score
  "characters": { "foreman": {"pos":[x,y,z]}, "instructor": {...} },  // drawn standing at (x, z)
  "props": [ { "id": "wire1", "kind": "wire-piece", "pos": [0,1,0], "rot": [0,0,0],
               "scale": 1, "params": { "color": "#222" }, "label": "props.wire" } ],
  "steps": [ { "id": "s1", "type": "dialogue", "speaker": "instructor", "text": "m1.m4.s1",
               "order": "kill_main", "camera": {"pos":[..], "target":[..]} }, ... ]
}
```
Every step has `id`, `type`, `speaker` (`foreman` | `instructor`), `text` (i18n key) and optional
`camera`, `order` (phrase id, shown as English + translation), `success` (i18n key shown after).
Type-specific fields:
- **dialogue** — just "Continuar".
- **click** — `targets[]` (prop ids), `ordered?`, `hideOnClick?`, `wrong{propId: key}`
  (mistake + feedback), `unsafe{propId: key}` (safety FAIL), `earlyUnsafe{propId: key}`
  (safety FAIL if clicked before its turn in an ordered step).
- **drag-connect** — `pairs{sourcePropId: targetPropId}`, `wrong{"src>tgt": key}`,
  `unsafe{"src>tgt": key}`. Drag from source to target (or tap source, then tap target).
- **choose-option** — `options[{text, correct?, feedback?, unsafe?}]`. `unsafe` = safety FAIL key.
- **measure** — `points[]` (probe prop ids), `expect{mode, pair[a,b]}`,
  `readings[{mode, pair, value}]`, `wrongMode?` key. Modes: `VAC`, `VDC`, `OHM`, `CONT`.
- **hold-action** — `action` (strip|torque|bend), `max`, `unit`, `zone[min,max]`, `durationMs`,
  `tooLow`, `tooHigh`, `target?` (prop animated by the hold value).
- **inspect** — `target` prop, `points[{id, pos, label, info, defect?}]`, `mode` (learn|find).
  learn = open every point; find = tap the defective points then press "Reportar".
- Any step may set `flags` on completion; `requires[{flag, fail}]` → safety fail if flag missing.

### Safety system
A safety violation ends the mission immediately (status `failed`), safety score 0, and shows a
full-screen explanation (what you did wrong + why it kills people + what to do instead) plus the
boss line. Violations come from `unsafe` options/clicks/connections, `earlyUnsafe` order violations
and missing `requires` flags.

### Scoring
- safety = 100 (0 on a safety fail)
- correctness = max(0, 100 − 15·mistakes − 5·hints)
- speed = 100 if elapsed ≤ par, else max(40, round(100·par/elapsed))
- total = round(0.5·safety + 0.3·correctness + 0.2·speed); stars: ≥90 ★★★, ≥75 ★★, else ★.
- Boss verdict ("lo que diría el jefe"): failed → fail line; correctness < 60 → sloppy;
  speed < 60 → slow; total ≥ 90 → great; else ok. Foreman speaks English + Spanish translation.

---

## 5. Decisions log

- **Characters**: *Big Mike* (foreman, speaks English orders — that is the real job-site reality)
  and *Rosa* (bilingual journeyman electrician = the instructor, explains in Spanish).
- **Text in JSON namespaces**: `src/i18n/<lang>/<namespace>.json`; keys are `namespace.path`
  (e.g. `m0.m1.s2`). Mission JSON contains only keys, never prose.
- **Term display**: inline terms render as highlighted **English term** (+ short Spanish in ES mode);
  every step also lists its terms in the full format "Term (es) — explicación" under the bubble.
  Tapping opens the term card (🔊 en-US pronunciation, Spanish, explanation).
- **Foreman orders in EN mode**: English phrase only (translation hidden, it's redundant).
- **No module locking**: every built module is playable; unbuilt modules show "Próximamente".
  Recommended order is shown by numbering.
- **Hints**: a 💡 button pulses the correct target(s); costs 5 correctness points.
  Interactive objects glow softly on hover/tap; the correct one is never revealed without a hint.
- **2D scene coordinates**: mission positions stay in meters; the scene draws in mm with x → right
  and z → down (y only orders drawing). A step's `camera` picks the framing: center = `target`
  x/z, width = `w` meters; the view glides between steps (no user camera control).
- **Art**: each prop kind is an SVG component drawn around the same origin as its mission position,
  in its most recognizable view (side view for hard hat/boots, top view for coils/tools), with a
  declared footprint (`bounds`) used for hit boxes, labels and the ficha.
- **Hit testing** is done in scene coordinates (topmost interactive prop whose hit box — footprint
  ×1.15, at least 44 px — contains the pointer), so taps and drags are reliable on phones.
- **Terms inside answer buttons** are highlighted but not tappable (nested buttons broke answering).
- **Layout rule for missions**: keep interactive props from overlapping in the framed view; the
  e2e test fails if a prop's center is not the topmost prop there or is under the HUD.
- **Taps** are pointerdown + pointerup on the same prop (< 12 px movement).
- **Hold actions** compute the value at the exact release time (not the last frame), so slow phones
  aren't penalized.
- **Content authoring**: mission JSON + i18n JSON are the source of truth (edit them directly). Keys
  follow `m<module>.m<mission>.<step>`; props labels live in the `props` namespace.
- **Video links** are YouTube *search* URLs (`src/glossary/videos.json`, `video` on mission/step),
  never hard-coded video ids, so they can't go dead. Terms get automatic "<term> electrician" searches.
- **Demo ("Muéstrame cómo")** plays an animated hand over the real UI/scene positions and narrates the
  step; it never performs the action (the learner repeats it). It shares the hint cost (−5 once per step).
- **Voice / audio**: every step narration (ES; Rosa or Big Mike's Spanish voice), every foreman
  order and boss line, every glossary term (EN) and the demo prompts are pre-recorded MP3s (Piper,
  ~3 MB total, 40 kbps). Playback reuses one `<audio>` element (phones allow it after the first
  tap); the Web Speech API is only a fallback for texts without a clip (e.g. EN-mode narration).
  🔊 buttons turn yellow with moving bars while playing (tap again to stop).
- **Object ficha** (`ObjectViewer`): tapping an object you already identified, the "🔍 Ver de
  cerca" button in term cards, or the glossary shows the illustration big and still, with name,
  audio, meaning and videos. Glossary entries carry `model: {kind, params}` (the art to show).
- **Readable on any host**: text color/font are pinned on `#root` (hosts like the artifact viewer
  inject a dark default text color on `body`); the e2e checks this.
- **Tool layouts**: compact 3-column grids (≈1.4 m wide) so objects look big on portrait phones;
  scene labels show only the English name (Spanish is in the card).
- **Testing**: vitest validates all content (keys exist in es+en, glossary ids, prop ids, prop kinds,
  step shape, solvability) + engine logic; `scripts/e2e.mjs` plays every mission in headless Chromium
  with real pointer events at the props' screen positions, including failure paths.
- **NM-B jacket colors** used as the US industry convention: white 14 AWG, yellow 12 AWG,
  orange 10 AWG, black 8/6 AWG, gray = UF-B.
- **Phase colors** (convention, not NEC mandate except high-leg): 208Y/120 black-red-blue +
  white neutral; 480Y/277 brown-orange-yellow + gray neutral; green/bare = ground.
