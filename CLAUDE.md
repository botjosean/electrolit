# Electrician Sim US — CLAUDE.md

An interactive 3D course that teaches **practical US electrical work (not theory)** to Spanish
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
Vite + React + TypeScript + React Three Fiber + drei + zustand. Progress saved in localStorage.
Mobile + desktop controls (touch, drag). *Owner feedback after playtesting: no orbit/zoom/pan —
the camera is fixed per step ("picture" framing) because manipulating the view was annoying.*

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
- Low-poly procedural 3D (no external models), clean lighting, highlight interactive objects.
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

- [x] CLAUDE.md + scaffold (Vite, React, TS, R3F, drei, zustand)
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
npm run e2e        # needs a build first (npm run build). Plays EVERY mission step in headless
                   # Chromium: desktop with real mouse clicks/drags on the 3D scene, then a phone
                   # viewport with touch taps; plus failure paths (mistake, hint, term card, ES/EN,
                   # safety fail, retry). Screenshots → e2e-out/.  Options: --only m1-2,m1-3  --no-shots
```

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
    speech.ts                Web Speech API (en-US) pronunciation
    content.ts               loads modules.json + all mission JSON (import.meta.glob)
    debug.ts                 window.__sim test hook (used by e2e)
  i18n/es/*.json, i18n/en/*.json   one file per namespace: ui, props, m0, m1, ...
  glossary/glossary.json     [{id, term, es, explanation_es, explanation_en, pron?}]
  glossary/phrases.json      foreman orders + boss lines [{id, en, es}]
  missions/modules.json      module list (all 11, `available` flag)
  missions/m0/*.json         missions of module 0 …
  components/                MainMenu, ModuleScreen, MissionScreen, hud/*
  three/                     Stage (Canvas, lights, camera rig), Interactable, characters,
    env/                     environments (yard, garage)
    props/                   procedural low-poly props + registry (kind → component)
scripts/e2e.mjs              headless end-to-end playthrough of every mission
tests/                       vitest suites
```

### Mission JSON schema (summary — see `src/engine/types.ts`)
```jsonc
{
  "id": "m1-4", "module": "m1", "title": "m1.m4.title", "desc": "m1.m4.desc",
  "env": "garage",                 // yard | garage
  "parSeconds": 240,               // for the speed score
  "characters": { "foreman": {"pos":[x,y,z], "rot": 0}, "instructor": {...} },
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
- **3D labels**: rendered with CanvasTexture (no font downloads, works offline).
- **Drag on touch**: drag-connect supports real drag (pointer down on source, release on target)
  AND tap-source-then-tap-target, because precise dragging on small phones is frustrating.
- **Base path**: `vite.config.ts` uses `/electrician-sim-us/` (spec) unless `BASE_PATH` is set.
  The deploy workflow sets `BASE_PATH=/<repo-name>/` so Pages works even though this repo is
  named `electrolit` (if the repo is renamed to `electrician-sim-us` it's identical to the spec).
  GitHub Pages must be configured with **Source: GitHub Actions** in the repo settings.
- **Router**: hash router (works on GitHub Pages without 404 tricks).
- **3D labels/hotspots**: rendered as one DOM overlay positioned every frame by `<Projector/>`
  (`src/three/Projector.tsx`), NOT drei `<Html>` (it creates a React root per label and throws
  `removeChild` errors on unmount with React 19).
- **HUD-aware camera**: the panel reports the area it covers (`panelInset`, measured on step change
  only so feedback doesn't make the scene jump); the camera uses `setViewOffset` to center the scene
  in the free area and backs off so `camera.w` meters stay visible (portrait phones included).
- **Terms inside answer buttons** are highlighted but not tappable (nested buttons broke answering).
- **Layout rule for missions**: keep interactive props from being in front of each other from the
  camera's view (hit boxes are enlarged ×1.15 for touch); the e2e test fails if a prop's center is
  covered by another prop or the HUD.
- **Taps** are detected as pointerdown + pointerup on the same prop (< 12 px), not R3F `onClick`,
  which occasionally dropped touch taps.
- **Hold actions** compute the value at the exact release time (not the last frame), so slow phones
  aren't penalized.
- **Content authoring**: mission JSON + i18n JSON are the source of truth (edit them directly). Keys
  follow `m<module>.m<mission>.<step>`; props labels live in the `props` namespace.
- **Video links** are YouTube *search* URLs (`src/glossary/videos.json`, `video` on mission/step),
  never hard-coded video ids, so they can't go dead. Terms get automatic "<term> electrician" searches.
- **Demo ("Muéstrame cómo")** plays an animated hand over the real UI/3D positions and narrates the
  step; it never performs the action (the learner repeats it). It shares the hint cost (−5 once per step).
- **Voice**: Web Speech narration, es-US voice for Rosa, en-US for foreman orders; off by default
  (toggle 🔈 in the top bar, persisted); 🔊 on each bubble reads it on demand.
- **Fixed camera (owner playtest feedback)**: rotating/zooming/panning the view was annoying, so the
  scene camera is locked; each step's `camera` shot frames what matters and the rig animates between
  shots. Mission authors must make every step's shot show all its interactive props big enough.
- **Close-up 3D viewer** (`ObjectViewer`): tapping an object you already identified, the
  "🧊 Ver en 3D" button in term cards, or the glossary opens the model alone, big, on a hands-off
  turntable (it rotates by itself; no drag/pinch). Glossary entries carry `model: {kind, params}`.
- **Readable on any host**: text color/font are pinned on `#root` (hosts like the artifact viewer
  inject a dark default text color on `body`); the e2e checks this.
- **WebGL contexts** are released when a Stage/viewer unmounts; a lost context shows "tap to reload
  the 3D view" (remounts the Stage, mission progress kept). DPR capped at 1.6 on phones.
- **Tool layouts**: compact 3-column grids (≈1.4 m wide) so objects look big on portrait phones;
  scene labels show only the English name (Spanish is in the card).
- **Testing**: vitest validates all content (keys exist in es+en, glossary ids, prop ids, prop kinds,
  step shape, solvability) + engine logic; `scripts/e2e.mjs` plays every mission in headless Chromium
  with real pointer events on the canvas (positions projected from 3D), including failure paths.
- **NM-B jacket colors** used as the US industry convention: white 14 AWG, yellow 12 AWG,
  orange 10 AWG, black 8/6 AWG, gray = UF-B.
- **Phase colors** (convention, not NEC mandate except high-leg): 208Y/120 black-red-blue +
  white neutral; 480Y/277 brown-orange-yellow + gray neutral; green/bare = ground.
