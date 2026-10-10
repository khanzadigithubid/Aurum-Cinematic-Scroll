import * as THREE from "three";
import { handleContextLoss } from "./gl-utils.js";

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  uniform float uHover;
  uniform float uReveal;
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vNormal;

  void main() {
    vec2 uv = vUv;
    float wave = sin(uv.y * 20.0 + uTime * 2.0) * 0.008 * uHover;
    vec2 warped = uv + vec2(wave, 0.0);

    float split = 0.006 * uHover;
    float r = texture2D(uTexture, warped + vec2(split, 0.0)).r;
    float g = texture2D(uTexture, warped).g;
    float b = texture2D(uTexture, warped - vec2(split, 0.0)).b;
    vec3 color = vec3(r, g, b);

    float fresnel = pow(1.0 - abs(vNormal.z), 2.0);
    color = mix(color, vec3(0.847, 1.0, 0.243), fresnel * 0.15 * (0.4 + uHover));

    float border = min(min(uv.x, 1.0 - uv.x), min(uv.y, 1.0 - uv.y));
    color += vec3(0.847, 1.0, 0.243) * smoothstep(0.012, 0.0, border) * uHover;

    float alpha = smoothstep(0.0, 0.4, uReveal);
    gl_FragColor = vec4(color, alpha);
  }
`;

export function initHelix(canvas, textures) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, 0, 9);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  const detachContextLoss = handleContextLoss(renderer, "helix");

  const COUNT = textures.length;
  const RADIUS = 3.4;
  const HEIGHT = 9;

  const cards = [];
  const geometry = new THREE.PlaneGeometry(1.7, 2.1, 24, 24);

  for (let i = 0; i < COUNT; i++) {
    const t = i / COUNT;
    const angle = t * Math.PI * 2 * 1.5;
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTexture: { value: textures[i] },
        uHover: { value: 0 },
        uReveal: { value: 0 },
        uTime: { value: 0 },
      },
      transparent: true,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData = {
      base: new THREE.Vector3(
        Math.cos(angle) * RADIUS,
        (t - 0.5) * HEIGHT,
        Math.sin(angle) * RADIUS
      ),
      angle,
      index: i,
    };
    scene.add(mesh);
    cards.push(mesh);
  }

  const pointer = new THREE.Vector2(-10, -10);
  const raycaster = new THREE.Raycaster();

  canvas.addEventListener("pointermove", (e) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  });
  canvas.addEventListener("pointerleave", () => {
    pointer.set(-10, -10);
  });

  let scrollProgress = 0;
  let reveal = 0;
  const clock = new THREE.Clock();

  const render = () => {
    const t = clock.getElapsedTime();
    const rot = scrollProgress * Math.PI * 2;
    const unfold = THREE.MathUtils.smoothstep(scrollProgress, 0.65, 0.95);

    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(cards);
    const hovered = hits.length ? hits[0].object : null;

    cards.forEach((card) => {
      const u = card.userData;
      const i = u.index;
      const base = u.base.clone();

      const dist = i / (COUNT - 1);
      const localReveal = THREE.MathUtils.clamp(
        (reveal - dist * 0.4) / 0.6,
        0,
        1
      );
      card.material.uniforms.uReveal.value = localReveal;
      card.material.uniforms.uTime.value = t;

      const gridX = ((i % 3) - 1) * 1.8;
      const gridY = (Math.floor(i / 3) - 1) * 2.2;
      const gridZ = 0;

      const spinZ = Math.sin(u.angle + rot) * 0.4;
      const spunX = base.x * Math.cos(rot) - base.z * Math.sin(rot);
      const spunZ = base.x * Math.sin(rot) + base.z * Math.cos(rot);

      const posX = THREE.MathUtils.lerp(spunX, gridX, unfold);
      const posY = THREE.MathUtils.lerp(base.y, gridY, unfold);
      const posZ = THREE.MathUtils.lerp(spunZ, gridZ, unfold);

      const scale = THREE.MathUtils.lerp(1, 0.85, unfold);
      const wantHover = hovered === card && localReveal > 0.9;
      u.hoverAmt = THREE.MathUtils.lerp(
        u.hoverAmt || 0,
        wantHover ? 1 : 0,
        0.12
      );

      const hoverScale = 1 + u.hoverAmt * 0.12;
      card.scale.setScalar(scale * hoverScale * (0.4 + localReveal * 0.6));
      card.position.set(posX, posY, posZ + u.hoverAmt * 0.8);

      const face = Math.atan2(spunX, spunZ);
      card.rotation.y = face + u.hoverAmt * -face * 0.5;
      card.rotation.z = spinZ * (1 - unfold);

      card.material.uniforms.uHover.value = u.hoverAmt;
      card.material.depthWrite = false;
    });

    cards.sort((a, b) => b.position.z - a.position.z);
    camera.position.z = 9 - unfold * 1.5;
    camera.rotation.z = Math.sin(t * 0.1) * 0.02;

    renderer.render(scene, camera);
  };

  const setProgress = (p) => {
    scrollProgress = p;
    reveal = Math.min(1, Math.max(reveal, p * 2.4));
  };

  const onResize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  window.addEventListener("resize", onResize);

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const dispose = () => {
    window.removeEventListener("resize", onResize);
    detachContextLoss();
    geometry.dispose();
    cards.forEach((card) => card.material.dispose());
    renderer.dispose();
  };

  return { render, setProgress, reduced, dispose };
}
