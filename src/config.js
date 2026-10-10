/**
 * Central config. Swap these to art-direct the experience with real assets.
 *
 * Image fields accept any URL (absolute, or relative to /public).
 * If a photo fails to load the module falls back to a procedural gradient,
 * so the site never breaks because of a missing asset.
 */
export const config = {
  brand: "AURUM",
  email: "hello@example.com",
  audio: {
    enabledByDefault: false,
  },
  gallery: [
    { title: "Nebula", tag: "WebGL / Shader", image: "/images/gallery-1.jpg" },
    { title: "Drift", tag: "Scroll / GSAP", image: "/images/gallery-2.jpg" },
    {
      title: "Prism",
      tag: "GLSL / Displacement",
      image: "/images/gallery-3.jpg",
    },
  ],
  helix: [
    "/images/helix-1.jpg",
    "/images/helix-2.jpg",
    "/images/helix-3.jpg",
    "/images/helix-4.jpg",
    "/images/helix-5.jpg",
    "/images/helix-6.jpg",
    "/images/helix-7.jpg",
    "/images/helix-8.jpg",
    "/images/helix-9.jpg",
  ],
};
