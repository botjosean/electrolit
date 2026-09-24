# Electrician Sim US ⚡

Curso 3D interactivo para aprender **trabajo eléctrico práctico en EE.UU.**, en español.
Se juega como en una obra de verdad: tu foreman, Big Mike, da órdenes en inglés, y tu instructora, Rosa, te guía paso a paso.

*Interactive 3D course that teaches practical US electrical work to Spanish speakers.*

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

Stack: Vite + React + TypeScript + React Three Fiber + drei + zustand. Todo el 3D es procedural (sin modelos externos).
El despliegue a GitHub Pages ocurre en cada push a `main` (Settings → Pages → Source: **GitHub Actions**).

Ver [CLAUDE.md](CLAUDE.md) para la especificación completa, la arquitectura y el progreso.

> Simulador educativo. No sustituye la capacitación oficial, el NEC ni las reglas de OSHA.
