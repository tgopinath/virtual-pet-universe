// Tiny synthesized sound engine — no audio files, so every sound is replaceable later.
let ctx: AudioContext | null = null
let master: GainNode | null = null
let musicGain: GainNode | null = null
let sfxGain: GainNode | null = null
let musicTimer: number | null = null
let musicNotes: number[] = [523, 587, 659, 784, 880]

const settings = { volume: 0.7, music: true, sfx: true }

function ensure() {
  if (ctx) return ctx
  const AC = window.AudioContext || (window as any).webkitAudioContext
  if (!AC) return null
  ctx = new AC()
  master = ctx.createGain()
  musicGain = ctx.createGain()
  sfxGain = ctx.createGain()
  musicGain.connect(master)
  sfxGain.connect(master)
  master.connect(ctx.destination)
  applySettings()
  return ctx
}

function applySettings() {
  if (!master || !musicGain || !sfxGain) return
  master.gain.value = settings.volume
  musicGain.gain.value = settings.music ? 0.16 : 0
  sfxGain.gain.value = settings.sfx ? 0.5 : 0
}

export function configureAudio(s: Partial<typeof settings>) {
  Object.assign(settings, s)
  applySettings()
  if (settings.music) startMusic()
  else stopMusic()
}

function tone(freq: number, dur = 0.12, type: OscillatorType = 'sine', when = 0, vol = 0.6, slideTo?: number) {
  const c = ensure()
  if (!c || !sfxGain || !settings.sfx) return
  if (c.state === 'suspended') c.resume()
  const t = c.currentTime + when
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, t)
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(vol, t + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g).connect(sfxGain)
  o.start(t)
  o.stop(t + dur + 0.02)
}

function noise(dur = 0.08, vol = 0.3, when = 0) {
  const c = ensure()
  if (!c || !sfxGain || !settings.sfx) return
  const buf = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length)
  const src = c.createBufferSource()
  const g = c.createGain()
  const f = c.createBiquadFilter()
  f.type = 'bandpass'
  f.frequency.value = 1200
  g.gain.value = vol
  src.buffer = buf
  src.connect(f).connect(g).connect(sfxGain)
  src.start(c.currentTime + when)
}

export const sfx = {
  tap: () => tone(880, 0.06, 'triangle', 0, 0.35),
  pop: () => tone(600, 0.09, 'sine', 0, 0.5, 1400),
  coin: () => { tone(988, 0.08, 'square', 0, 0.18); tone(1319, 0.16, 'square', 0.07, 0.18) },
  chew: () => { noise(0.06, 0.35); noise(0.06, 0.35, 0.16); noise(0.06, 0.35, 0.32) },
  splash: () => { noise(0.25, 0.4); tone(400, 0.2, 'sine', 0.05, 0.2, 900) },
  jump: () => tone(300, 0.18, 'square', 0, 0.15, 700),
  step: () => noise(0.03, 0.15),
  error: () => { tone(220, 0.12, 'sawtooth', 0, 0.15); tone(180, 0.18, 'sawtooth', 0.1, 0.15) },
  success: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.18, 'triangle', i * 0.09, 0.35)),
  levelUp: () => [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => tone(f, 0.22, 'triangle', i * 0.08, 0.35)),
  evolve: () => [392, 494, 587, 784, 988, 1175, 1568].forEach((f, i) => tone(f, 0.35, 'sine', i * 0.12, 0.4)),
  whoosh: () => tone(200, 0.3, 'sine', 0, 0.25, 1200),
  snore: () => tone(140, 0.6, 'sine', 0, 0.2, 110),
  voice: (pitches: number[]) => pitches.forEach((p, i) => tone(p * (0.95 + Math.random() * 0.1), 0.12, 'sine', i * 0.1, 0.45, p * 1.15)),
}

export function setMusicWorld(notes: number[]) {
  musicNotes = notes
}

function startMusic() {
  const c = ensure()
  if (!c || !musicGain || musicTimer !== null) return
  let step = 0
  const pattern = [0, 2, 4, 2, 1, 3, 4, 3, 0, 2, 4, 1, 3, 2, 1, 0]
  musicTimer = window.setInterval(() => {
    if (!ctx || !musicGain || ctx.state !== 'running') return
    const t = ctx.currentTime
    const n = musicNotes[pattern[step % pattern.length]] / 2
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'triangle'
    o.frequency.value = n
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.5, t + 0.03)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5)
    o.connect(g).connect(musicGain)
    o.start(t)
    o.stop(t + 0.55)
    if (step % 4 === 0) {
      const b = ctx.createOscillator()
      const bg = ctx.createGain()
      b.frequency.value = musicNotes[0] / 4
      bg.gain.setValueAtTime(0.4, t)
      bg.gain.exponentialRampToValueAtTime(0.0001, t + 1)
      b.connect(bg).connect(musicGain)
      b.start(t)
      b.stop(t + 1.05)
    }
    step++
  }, 320)
}

function stopMusic() {
  if (musicTimer !== null) clearInterval(musicTimer)
  musicTimer = null
}

/** Browsers need a user gesture before audio can play. */
export function unlockAudio() {
  const c = ensure()
  if (c && c.state === 'suspended') c.resume()
  if (settings.music) startMusic()
}
