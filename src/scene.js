import * as THREE from "three";
import { handleContextLoss } from "./gl-utils.js";

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uExplode;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vNormal = normalize(normalMatrix * normal);

    vec3 transformed = position;
    float offset = sin(position.y * 4.0 + uTime * 0.9) * 0.035;
    transformed += normal * (offset + uExplode * 0.45 * sin(position.x * 6.0 + uTime));

    vPosition = transformed;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uProgress;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vec3 base = vec3(0.05, 0.05, 0.055);
    vec3 accent = vec3(0.847, 1.0, 0.243);

    float fresnel = pow(1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0), 2.4);
    float bands = smoothstep(0.4, 0.6, sin(vPosition.y * 8.0 + uTime * 1.4 + uProgress * 6.28));

    vec3 color = base;
    color = mix(color, accent, fresnel * (0.35 + uProgress * 0.55));
    color += accent * bands * fresnel * 0.35;

    gl_FragColor = vec4(color, 1.0);
  }
`;

export function initScene(canvas) {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    42,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, 0, 6);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const detachContextLoss = handleContextLoss(renderer, "scene");

  const uniforms = {
    uTime: { value: 0 },
    uProgress: { value: 0 },
    uExplode: { value: 0 },
  };

  const geometry = new THREE.IcosahedronGeometry(1.5, 6);
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
  });
  const monolith = new THREE.Mesh(geometry, material);
  scene.add(monolith);

  const wire = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.62, 1)),
    new THREE.LineBasicMaterial({
      color: 0xd8ff3e,
      transparent: true,
      opacity: 0.24,
    })
  );
  monolith.add(wire);

  const count = window.innerWidth < 720 ? 220 : 520;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 22;
    positions[i + 1] = (Math.random() - 0.5) * 14;
    positions[i + 2] = (Math.random() - 0.5) * 14 - 4;
  }
  const particlesGeo = new THREE.BufferGeometry();
  particlesGeo.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );
  const particles = new THREE.Points(
    particlesGeo,
    new THREE.PointsMaterial({
      color: 0xf2efe9,
      size: 0.02,
      transparent: true,
      opacity: 0.55,
      sizeAttenuation: true,
    })
  );
  scene.add(particles);

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener("pointermove", (e) => {
    pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.ty = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  let scrollProgress = 0;
  const setScrollProgress = (p) => {
    scrollProgress = p;
  };

  const clock = new THREE.Clock();

  const render = () => {
    const t = clock.getElapsedTime();

    uniforms.uTime.value = t;
    uniforms.uProgress.value = scrollProgress;
    uniforms.uExplode.value = Math.sin(scrollProgress * Math.PI) * 0.6;

    pointer.x += (pointer.tx - pointer.x) * 0.05;
    pointer.y += (pointer.ty - pointer.y) * 0.05;

    monolith.rotation.y = t * 0.14 + scrollProgress * Math.PI * 2.4;
    monolith.rotation.x = pointer.y * 0.35 + scrollProgress * 0.9;
    monolith.rotation.z = pointer.x * 0.18;

    monolith.position.x =
      pointer.x * 0.4 - Math.sin(scrollProgress * Math.PI) * 1.6;
    monolith.position.y = Math.sin(t * 0.6) * 0.12 + scrollProgress * 0.5;

    const scale = 1 + Math.sin(scrollProgress * Math.PI) * 0.35;
    monolith.scale.setScalar(scale);

    camera.position.z = 6 - scrollProgress * 2.2;
    camera.position.x = pointer.x * 0.25;
    camera.position.y = pointer.y * 0.2;
    camera.lookAt(0, 0, 0);

    particles.rotation.y = t * 0.02 + scrollProgress * 0.6;

    renderer.render(scene, camera);
  };

  const onResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  };
  window.addEventListener("resize", onResize);

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const dispose = () => {
    window.removeEventListener("resize", onResize);
    detachContextLoss();
    geometry.dispose();
    material.dispose();
    wire.geometry.dispose();
    wire.material.dispose();
    particlesGeo.dispose();
    particles.material.dispose();
    renderer.dispose();
  };

  return { render, setScrollProgress, reduced, dispose };
}
