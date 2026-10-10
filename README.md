<p align="center">
  <img src="public/favicon.svg" width="80" height="80" alt="AURUM logo" />
</p>

<h1 align="center">AURUM — Cinematic Scroll Experience</h1>

<p align="center">
  An award-style, scroll-driven 3D website where every beat of the page is a scene
  and all motion is tied to scroll progress — not time.
</p>

<p align="center">
  <a href="https://github.com/khanzadigithubid/Aurum-Cinematic-Scroll/blob/main/LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-d8ff3e?style=flat-square" /></a>
  <a href="https://github.com/khanzadigithubid/Aurum-Cinematic-Scroll/stargazers"><img alt="Stars" src="https://img.shields.io/github/stars/khanzadigithubid/Aurum-Cinematic-Scroll?style=flat-square" /></a>
  <a href="https://github.com/khanzadigithubid/Aurum-Cinematic-Scroll/network/members"><img alt="Forks" src="https://img.shields.io/github/forks/khanzadigithubid/Aurum-Cinematic-Scroll?style=flat-square" /></a>
  <a href="https://github.com/khanzadigithubid/Aurum-Cinematic-Scroll/issues"><img alt="Issues" src="https://img.shields.io/github/issues/khanzadigithubid/Aurum-Cinematic-Scroll?style=flat-square" /></a>
</p>

<p align="center">
  <img alt="Three.js" src="https://img.shields.io/badge/Three.js-0.183-black?style=flat-square&logo=threedotjs&logoColor=white" />
  <img alt="GSAP" src="https://img.shields.io/badge/GSAP-3.15-88CE02?style=flat-square&logo=greensock&logoColor=white" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white" />
  <img alt="WebGL" src="https://img.shields.io/badge/WebGL-GLSL-990000?style=flat-square&logo=webgl&logoColor=white" />
</p>

---

## ✦ Overview

AURUM is a creative-development showcase built to the standard of Awwwards
_Site of the Day_ builds. It combines a WebGL-shaded hero object, scroll-driven
scene choreography, a full-screen ink-bleed menu, a double-helix gallery, and
synthesised ambient sound — all tied to a single animation clock.

> **Live demo:** _coming soon (deploying to Vercel)_

## ✦ Features

| Feature                       | Description                                                                                             |
| ----------------------------- | ------------------------------------------------------------------------------------------------------- |
| **Scroll-driven monolith**    | Custom GLSL shader object whose rotation, position and "explode" amount respond to scroll progress.     |
| **WebGL displacement hover**  | Gallery cards dissolve with noise-based displacement and chromatic split, reacting to cursor velocity.  |
| **Double-helix gallery**      | Nine cards on a parametric helix that rotates past the camera, then unfolds into a flat grid.           |
| **Ink-bleed menu**            | Full-screen WebGL overlay where fBM noise bleeds from the click origin to reveal navigation.            |
| **Ambient sound**             | Fully synthesised via the Web Audio API (no audio files), driven by scroll velocity.                    |
| **Real image support**        | Photos load into WebGL textures with automatic procedural-gradient fallback.                            |
| **Kinetic typography**        | GSAP `SplitText` character reveals.                                                                     |
| **Custom cursor + magnetics** | `mix-blend-mode: difference` cursor and elastic magnetic hovers.                                        |
| **One clock**                 | Lenis is driven from the GSAP ticker — scroll, tweens and shader uniforms update on the same frame.     |
| **Performance-first**         | Lazy-loaded WebGL modules, offscreen render pausing, DPR capped at 2, transform/opacity-only animation. |
| **Accessible**                | `prefers-reduced-motion` paths, skip link, focus-visible rings, semantic landmarks.                     |
| **Resilient**                 | WebGL context loss/restore handling and full resource disposal.                                         |

## ✦ Tech Stack

| Layer      | Tool                                                 |
| ---------- | ---------------------------------------------------- |
| Build      | [Vite](https://vitejs.dev/)                          |
| 3D / WebGL | [Three.js](https://threejs.org/) + custom GLSL       |
| Animation  | [GSAP](https://gsap.com/) (ScrollTrigger, SplitText) |
| Scroll     | [Lenis](https://lenis.darkroom.engineering/)         |
| Styling    | Vanilla CSS (custom properties)                      |
| Quality    | ESLint + Prettier                                    |

## ✦ Getting Started

```bash
# clone
git clone https://github.com/khanzadigithubid/Aurum-Cinematic-Scroll.git
cd Aurum-Cinematic-Scroll

# install
npm install

# develop
npm run dev        # http://localhost:5173
```

### Build

```bash
npm run build      # production bundle → dist/
npm run preview    # preview the production build
```

## ✦ Scripts

| Command                | Description                  |
| ---------------------- | ---------------------------- |
| `npm run dev`          | Start the dev server         |
| `npm run build`        | Production build to `dist/`  |
| `npm run preview`      | Preview the production build |
| `npm run lint`         | Lint all JS with ESLint      |
| `npm run lint:fix`     | Auto-fix lint issues         |
| `npm run format`       | Format with Prettier         |
| `npm run format:check` | Check formatting             |

## ✦ Project Structure

```
.
├── index.html              # markup + semantic landmarks
├── vite.config.js          # build + manual chunk splitting
├── eslint.config.js        # flat ESLint config
├── public/
│   ├── favicon.svg
│   └── images/             # drop gallery / helix photos here
└── src/
    ├── main.js             # entry: wiring, lazy-loading, single clock
    ├── config.js           # content + image URLs (swap here)
    ├── scroll.js           # Lenis ↔ GSAP ticker sync
    ├── scene.js            # background GLSL monolith + particles
    ├── menu.js             # full-screen ink-bleed WebGL menu (lazy)
    ├── audio.js            # Web Audio ambient sound (lazy)
    ├── hoverWebgl.js       # gallery card displacement hover (lazy)
    ├── helix.js            # double-helix gallery (lazy)
    ├── textures.js         # procedural + image texture loading (lazy)
    ├── animations.js       # preloader, SplitText reveals, scroll timelines
    ├── cursor.js           # custom cursor + magnetic elements
    ├── gl-utils.js         # WebGL context-loss handling
    └── styles.css          # design tokens + layout
```

## ✦ Using Real Images

Drop photos into `public/images/` and point to them from `src/config.js`
(`gallery[].image` and the `helix` array). Any CORS-enabled remote URL works
too. Missing assets fall back to generated gradients automatically — the site
never breaks.

```js
// src/config.js
export const config = {
  gallery: [
    { title: "Nebula", tag: "WebGL / Shader", image: "/images/gallery-1.jpg" },
    // ...
  ],
  helix: ["/images/helix-1.jpg" /* ... */],
};
```

## ✦ Accessibility

- Decorative motion is gated behind `prefers-reduced-motion`.
- A keyboard-accessible **skip link** jumps to main content.
- Interactive controls have visible `:focus-visible` styles.
- Canvas layers are `aria-hidden`; content lives in semantic HTML.

## ✦ License

Released under the [MIT License](LICENSE).

<p align="center">
  Built with Three.js · GSAP · Lenis — designed & developed by
  <a href="https://github.com/khanzadigithubid">Khanzadi Wazir Ali</a>
</p>
