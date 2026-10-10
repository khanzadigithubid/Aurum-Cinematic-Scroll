import * as THREE from "three";

function hsl(h, s, l) {
  return `hsl(${h}, ${s}%, ${l}%)`;
}

function createCanvas(w, h) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  return canvas;
}

export function createGradientTexture({
  colors = ["#0a0a0b", "#3a2fff"],
  angle = 135,
  width = 800,
  height = 1000,
  blobs = [],
} = {}) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  const rad = (angle * Math.PI) / 180;
  const grad = ctx.createLinearGradient(
    0,
    0,
    Math.cos(rad) * width,
    Math.sin(rad) * height
  );
  colors.forEach((c, i) => {
    grad.addColorStop(colors.length === 1 ? 0 : i / (colors.length - 1), c);
  });
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  blobs.forEach(({ x, y, r, color }) => {
    const rg = ctx.createRadialGradient(
      x * width,
      y * height,
      0,
      x * width,
      y * height,
      r * width
    );
    rg.addColorStop(0, color);
    rg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, width, height);
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}

const GALLERY_TEXTURES = [
  {
    colors: ["#0a0a0b", "#3a2fff", "#0a0a0b"],
    angle: 120,
    blobs: [
      { x: 0.3, y: 0.2, r: 0.6, color: "#3a2fff" },
      { x: 0.82, y: 0.9, r: 0.5, color: "rgba(216,255,62,0.35)" },
    ],
  },
  {
    colors: ["#ff5e00", "#0a0a0b", "#ff2f6d"],
    angle: 40,
    blobs: [{ x: 0.7, y: 0.25, r: 0.55, color: "#ff2f6d" }],
  },
  {
    colors: ["#0a0a0b", "#1b3a4b", "#d8ff3e"],
    angle: 135,
    blobs: [{ x: 0.2, y: 0.85, r: 0.5, color: "rgba(216,255,62,0.4)" }],
  },
];

export function createGalleryTexture(index) {
  return createGradientTexture(
    GALLERY_TEXTURES[index % GALLERY_TEXTURES.length]
  );
}

export function createHelixTextures(count) {
  const textures = [];
  for (let i = 0; i < count; i++) {
    const hue = (i / count) * 300 + 150;
    textures.push(
      createGradientTexture({
        colors: ["#0a0a0b", hsl(hue, 70, 45), "#0a0a0b"],
        angle: 90 + i * 15,
        blobs: [
          {
            x: 0.35 + Math.random() * 0.3,
            y: 0.3 + Math.random() * 0.4,
            r: 0.5,
            color: hsl(hue + 40, 85, 60),
          },
        ],
      })
    );
  }
  return textures;
}

const loader = new THREE.TextureLoader();
loader.setCrossOrigin("anonymous");

/**
 * Load a photo texture. Resolves with the loaded texture, or the provided
 * fallback texture if the URL is missing/blocked — so the site never breaks.
 */
export function loadImageTexture(url, fallback) {
  return new Promise((resolve) => {
    if (!url) {
      resolve(fallback);
      return;
    }
    loader.load(
      url,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = 4;
        resolve(texture);
      },
      undefined,
      () => resolve(fallback)
    );
  });
}

/** Load a list of image URLs with per-index procedural fallbacks. */
export function loadImageTextures(urls, makeFallback) {
  return Promise.all(
    urls.map((url, i) => loadImageTexture(url, makeFallback(i)))
  );
}
