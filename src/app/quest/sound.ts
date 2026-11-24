/**
 * Tiny synthesized sound effects: no audio files to download, nothing leaves
 * the browser.
 */
let ctx: AudioContext | null = null;
let muted = false;

export const setMuted = (value: boolean) => {
  muted = value;
};

function audio() {
  if (muted) return null;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, start: number, duration: number, type: OscillatorType = "triangle", volume = 0.12) {
  const ac = audio();
  if (!ac) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t = ac.currentTime + start;
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(volume, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
  osc.connect(gain).connect(ac.destination);
  osc.start(t);
  osc.stop(t + duration + 0.05);
}

export const sfx = {
  open: () => {
    tone(392, 0, 0.12);
    tone(523, 0.08, 0.16);
  },
  correct: (stars: number) => {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.25));
    for (let i = 0; i < stars; i++) tone(1568, 0.45 + i * 0.14, 0.18, "sine", 0.1);
  },
  wrong: () => {
    tone(220, 0, 0.18, "sawtooth", 0.05);
    tone(185, 0.12, 0.25, "sawtooth", 0.05);
  },
  gate: () => [392, 494, 587, 784].forEach((f, i) => tone(f, i * 0.12, 0.3, "square", 0.05)),
  fanfare: () =>
    [523, 523, 523, 659, 784, 659, 784, 1047].forEach((f, i) =>
      tone(f, i * 0.15, i === 7 ? 0.8 : 0.2, "square", 0.06),
    ),
  bump: () => tone(110, 0, 0.06, "sine", 0.05),
  jump: () => {
    tone(330, 0, 0.08, "sine", 0.07);
    tone(494, 0.05, 0.1, "sine", 0.07);
  },
  select: () => tone(660, 0, 0.1, "triangle", 0.1),
  unselect: () => tone(330, 0, 0.1, "triangle", 0.08),
};
