import gsap from "gsap";

export function initCursor() {
  const cursor = document.querySelector(".cursor");
  if (!cursor || window.matchMedia("(pointer: coarse)").matches) return;

  const dot = cursor.querySelector(".cursor__dot");
  const ring = cursor.querySelector(".cursor__ring");
  const label = cursor.querySelector(".cursor__label");

  const dotX = gsap.quickTo(dot, "x", { duration: 0.1, ease: "power3" });
  const dotY = gsap.quickTo(dot, "y", { duration: 0.1, ease: "power3" });
  const ringX = gsap.quickTo(ring, "x", { duration: 0.5, ease: "power3" });
  const ringY = gsap.quickTo(ring, "y", { duration: 0.5, ease: "power3" });
  const labelX = gsap.quickTo(label, "x", { duration: 0.5, ease: "power3" });
  const labelY = gsap.quickTo(label, "y", { duration: 0.5, ease: "power3" });

  window.addEventListener("pointermove", (e) => {
    dotX(e.clientX);
    dotY(e.clientY);
    ringX(e.clientX);
    ringY(e.clientY);
    labelX(e.clientX);
    labelY(e.clientY);
  });

  document.querySelectorAll("[data-cursor]").forEach((el) => {
    const type = el.dataset.cursor;
    el.addEventListener("pointerenter", () => {
      cursor.classList.add(`is-${type}`);
      label.textContent = type === "view" ? "View" : "";
    });
    el.addEventListener("pointerleave", () => {
      cursor.classList.remove(`is-${type}`);
      label.textContent = "";
    });
  });

  document.querySelectorAll("[data-magnetic]").forEach((el) => {
    const strength = 0.35;
    const xTo = gsap.quickTo(el, "x", {
      duration: 0.5,
      ease: "elastic.out(1, 0.4)",
    });
    const yTo = gsap.quickTo(el, "y", {
      duration: 0.5,
      ease: "elastic.out(1, 0.4)",
    });

    el.addEventListener("pointermove", (e) => {
      const rect = el.getBoundingClientRect();
      xTo((e.clientX - (rect.left + rect.width / 2)) * strength);
      yTo((e.clientY - (rect.top + rect.height / 2)) * strength);
    });

    el.addEventListener("pointerleave", () => {
      xTo(0);
      yTo(0);
    });
  });
}
