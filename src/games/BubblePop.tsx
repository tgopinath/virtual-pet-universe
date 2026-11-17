import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import PetArt from '../components/PetArt'
import { sfx } from '../lib/audio'
import type { GameProps } from './common'

interface B { id: number; x: number; y: number; r: number; v: number; kind: 'n' | 'gold' | 'spike' }
const DURATION = 30

export default function BubblePop({ pet, world, onEnd }: GameProps) {
  const snow = world === 'snow'
  const mult = pet.species === 'kitten' ? 1.2 : 1
  const [, force] = useState(0)
  const [pops, setPops] = useState<{ id: number; x: number; y: number; t: string }[]>([])
  const s = useRef({ bubbles: [] as B[], t: 0, next: 0, score: 0, id: 0, over: false })
  const ended = useRef(false)
  const [react, setReact] = useState<'happy' | 'sad' | 'normal'>('normal')

  useEffect(() => {
    let raf = 0
    let last = performance.now()
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const g = s.current
      if (!g.over) {
        g.t += dt
        if (g.t >= g.next) {
          const roll = Math.random()
          g.bubbles.push({ id: g.id++, x: 5 + Math.random() * 85, y: snow ? -10 : 110, r: 9 + Math.random() * 7, v: 14 + Math.random() * 12 + g.t * 0.6, kind: roll < 0.1 ? 'gold' : roll < 0.22 ? 'spike' : 'n' })
          g.next = g.t + Math.max(0.28, 0.7 - g.t * 0.012)
        }
        g.bubbles.forEach((b) => (b.y += (snow ? 1 : -1) * b.v * dt))
        g.bubbles = g.bubbles.filter((b) => b.y > -20 && b.y < 120)
        if (g.t >= DURATION) g.over = true
        force((n) => n + 1)
      } else if (!ended.current) {
        ended.current = true
        const final = Math.round(g.score * mult)
        setTimeout(() => onEnd(final, final >= 25), 600)
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const pop = (b: B) => {
    const g = s.current
    if (g.over) return
    g.bubbles = g.bubbles.filter((x) => x.id !== b.id)
    const pts = b.kind === 'gold' ? 5 : b.kind === 'spike' ? -3 : 1
    g.score = Math.max(0, g.score + pts)
    b.kind === 'spike' ? sfx.error() : sfx.pop()
    setReact(b.kind === 'spike' ? 'sad' : 'happy')
    setTimeout(() => setReact('normal'), 400)
    setPops((p) => [...p, { id: b.id, x: b.x, y: b.y, t: pts > 0 ? `+${pts}` : `${pts}` }])
    setTimeout(() => setPops((p) => p.filter((x) => x.id !== b.id)), 600)
  }

  const g = s.current
  return (
    <div className="select-none">
      <div className="flex justify-between font-display font-bold text-lg px-2">
        <span>Score: {Math.round(g.score * mult)}</span><span>⏱ {Math.max(0, Math.ceil(DURATION - g.t))}s</span>
      </div>
      <div className="relative h-[56vh] max-h-[460px] mt-2 rounded-3xl overflow-hidden touch-none" style={{ background: snow ? 'linear-gradient(#b7c9ff,#f6f9ff)' : 'linear-gradient(#a8ecff,#e0f7ff)' }}>
        {g.bubbles.map((b) => (
          <button key={b.id} onPointerDown={() => pop(b)} aria-label={b.kind === 'spike' ? 'Spiky bubble' : 'Bubble'}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full grid place-items-center"
            style={{
              left: `${b.x}%`, top: `${b.y}%`, width: `${b.r * 0.5}rem`, height: `${b.r * 0.5}rem`, fontSize: `${b.r * 0.22}rem`,
              background: snow ? 'transparent' : b.kind === 'gold' ? 'radial-gradient(circle at 30% 30%,#fff,#ffd23f)' : b.kind === 'spike' ? 'radial-gradient(circle at 30% 30%,#fff,#a3e635)' : 'radial-gradient(circle at 30% 30%,#ffffffee,#7ad7ff66)',
              border: snow ? 'none' : '2px solid #ffffffaa',
            }}>
            {snow ? (b.kind === 'gold' ? '🌟' : b.kind === 'spike' ? '🌵' : '❄️') : b.kind === 'spike' ? '🌵' : b.kind === 'gold' ? '⭐' : ''}
          </button>
        ))}
        {pops.map((p) => (
          <motion.div key={p.id} className="absolute font-display font-bold text-2xl pointer-events-none" style={{ left: `${p.x}%`, top: `${p.y}%`, color: p.t.startsWith('-') ? '#ef4444' : '#f59e0b' }} initial={{ y: 0, opacity: 1 }} animate={{ y: -40, opacity: 0 }}>{p.t}</motion.div>
        ))}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none"><PetArt pet={pet} mood={react} size={100} look={0} /></div>
        {g.over && <div className="absolute inset-0 grid place-items-center bg-white/40 font-display font-bold text-4xl">Time! ⏰</div>}
      </div>
    </div>
  )
}
