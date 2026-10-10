# AURUM — Cinematic Scroll Experience

An award-style, scroll-driven 3D website built with **Three.js**, **GSAP
ScrollTrigger**, and **Lenis**. Every beat of the page is a scene, and all
motion is tied to scroll progress rather than time — the discipline behind
Awwwards Site of the Day builds.

## Features

- **Scroll-driven 3D monolith** — a custom GLSL shader object whose rotation,
  position and explode amount are driven by scroll progress.
- **WebGL displacement hover** — gallery cards dissolve into a noise-based
  displacement with chromatic split, reacting to cursor velocity.
- **Double-helix gallery** — nine cards arranged on a parametric helix that
  rotates past the camera on scroll, then unfolds into a flat grid.
- **Ink-bleed menu** — a full-screen WebGL overlay where fBM noise bleeds across
  the viewport from the click origin to reveal the navigation.
- **Ambient sound** — fully synthesised with the Web Audio API (no audio files),
  driven by scroll velocity, opt-in via the nav toggle.
- **Real image support** — gallery and helix textures load real photos with an
  automatic procedural-gradient fallback if an asset is missing.
- **Kinetic typography** — GSAP `SplitText` character reveals.
- **Custom cursor + magnetic buttons** — `mix-blend-mode: difference` cursor,
  elastic magnetic hovers.
- **One clock** — Lenis smooth scroll is driven from the GSAP ticker, so scroll
  position, DOM tweens and shader uniforms update on the same frame.
- **Performance-first** — lazy-loaded WebGL modules, offscreen render pausing,
  pixel ratio capped at 2, animate only `transform`/`opacity`.
- **Accessible** — `prefers-reduced-motion` paths, skip link, focus-visible
  rings, semantic landmarks.
- **Resilient** — WebGL context loss/restore handling and full resource disposal.

## Tech Stack

| Layer      | Tool                            |
| ---------- | ------------------------------- |
| Build      | Vite                            |
| 3D / WebGL | Three.js + custom GLSL          |
| Animation  | GSAP (ScrollTrigger, SplitText) |
| Scroll     | Lenis                           |
| Styling    | Vanilla CSS (custom properties) |
| Quality    | ESLint + Prettier               |

## Getting Started

```bash
npm install
npm run dev        # http://localhost:5173
```

## Scripts

| Command                | Description                  |
| ---------------------- | ---------------------------- |
| `npm run dev`          | Start the dev server         |
| `npm run build`        | Production build to `dist/`  |
| `npm run preview`      | Preview the production build |
| `npm run lint`         | Lint all JS with ESLint      |
| `npm run lint:fix`     | Auto-fix lint issues         |
| `npm run format`       | Format with Prettier         |
| `npm run format:check` | Check formatting             |

## Project Structure

```
src/
├── main.js         # entry: wiring, lazy-loading, single clock
├── config.js       # content + image URLs (swap here)
├── scroll.js       # Lenis ↔ GSAP ticker sync
├── scene.js        # background GLSL monolith + particles
├── menu.js         # full-screen ink-bleed WebGL menu (lazy)
├── audio.js        # Web Audio ambient sound (lazy)
├── hoverWebgl.js   # gallery card displacement hover (lazy)
├── helix.js        # double-helix gallery (lazy)
├── textures.js     # procedural + image texture loading (lazy)
├── animations.js   # preloader, SplitText reveals, scroll timelines
├── cursor.js       # custom cursor + magnetic elements
├── gl-utils.js     # WebGL context-loss handling
└── styles.css      # design tokens + layout
```

## Using real images

Drop photos into `public/images/` and point to them from `src/config.js`
(`gallery[].image` and the `helix` array). Any CORS-enabled remote URL works
too. Missing assets fall back to generated gradients automatically.

## Accessibility

- Decorative motion is gated behind `prefers-reduced-motion`.
- A keyboard-accessible **skip link** jumps to main content.
- Interactive controls have visible `:focus-visible` styles.
- Canvas layers are `aria-hidden`; content lives in semantic HTML.

## License

MIT
