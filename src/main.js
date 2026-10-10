import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initSmoothScroll } from "./scroll.js";
import { initScene } from "./scene.js";
import { initCursor } from "./cursor.js";
import {
  initPreloader,
  initHeroIntro,
  initScrollAnimations,
  initScrollDrivenScene,
} from "./animations.js";
import { config } from "./config.js";

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

/**
 * Pause a ticker-driven render loop while `element` is outside the viewport,
 * so offscreen WebGL scenes never waste GPU cycles.
 */
function pauseWhenOffscreen(element, render, ticker) {
  let running = false;

  const start = () => {
    if (running) return;
    running = true;
    ticker.add(render);
  };

  const stop = () => {
    if (!running) return;
    running = false;
    ticker.remove(render);
  };

  const observer = new IntersectionObserver(
    ([entry]) => (entry.isIntersecting ? start() : stop()),
    { rootMargin: "200px" }
  );
  observer.observe(element);

  return () => observer.disconnect();
}

/* ---------- Base scene (fixed background) ---------- */
const canvas = document.querySelector(".webgl");
const scene = initScene(canvas);

let audio = null;

initSmoothScroll((velocity) => {
  if (audio) audio.setScrollDrone(velocity);
});
initCursor();

initScrollDrivenScene(scene.setScrollProgress);
initScrollAnimations();

if (scene.reduced) {
  scene.render();
} else {
  gsap.ticker.add(scene.render);
  gsap.ticker.lagSmoothing(0);
}

/* ---------- Full-screen ink-bleed menu ---------- */
if (!prefersReducedMotion) {
  import("./menu.js").then(({ initMenu }) => initMenu());
}

/* ---------- Ambient sound (opt-in, lazy) ---------- */
import("./audio.js").then(({ initAudio }) => {
  audio = initAudio();
});

/* ---------- WebGL displacement hover (gallery cards) ---------- */
const cards = Array.from(document.querySelectorAll(".card"));

if (cards.length && !prefersReducedMotion) {
  Promise.all([import("./hoverWebgl.js"), import("./textures.js")]).then(
    ([{ initHoverWebgl }, { createGalleryTexture, loadImageTextures }]) => {
      const hover = initHoverWebgl(cards);
      if (!hover) return;

      const fallbacks = cards.map((_, i) => createGalleryTexture(i));
      const imageUrls = config.gallery.map((g) => g.image);

      loadImageTextures(imageUrls, (i) => fallbacks[i]).then((textures) => {
        cards.forEach((card, i) => {
          const media = card.querySelector(".card__media");
          if (config.gallery[i]?.image) {
            media.style.backgroundImage = `url("${config.gallery[i].image}")`;
            media.style.backgroundSize = "cover";
            media.style.backgroundPosition = "center";
          }
          media.addEventListener("pointerenter", () =>
            hover.show(card, textures[i])
          );
          media.addEventListener("pointerleave", () => hover.hide());
        });
      });
    }
  );
}

/* ---------- Double-helix gallery (lazy) ---------- */
const helixCanvas = document.querySelector(".helix__canvas");

if (helixCanvas) {
  Promise.all([import("./helix.js"), import("./textures.js")]).then(
    ([{ initHelix }, { createHelixTextures, loadImageTextures }]) => {
      const fallbacks = createHelixTextures(config.helix.length);

      loadImageTextures(config.helix, (i) => fallbacks[i]).then((textures) => {
        const helix = initHelix(helixCanvas, textures);

        ScrollTrigger.create({
          trigger: ".section--helix",
          start: "top top",
          end: "+=180%",
          pin: ".helix__stage",
          scrub: 0.6,
          onUpdate: (self) => helix.setProgress(self.progress),
        });

        if (helix.reduced) {
          helix.render();
        } else {
          pauseWhenOffscreen(helixCanvas, helix.render, gsap.ticker);
        }
      });
    }
  );
}

/* ---------- Intro ---------- */
initPreloader().then(() => {
  initHeroIntro();
});

/* ---------- Smooth in-page navigation ---------- */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (e) => {
    const target = document.querySelector(anchor.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth" });
  });
});
