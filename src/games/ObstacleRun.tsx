import { useEffect, useRef, useState } from 'react'
import PetArt from '../components/PetArt'
import { sfx } from '../lib/audio'
import type { GameProps } from './common'

interface Ob { id: number; x: number; h: number; e: string; passed: boolean; broken?: boolean }

const ROCKS: Record<string, string[]> = {
  garden: ['🪨', '🌵', '🪵'], snow: ['🧊', '⛄', '🪨'], tropical: ['🦀', '🥥', '🪨'],
  forest: ['🍄', '🪵', '🌿'], space: ['☄️', '🪨', '🛸'], dragon: ['🔥', '🪨', '🌋'],
}

export default function ObstacleRun({ pet, world, level, onEnd }: GameProps) {
  const target = 8 + Math.min(level, 10)
  const low = world === 'space'
  const G = low ? 1500 : 2600
  const JUMP = (pet.species === 'bunny' ? 980 : 880) * (low ? 0.82 : 1)
  const [, force] = useState(0)
  const st = useRef({ y: 0, vy: 0, obs: [] as Ob[], speed: 38, t: 0, nextAt: 1.2, score: 0, over: false, shield: pet.species === 'dragon', id: 0 })
  const done = useRef(false)

  const jump = () => {
    const s = st.current
    if (s.over || s.y > 2) return
    s.vy = JUMP
    sfx.jump()
  }

  useEffect(() => {
    let raf = 0
    let last = performance.now()
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const s = st.current
      if (!s.over) {
        s.t += dt
        s.speed = 38 + s.t * 1.6 + level
        s.vy -= G * dt
        s.y = Math.max(0, s.y + s.vy * dt)
        if (s.y === 0) s.vy = 0
        if (s.t >= s.nextAt) {
          const set = ROCKS[world] ?? ROCKS.garden
          s.obs.push({ id: s.id++, x: 105, h: 40 + Math.random() * 22, e: set[Math.floor(Math.random() * set.length)], passed: false })
          s.nextAt = s.t + Math.max(0.85, 1.9 - s.t * 0.02) + Math.random() * 0.8
        }
        s.obs.forEach((o) => {
          o.x -= s.speed * dt
          // pet occupies x 12%–24%
          if (!o.passed && !o.broken && o.x < 22 && o.x > 10 && s.y < o.h - 8) {
            if (s.shield) { s.shield = false; o.broken = true; sfx.pop() }
            else { s.over = true; sfx.error() }
          }
          if (!o.passed && o.x < 10) { o.passed = true; s.score++; sfx.coin() }
        })
        s.obs = s.obs.filter((o) => o.x > -10)
        force((n) => n + 1)
      } else if (!done.current) {
        done.current = true
        setTimeout(() => onEnd(s.score, s.score >= target), 900)
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    const key = (e: KeyboardEvent) => { if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); jump() } }
    window.addEventListener('keydown', key)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('keydown', key) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const s = st.current
  const sky = world === 'space' ? 'linear-gradient(#1b1d4f,#3b3f9e)' : world === 'snow' ? 'linear-gradient(#c9d8ff,#f2f6ff)' : world === 'dragon' ? 'linear-gradient(#ff9a6b,#ffe0b8)' : 'linear-gradient(#9fd8ff,#eafaff)'
  return (
    <div className="select-none">
      <div className="flex justify-between font-display font-bold text-lg px-2">
        <span>Score: {s.score} / {target}</span>
        <span>{s.shield ? '🔥 Flame Dash ready' : `Speed ${Math.round(s.speed)}`}</span>
      </div>
      <div className="relative h-[52vh] max-h-[420px] mt-2 rounded-3xl overflow-hidden touch-none cursor-pointer" style={{ background: sky }}
        onPointerDown={jump} role="button" aria-label="Tap to jump" tabIndex={0}>
        <div className="absolute bottom-0 inset-x-0 h-[22%]" style={{ background: world === 'space' ? '#5f55a8' : world === 'snow' ? '#fff' : world === 'dragon' ? '#a86a4a' : '#6cc95a' }} />
        <div className="absolute bottom-[22%] left-[12%]" style={{ transform: `translateY(${-s.y * 0.5}px) rotate(${s.y > 2 ? -10 : 0}deg)` }}>
          <PetArt pet={pet} mood={s.over ? 'sad' : 'happy'} size={88} />
        </div>
        {s.obs.map((o) => (
          <div key={o.id} className="absolute bottom-[22%] text-5xl leading-none" style={{ left: `${o.x}%`, opacity: o.broken ? 0.2 : 1 }}>{o.e}</div>
        ))}
        {s.over && <div className="absolute inset-0 grid place-items-center bg-white/30 font-display font-bold text-4xl text-white drop-shadow-[0_3px_0_rgba(0,0,0,.3)]">{s.score >= target ? 'You did it! 🏆' : 'Bonk! 💫'}</div>}
        {s.t < 2 && !s.over && <div className="absolute inset-x-0 top-6 text-center font-display font-bold text-2xl text-white drop-shadow">Tap to jump!</div>}
      </div>
      <button className="btn btn-blue w-full mt-4 text-2xl min-h-16" onPointerDown={(e) => { e.preventDefault(); jump() }}>JUMP ⬆️</button>
    </div>
  )
}
