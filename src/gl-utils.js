/**
 * Attach WebGL context loss/restore handling to a renderer so the scene
 * recovers gracefully instead of freezing on GPU resets or driver crashes.
 */
export function handleContextLoss(renderer, label = "webgl") {
  const canvas = renderer.domElement;

  const onLost = (event) => {
    event.preventDefault();
    console.warn(`[${label}] WebGL context lost — awaiting restore.`);
  };

  const onRestore = () => {
    console.warn(`[${label}] WebGL context restored.`);
  };

  canvas.addEventListener("webglcontextlost", onLost, false);
  canvas.addEventListener("webglcontextrestored", onRestore, false);

  return () => {
    canvas.removeEventListener("webglcontextlost", onLost);
    canvas.removeEventListener("webglcontextrestored", onRestore);
  };
}
