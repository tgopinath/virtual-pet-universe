import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { sfx } from '../lib/audio'
import { pairsFor, type GameProps } from './common'

const FACES = ['🐶', '🐱', '🐰', '🐼', '🦊', '🐉', '🐧', '🦄', '🦴', '🐟', '🥕', '🍎']
const RUNES = ['🔥', '💎', '🌋', '🪙', '🛡️', '⚔️', '🏺', '🗝️', '🐲', '👑']
const TIME = 90

export default function MemoryMatch({ world, level, onEnd }: GameProps) {
  const pairs = pairsFor(level, world)
  const deck = useMemo(() => {
    const faces = (world === 'dragon' ? RUNES : FACES).slice(0, pairs)
    return [...faces, ...faces].map((f, i) => ({ id: i, f })).sort(() => Math.random() - 0.5)
  }, [pairs, world])
  const [open, setOpen] = useState<number[]>([])
  const [matched, setMatched] = useState<string[]>([])
  const [moves, setMoves] = useState(0)
  const [left, setLeft] = useState(TIME)
  const [over, setOver] = useState(false)

  useEffect(() => {
    if (over) return
    const t = setInterval(() => setLeft((l) => l - 1), 1000)
    return () => clearInterval(t)
  }, [over])

  useEffect(() => {
    if (over) return
    if (matched.length === pairs) { setOver(true); sfx.levelUp(); setTimeout(() => onEnd(pairs * 4 + Math.max(0, left), true), 900) }
    else if (left <= 0) { setOver(true); setTimeout(() => onEnd(matched.length * 3, false), 600) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matched, left])

  const flip = (i: number) => {
    if (over || open.length === 2 || open.includes(i) || matched.includes(deck[i].f)) return
    sfx.tap()
    const o = [...open, i]
    setOpen(o)
    if (o.length === 2) {
      setMoves((m) => m + 1)
      if (deck[o[0]].f === deck[o[1]].f) { setTimeout(() => { setMatched((m) => [...m, deck[i].f]); setOpen([]); sfx.success() }, 400) }
      else setTimeout(() => setOpen([]), 800)
    }
  }

  const cols = pairs >= 10 ? 'grid-cols-5' : 'grid-cols-4'
  return (
    <div className="select-none">
      <div className="flex justify-between font-display font-bold text-lg px-2">
        <span>Pairs {matched.length}/{pairs}</span><span>Moves {moves}</span><span className={left < 15 ? 'text-red-500' : ''}>⏱ {left}s</span>
      </div>
      <div className={`grid ${cols} gap-2 sm:gap-3 mt-3 max-w-xl mx-auto`} style={{ perspective: 800 }}>
        {deck.map((c, i) => {
          const up = open.includes(i) || matched.includes(c.f)
          return (
            <motion.button key={c.id} onClick={() => flip(i)} className="relative aspect-[3/4] rounded-2xl" animate={{ rotateY: up ? 180 : 0 }} transition={{ duration: 0.35 }} style={{ transformStyle: 'preserve-3d' }} aria-label={up ? c.f : 'Hidden card'}>
              <span className={`absolute inset-0 rounded-2xl grid place-items-center text-3xl shadow-md ${world === 'dragon' ? 'bg-gradient-to-br from-orange-400 to-red-500' : 'bg-gradient-to-br from-violet-400 to-fuchsia-400'}`} style={{ backfaceVisibility: 'hidden' }}>🐾</span>
              <span className={`absolute inset-0 rounded-2xl grid place-items-center text-4xl sm:text-5xl shadow-md ${matched.includes(c.f) ? 'bg-green-100' : 'bg-white'}`} style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>{c.f}</span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
