/**
 * Ambient interaction sound, fully synthesised with the Web Audio API —
 * no audio files required. Disabled by default (browsers block audio until
 * a user gesture) and toggled from the nav.
 */
export function initAudio() {
  const toggle = document.querySelector(".sound-toggle");
  if (!toggle) return null;

  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) {
    toggle.hidden = true;
    return null;
  }

  const ctx = new AudioCtx();
  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  const createVoice = () => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 220;
    gain.gain.value = 0;
    osc.connect(gain).connect(master);
    osc.start();
    return { osc, gain };
  };

  const voices = Array.from({ length: 4 }, createVoice);

  let enabled = false;

  const blip = (freq, dur = 0.12, type = "sine") => {
    if (!enabled || ctx.state !== "running") return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    osc.connect(gain).connect(master);
    osc.start(now);
    osc.stop(now + dur + 0.02);
  };

  // Soft pad that drifts with scroll velocity.
  const setScrollDrone = (velocity) => {
    voices.forEach((voice, i) => {
      const scale = [130.81, 164.81, 196.0, 246.94];
      voice.osc.frequency.setTargetAtTime(
        scale[i] * (1 + velocity * 0.05),
        ctx.currentTime,
        0.2
      );
      voice.gain.gain.setTargetAtTime(
        enabled ? 0.02 + velocity * 0.05 : 0,
        ctx.currentTime,
        0.3
      );
    });
  };

  const hover = () => blip(880 + Math.random() * 220, 0.08, "triangle");
  const click = () => blip(523.25, 0.18, "sine");

  const enable = async () => {
    if (ctx.state === "suspended") await ctx.resume();
    enabled = true;
    toggle.setAttribute("aria-pressed", "true");
    toggle.classList.add("is-on");
    rampMaster(0.6);
  };

  const disable = () => {
    enabled = false;
    toggle.setAttribute("aria-pressed", "false");
    toggle.classList.remove("is-on");
    rampMaster(0);
  };

  const rampMaster = (value) => {
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setTargetAtTime(value, now, 0.25);
  };

  toggle.setAttribute("aria-pressed", "false");
  toggle.setAttribute("aria-label", "Toggle sound");
  toggle.addEventListener("click", () => (enabled ? disable() : enable()));

  document
    .querySelectorAll("[data-magnetic], .btn")
    .forEach((el) => el.addEventListener("pointerenter", hover));
  document.querySelectorAll(".menu__link").forEach((el) => {
    el.addEventListener("pointerenter", hover);
    el.addEventListener("click", click);
  });

  const dispose = () => {
    ctx.close();
  };

  return {
    enable,
    disable,
    setScrollDrone,
    blip,
    dispose,
    isEnabled: () => enabled,
  };
}
