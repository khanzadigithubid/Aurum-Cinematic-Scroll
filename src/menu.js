import * as THREE from "three";
import gsap from "gsap";
import { handleContextLoss } from "./gl-utils.js";

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uProgress;
  uniform float uHover;
  uniform float uClick;
  uniform vec2 uOrigin;
  uniform vec3 uColor;
  uniform float uAspect;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p *= 2.0;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    vec2 delta = (uv - uOrigin) * vec2(uAspect, 1.0);
    float dist = length(delta);

    float amplitude = 0.12 + 0.18 * uClick + uHover * 0.02;
    float n = fbm(uv * 3.5 + uProgress * 1.2) * amplitude;

    float radius = uProgress * 1.6;
    float edge = radius - dist + n;
    float alpha = smoothstep(0.0, 0.35, edge);

    float rim = smoothstep(0.0, 0.05, edge) * (1.0 - smoothstep(0.05, 0.18, edge));
    vec3 color = uColor + vec3(0.847, 1.0, 0.243) * rim * 0.5;

    gl_FragColor = vec4(color, alpha);
  }
`;

/**
 * Full-screen ink-bleed menu overlay. A noise-based shader bleeds across the
 * viewport from the click origin, revealing the navigation underneath.
 */
export function initMenu() {
  const overlay = document.querySelector(".menu");
  const toggle = document.querySelector(".menu-toggle");
  if (!overlay || !toggle) return null;

  const canvas = overlay.querySelector(".menu__canvas");
  const links = overlay.querySelectorAll(".menu__link");

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const detachContextLoss = handleContextLoss(renderer, "menu");

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(0, 1, 1, 0, 0, 1);

  const uniforms = {
    uProgress: { value: 0 },
    uHover: { value: 0 },
    uClick: { value: 0 },
    uOrigin: { value: new THREE.Vector2(0.5, 0.5) },
    uColor: { value: new THREE.Color("#0a0a0b") },
    uAspect: { value: window.innerWidth / window.innerHeight },
  };

  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      depthTest: false,
    })
  );
  plane.position.set(0.5, 0.5, 0);
  scene.add(plane);

  const state = { open: false, progress: 0 };

  const linkSpans = overlay.querySelectorAll(".menu__link span");
  gsap.set(linkSpans, { yPercent: 120 });

  const loop = () => {
    uniforms.uProgress.value = state.progress;
    uniforms.uHover.value = hover;
    uniforms.uClick.value = click;
    renderer.render(scene, camera);
    frameId = requestAnimationFrame(loop);
  };
  let hover = 0;
  let click = 0;
  let frameId = requestAnimationFrame(loop);

  const onResize = () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    uniforms.uAspect.value = window.innerWidth / window.innerHeight;
  };
  window.addEventListener("resize", onResize);

  window.addEventListener("pointermove", (e) => {
    if (!state.open) {
      hover = 0;
      return;
    }
    hover = 0.4 + Math.sin(e.clientX * 0.02) * 0.1;
  });

  const setOrigin = (e) => {
    const x = e && e.clientX ? e.clientX / window.innerWidth : 0.5;
    const y = e && e.clientY ? 1 - e.clientY / window.innerHeight : 0.5;
    uniforms.uOrigin.value.set(x, y);
  };

  const open = (e) => {
    if (state.open) return;
    state.open = true;
    setOrigin(e);
    document.documentElement.classList.add("menu-open");
    overlay.setAttribute("aria-hidden", "false");
    toggle.setAttribute("aria-expanded", "true");
    renderer.render(scene, camera);

    gsap.to(state, {
      progress: 1,
      duration: 1,
      ease: "power3.inOut",
    });
    gsap.to(linkSpans, {
      yPercent: 0,
      duration: 0.9,
      ease: "power4.out",
      stagger: 0.08,
      delay: 0.35,
    });
  };

  const close = () => {
    if (!state.open) return;
    state.open = false;
    document.documentElement.classList.remove("menu-open");
    overlay.setAttribute("aria-hidden", "true");
    toggle.setAttribute("aria-expanded", "false");

    gsap.to(linkSpans, {
      yPercent: 120,
      duration: 0.5,
      ease: "power3.in",
      stagger: 0.03,
    });

    gsap.to(state, {
      progress: 0,
      duration: 0.8,
      ease: "power3.inOut",
      onComplete: () => {
        renderer.render(scene, camera);
      },
    });
  };

  const toggleMenu = (e) => {
    setOrigin(e);
    click = 1;
    gsap.to(
      { v: 1 },
      {
        v: 0,
        duration: 0.6,
        ease: "power2.out",
        onUpdate: function () {
          click = this.targets()[0].v;
        },
      }
    );
    if (state.open) {
      close();
    } else {
      open(e);
    }
  };

  toggle.addEventListener("click", toggleMenu);
  links.forEach((link) => link.addEventListener("click", close));

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const dispose = () => {
    cancelAnimationFrame(frameId);
    window.removeEventListener("resize", onResize);
    detachContextLoss();
    plane.geometry.dispose();
    plane.material.dispose();
    renderer.dispose();
  };

  return { open, close, toggle: toggleMenu, reduced, dispose };
}
