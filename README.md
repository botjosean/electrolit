# Electrician Sim US ⚡

Curso interactivo e ilustrado para aprender **trabajo eléctrico práctico en EE.UU.**, en español.
Se juega como en una obra de verdad: tu foreman, Big Mike, da órdenes en inglés, y tu instructora, Rosa, te guía paso a paso.

*Interactive illustrated course that teaches practical US electrical work to Spanish speakers.*

- 🦺 Módulo 0 — Primer día en la obra
- 🧰 Módulo 1 — Herramientas y cable
- 🔌 Módulos 2–10 — próximamente (panel 200A, rough-in, trim out, troubleshooting, comercial, generador/ATS, data center, planos, modo foreman)

## Desarrollo

```bash
npm install
npm run dev     # http://localhost:5173/electrician-sim-us/
npm test        # validación de contenido + lógica del motor
npm run build && npm run e2e   # recorre todas las misiones en Chromium (mouse y touch)
```

Stack: Vite + React + TypeScript + zustand. Escenas 2D dibujadas en SVG (sin imágenes externas). Voces grabadas con Piper TTS (voces abiertas).
El despliegue a GitHub Pages ocurre en cada push a `main` (Settings → Pages → Source: **GitHub Actions**).

Ver [CLAUDE.md](CLAUDE.md) para la especificación completa, la arquitectura y el progreso.

> Simulador educativo. No sustituye la capacitación oficial, el NEC ni las reglas de OSHA.
