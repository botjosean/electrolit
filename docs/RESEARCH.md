# Research: how to teach a physical trade better than paid courses

*Gathered with web research on 2026-09-24. All claims come with the source URLs found. Treat vendor
claims as marketing. "Unverified" means the item exists but the detail could not be confirmed.*

## 1. What course platforms do (and what we copy or beat)

| Platform | What they do | Source |
|---|---|---|
| Video research (6.9M sessions) | Engagement drops after ~6 min and again after ~9 min | https://summeracademy.academic.wlu.edu/files/2020/07/Guo-et-al-2014-videos-and-student-engagement.pdf |
| Coursera | Videos < 8 min; Guided Projects of 1–2 h; completion ~10–15% overall but ~40% for professional certificates; ~25% of courses use peer review | https://www.classcentral.com/report/courses-with-peer-reviews/ · https://skillspringer.com/platforms/is-coursera-worth-it/ |
| Udemy | ≥ 30 min video, ≥ 5 lectures (quizzes don't count) | https://support.udemy.com/hc/en-us/articles/229604328-Calculating-Course-Length |
| Platzi | Goal-based "rutas", "Escuelas" with community, certificate by exam/project, offline lessons | https://platzi.com/blog/que-es-platzi/ · https://platzi.com/blog/todo-lo-que-debes-saber-sobre-certificados-en-platzi/ |
| Khan Academy | Mastery levels (Apprentice → Sage) separate from effort "energy points"; badges | https://support.khanacademy.org/hc/en-us/articles/202487710-What-are-energy-points-badges-and-avatars |
| Duolingo | Streaks (+ freeze/wager), weekly leagues of ~30 by pace, co-op "Friends Quests" | https://duolingo.deconstructoroffun.com/mechanics/leagues · https://www.deconstructoroffun.com/blog/2025/4/14/duolingo-how-the-15b-app-uses-gaming-principles-to-supercharge-dau-growth |
| Hotmart Club | Free sample modules, bonus/add-on modules, community, progress analytics | https://help.hotmart.com/es/article/360000645592/-como-crear-y-gestionar-modulos-en-hotmart-club- |

**Patterns for Electrician Sim US**
1. Missions of 3–6 min, each with one visible goal. *(done: 6–10 steps per mission)*
2. Mastery separate from effort: XP for effort, a mastery level per skill (Aprendiz → Oficial → Journeyman).
3. Daily 2-minute "turno" with a streak and a streak freeze.
4. Weekly crews (cuadrillas) matched by pace; co-op crew quests.
5. Named paths: Residential Helper → Residential Apprentice → Commercial/EMT → Data Center.
6. Free, verifiable certificates earned in a practical capstone sim (shareable link or QR code).
7. Offline PWA for phones with limited data.
8. A community link (WhatsApp or Discord) per path.

## 2. Evidence: simulations for trades

- **Simulation-based learning meta-analysis** (145 studies): g = 0.85. Scaffolding helps. Novices benefit most from examples.
  https://eric.ed.gov/?id=EJ1259299
- **VR safety training for 50 utility electricians**: +7.2 vs +3.8 points for VR-first vs lecture-first (p < 0.001).
  https://pmc.ncbi.nlm.nih.gov/articles/PMC11320216/
- **VR safety meta-analysis** (52 papers): construction is the top domain; hazard recognition is the top outcome; immediate feedback is standard.
  https://www.sciencedirect.com/science/article/pii/S0925753523003144
- **Feedback in simulated procedural training**: pooled effect 0.74. For novices, end-of-task feedback retains better.
  https://eric.ed.gov/?id=EJ1036052
- **Worked examples → fading**: study a solved example, then partial help, then solve alone.
  https://en.wikipedia.org/wiki/Worked-example_effect
- **Programs**:
  - NCCER + ABC Illinois VR pilot: https://www.nccer.org/newsroom/building-operator-confidence-through-simulation-based-training/
  - IBEW/NECA electrical training ALLIANCE with IVRY virtual electrical training: https://www.idealindustries.com/us/en/about/news/ivry-partners-with-alliance.html
  - Interplay Learning 3D/VR electrical sims: https://www.interplaylearning.com/
- **Multimedia principles (Mayer)**: segmenting, signaling, modality, and "a human voice beats a machine voice".
  https://www.devlinpeck.com/content/mayers-principles-of-multimedia-learning

**What that means here.** Every step should follow: **demo** ("👀 Muéstrame cómo", done), then
**guided practice** (the mission, done), then **a check without help** ("Modo Foreman", later). Add
immediate feedback on safety errors (done), a debrief at the end (done: results plus the boss's line),
and "spot the violation" rounds (done: inspect `find` mode; do more of them).

## 3. YouTube channels (curated in the app menu)

| Channel | Why |
|---|---|
| Electrician U — https://www.youtube.com/@ElectricianU | Master electrician; field work, theory, tools. Best start. |
| Mike Holt — https://www.youtube.com/@MikeHoltNEC | NEC code and licensing. |
| The Engineering Mindset — https://www.youtube.com/c/Theengineeringmindset | Whiteboard/animated explainers. |
| NECCICANS — https://www.youtube.com/@SIMAN-ENGINEERING | Spanish; NEC and electricity for Latinos in the USA. |
| Craig Michaud — https://www.youtube.com/c/CraigMichaudElectricalInstructor | Trade-school instructor. |
| Klein Tools — https://www.youtube.com/channel/UCdOfAJ0TR--wfM89QHFvSHA | Tool use. |
| Electricista en Casa — https://www.youtube.com/c/ElectricistaenCasa | Spanish residential tutorials; not NEC-specific. |

Per-step links use YouTube **search** URLs (`src/glossary/videos.json`), so they never go dead and
always show current videos in Spanish, plus English (which has more videos).

## 4. Multiplayer: friends in the same course (like WoW, Tibia or Roblox)

| Option | Free tier | Verdict |
|---|---|---|
| **Supabase Realtime** (Broadcast + Presence) + Auth + Postgres | 200 concurrent connections, 2M msgs/mo | **Recommended.** Works from a static site; also gives accounts, progress and leaderboards. |
| Firebase RTDB | 100 simultaneous connections | OK for a prototype |
| PartyKit / Cloudflare Durable Objects | Workers free tier | Later, for authoritative rooms |
| PeerJS/WebRTC | ~50 users on the cloud signaling server, no TURN relay | Unreliable behind NAT |
| Colyseus | Self-host free | Needs our own server |

**Roblox** would mean rewriting everything in Luau, the audience is young, and chat requires a
facial age check (2026). At most, a Roblox "demo job site" could later act as a marketing funnel.
**MMO emulators** (AzerothCore/TrinityCore for WoW, OpenTibia/Canary): the wrong genre, heavy C++
servers, and legal risk (Blizzard/CipSoft IP). Don't use them.

**Plan.** Stay on GitHub Pages. First ship async social features: "challenge a friend" share (done),
leaderboards, crew quests and ghost replays. Then Supabase co-op rooms for 2–8 players with a room
code: see each other's avatars, share the foreman's task list, and split the tasks.

## 5. "Video made by AI" for each step

- **Best: in-engine replays + narration** (done: "👀 Muéstrame cómo" plus Web Speech narration).
  - Upgrade later: Kokoro TTS (Apache-2.0, Spanish voices, can pre-render MP3s at build time) for a
    consistent human-like voice.
  - `canvas.captureStream()` + `MediaRecorder` can export shareable WebM clips.
- **AI video generators** (Veo, Kling, Runway): they fail at hands and fine detail (terminations,
  stripping, bending). Use them only for intros and atmosphere, never for technique.
