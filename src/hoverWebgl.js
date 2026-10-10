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
  uniform sampler2D uTexture;
  uniform float uTime;
  uniform float uProgress;
  uniform float uVelocity;
  uniform vec2 uMouse;
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

  void main() {
    vec2 uv = vUv;
    vec2 center = uv - 0.5;

    float n = noise(uv * 3.0 + uTime * 0.25);
    float dissolve = uProgress;

    vec2 distorted = uv + center * (1.0 - dissolve) * 0.35;
    distorted += (n - 0.5) * 0.06 * uVelocity;

    float split = 0.012 * uVelocity * 0.5;
    float r = texture2D(uTexture, distorted + vec2(split, 0.0)).r;
    float g = texture2D(uTexture, distorted).g;
    float b = texture2D(uTexture, distorted - vec2(split, 0.0)).b;
    vec3 color = vec3(r, g, b);

    float dist = distance(uv, uMouse);
    float glow = smoothstep(0.6, 0.0, dist) * (0.25 + uProgress * 0.5);
    color += vec3(0.847, 1.0, 0.243) * glow * 0.35;

    float edge = smoothstep(0.0, 0.08, (uv.x)) *
                 smoothstep(1.0, 0.92, (uv.x)) *
                 smoothstep(0.0, 0.08, (uv.y)) *
                 smoothstep(1.0, 0.92, (uv.y));

    gl_FragColor = vec4(color, edge);
  }
`;

export function initHoverWebgl(cards) {
  if (!cards.length) return null;
  if (window.matchMedia("(pointer: coarse)").matches) return null;

  const canvas = document.createElement("canvas");
  canvas.className = "webgl-hover";
  document.body.appendChild(canvas);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const detachContextLoss = handleContextLoss(renderer, "hover");

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(0, 1, 1, 0, 0, 1);

  const uniforms = {
    uTexture: { value: null },
    uTime: { value: 0 },
    uProgress: { value: 0 },
    uVelocity: { value: 0 },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
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
  plane.visible = false;
  scene.add(plane);

  const state = {
    active: false,
    targetRect: null,
    progress: 0,
    velocity: 0,
    lastPointer: { x: 0, y: 0 },
  };

  const resize = () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  };
  window.addEventListener("resize", resize);

  window.addEventListener("pointermove", (e) => {
    const dx = e.clientX - state.lastPointer.x;
    const dy = e.clientY - state.lastPointer.y;
    state.lastPointer.x = e.clientX;
    state.lastPointer.y = e.clientY;
    const speed = Math.min(Math.sqrt(dx * dx + dy * dy) / 40, 1);
    state.velocity = Math.max(state.velocity * 0.85, speed);
  });

  const loop = () => {
    const rect = state.targetRect;
    if (plane.visible && rect) {
      const nx = rect.left / window.innerWidth;
      const ny = 1 - (rect.top + rect.height) / window.innerHeight;
      const nw = rect.width / window.innerWidth;
      const nh = rect.height / window.innerHeight;

      plane.scale.set(nw, nh, 1);
      plane.position.set(nx + nw / 2, ny + nh / 2, 0);

      uniforms.uProgress.value = state.progress;
      uniforms.uVelocity.value = state.velocity;
      uniforms.uTime.value += 0.016;

      const mx = (state.lastPointer.x - rect.left) / rect.width;
      const my = 1 - (state.lastPointer.y - rect.top) / rect.height;
      uniforms.uMouse.value.set(
        THREE.MathUtils.clamp(mx, 0, 1),
        THREE.MathUtils.clamp(my, 0, 1)
      );

      state.velocity *= 0.9;

      renderer.render(scene, camera);
    }
    frameId = requestAnimationFrame(loop);
  };
  let frameId = requestAnimationFrame(loop);

  const show = (card, texture) => {
    const media = card.querySelector(".card__media");
    const rect = media.getBoundingClientRect();
    state.targetRect = rect;
    state.lastPointer.x = rect.left + rect.width / 2;
    state.lastPointer.y = rect.top + rect.height / 2;

    if (uniforms.uTexture.value !== texture) {
      uniforms.uTexture.value = texture;
    }
    plane.visible = true;
    canvas.classList.add("is-active");

    gsap.to(state, {
      progress: 1,
      duration: 1,
      ease: "power3.out",
    });
  };

  const hide = () => {
    gsap.to(state, {
      progress: 0,
      duration: 0.6,
      ease: "power2.in",
      onComplete: () => {
        plane.visible = false;
        state.targetRect = null;
        canvas.classList.remove("is-active");
      },
    });
  };

  const dispose = () => {
    cancelAnimationFrame(frameId);
    window.removeEventListener("resize", resize);
    detachContextLoss();
    plane.geometry.dispose();
    plane.material.dispose();
    renderer.dispose();
    canvas.remove();
  };

  return { show, hide, dispose };
}
