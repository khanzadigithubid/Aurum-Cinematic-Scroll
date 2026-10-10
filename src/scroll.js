import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

/**
 * Initialise Lenis smooth scroll and drive it from the GSAP ticker so scroll
 * position, DOM tweens and shader uniforms all update on a single clock.
 *
 * @param {(velocity:number)=>void} [onVelocity] Optional scroll velocity sink.
 */
export function initSmoothScroll(onVelocity) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduced) {
    ScrollTrigger.refresh();
    return null;
  }

  const lenis = new Lenis({
    lerp: 0.09,
    smoothWheel: true,
    wheelMultiplier: 1,
  });

  lenis.on("scroll", (e) => {
    ScrollTrigger.update();
    if (onVelocity) onVelocity(Math.min(Math.abs(e.velocity) / 40, 1));
  });

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  return lenis;
}
