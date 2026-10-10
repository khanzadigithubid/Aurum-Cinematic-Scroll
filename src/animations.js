import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

const REVEAL_EASE = "expo.out";
const REVEAL_DURATION = 1.1;

export function initPreloader() {
  const preloader = document.querySelector(".preloader");
  const count = document.querySelector(".preloader__count");
  if (!preloader || !count) return Promise.resolve();

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduced) {
    preloader.style.display = "none";
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const counter = { value: 0 };
    gsap.to(counter, {
      value: 100,
      duration: 1.6,
      ease: "power2.inOut",
      onUpdate: () => {
        count.textContent = String(Math.round(counter.value));
      },
      onComplete: () => {
        gsap
          .timeline({ onComplete: resolve })
          .to(count, { yPercent: -110, duration: 0.5, ease: "power3.in" })
          .to(
            preloader,
            { yPercent: -100, duration: 0.9, ease: "power4.inOut" },
            "-=0.15"
          )
          .set(preloader, { display: "none" });
      },
    });
  });
}

export function initHeroIntro() {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return;

  const words = document.querySelectorAll(".section--hero [data-split]");
  gsap.set(words, { yPercent: 120 });

  gsap
    .timeline({ delay: 0.1 })
    .to(words, {
      yPercent: 0,
      duration: 1.3,
      ease: "power4.out",
      stagger: 0.09,
    })
    .from(
      ".section--hero [data-reveal]",
      {
        y: 28,
        opacity: 0,
        duration: REVEAL_DURATION,
        ease: REVEAL_EASE,
        stagger: 0.12,
      },
      "-=0.9"
    )
    .from(
      ".nav",
      { y: -30, opacity: 0, duration: 0.9, ease: REVEAL_EASE },
      "-=1"
    )
    .from(
      ".scroll-hint",
      { opacity: 0, duration: 0.8, ease: REVEAL_EASE },
      "-=0.6"
    );
}

export function initScrollAnimations() {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduced) {
    gsap.set("[data-reveal], .card", { opacity: 1, y: 0 });
    return;
  }

  document
    .querySelectorAll(".section:not(.section--hero) [data-split]")
    .forEach((el) => {
      const split = new SplitText(el, { type: "chars" });
      gsap.from(split.chars, {
        yPercent: 115,
        opacity: 0,
        duration: 1,
        ease: "power4.out",
        stagger: 0.022,
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          once: true,
        },
      });
    });

  document
    .querySelectorAll(".section:not(.section--hero) [data-reveal]")
    .forEach((el) => {
      gsap.to(el, {
        y: 0,
        opacity: 1,
        duration: REVEAL_DURATION,
        ease: REVEAL_EASE,
        scrollTrigger: {
          trigger: el,
          start: "top 86%",
          once: true,
        },
      });
    });

  gsap.to(".card", {
    y: 0,
    opacity: 1,
    duration: 1.2,
    ease: REVEAL_EASE,
    stagger: 0.14,
    scrollTrigger: {
      trigger: ".gallery",
      start: "top 80%",
      once: true,
    },
  });

  const pinStage = document.querySelector(".pin__stage");
  if (pinStage) {
    gsap.to(".pin__content", {
      opacity: 0,
      y: -40,
      ease: "none",
      scrollTrigger: {
        trigger: ".section--pin",
        start: "top top",
        end: "+=100%",
        pin: pinStage,
        scrub: 0.6,
      },
    });
  }

  gsap.to(".card__media", {
    yPercent: -8,
    ease: "none",
    scrollTrigger: {
      trigger: ".gallery",
      start: "top bottom",
      end: "bottom top",
      scrub: true,
    },
  });
}

export function initScrollDrivenScene(setProgress) {
  ScrollTrigger.create({
    trigger: "main",
    start: "top top",
    end: "bottom bottom",
    onUpdate: (self) => setProgress(self.progress),
  });
}
