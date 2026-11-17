import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import PetArt from '../components/PetArt'
import { sfx } from '../lib/audio'
import type { GameProps } from './common'

const SPOTS: Record<string, string[]> = {
  garden: ['🌳', '🌷', '🪨', '🌻', '📦', '🧺'], snow: ['⛄', '🌲', '🧊', '🏔️', '🛷', '📦'], tropical: ['🌴', '🐚', '🏖️', '🪣', '🥥', '📦'],
  forest: ['🍄', '🌲', '🔮', '🌿', '🪵', '🏚️'], space: ['🛸', '🪐', '🌑', '🛰️', '🚀', '📦'], dragon: ['🌋', '🪨', '🏺', '💎', '🛡️', '📦'],
}
const ROUNDS = 3
const TRIES = 3

export default function HideSeek({ pet, world, level, onEnd }: GameProps) {
  const count = level >= 6 ? 9 : 6
  const base = SPOTS[world] ?? SPOTS.garden
  const spots = Array.from({ length: count }, (_, i) => base[i % base.length])
  const [round, setRound] = useState(1)
  const [hidden, setHidden] = useState(() => Math.floor(Math.random() * count))
  const [phase, setPhase] = useState<'hiding' | 'seek' | 'found' | 'missed'>('hiding')
  const [tries, setTries] = useState(TRIES)
  const [wrong, setWrong] = useState<number[]>([])
  const [score, setScore] = useState(0)
  const [found, setFound] = useState(0)
  const [hint, setHint] = useState(false)

  useEffect(() => {
    if (phase !== 'hiding') return
    const t = setTimeout(() => setPhase('seek'), 1600)
    return () => clearTimeout(t)
  }, [phase, round])

  const next = (f: number, sc: number) => {
    setTimeout(() => {
      if (round >= ROUNDS) { onEnd(sc, f >= 2); return }
      setRound((r) => r + 1)
      setHidden(Math.floor(Math.random() * count))
      setTries(TRIES); setWrong([]); setHint(false)
      setPhase('hiding')
    }, 1500)
  }

  const guess = (i: number) => {
    if (phase !== 'seek' || wrong.includes(i)) return
    if (i === hidden) {
      const sc = score + tries * 4
      setScore(sc); setFound((f) => f + 1); setPhase('found'); sfx.success()
      next(found + 1, sc)
    } else {
      sfx.error()
      setWrong((w) => [...w, i])
      setHint(true)
      setTimeout(() => setHint(false), 700)
      if (tries - 1 <= 0) { setPhase('missed'); next(found, score) }
      setTries((t) => t - 1)
    }
  }

  return (
    <div className="select-none">
      <div className="flex justify-between font-display font-bold text-lg px-2">
        <span>Round {round}/{ROUNDS}</span><span>Tries: {'🔍'.repeat(Math.max(0, tries))}</span><span>Found {found}</span>
      </div>
      <div className="relative mt-2 rounded-3xl p-4 min-h-[52vh]" style={{ background: world === 'forest' ? 'linear-gradient(#4b3f8f,#4fa37a)' : world === 'space' ? 'linear-gradient(#1b1d4f,#5f55a8)' : 'linear-gradient(#bfe9ff,#9fe08a)' }}>
        <div className="text-center font-display font-bold text-xl text-white drop-shadow mb-2 h-8">
          {phase === 'hiding' ? `${pet.name} is hiding... no peeking! 🙈` : phase === 'seek' ? `Where is ${pet.name}?` : phase === 'found' ? 'Found you! 🎉' : `${pet.name} was here! 😄`}
        </div>
        {phase === 'hiding' && (
          <motion.div className="absolute left-1/2 top-1/3 -translate-x-1/2" initial={{ scale: 1, opacity: 1 }} animate={{ scale: 0.2, opacity: 0, y: 80 }} transition={{ duration: 1.2 }}>
            <PetArt pet={pet} mood="happy" size={120} />
          </motion.div>
        )}
        <div className={`grid ${count > 6 ? 'grid-cols-3' : 'grid-cols-3'} gap-3`}>
          {spots.map((e, i) => {
            const reveal = (phase === 'found' || phase === 'missed') && i === hidden
            const wiggle = hint && i === hidden
            return (
              <motion.button key={i} onClick={() => guess(i)} disabled={phase !== 'seek'}
                animate={wiggle ? { rotate: [0, -6, 6, -4, 0] } : wrong.includes(i) ? { opacity: 0.35 } : { rotate: 0 }}
                whileTap={{ scale: 0.92 }}
                className="relative aspect-square rounded-3xl bg-white/25 grid place-items-center text-6xl sm:text-7xl" aria-label={`Look behind ${e}`}>
                {reveal ? <motion.div initial={{ y: 30, scale: 0.6 }} animate={{ y: 0, scale: 1 }}><PetArt pet={pet} mood={phase === 'found' ? 'happy' : 'normal'} size={90} /></motion.div> : e}
                {wrong.includes(i) && <span className="absolute bottom-1 text-xl">❌</span>}
              </motion.button>
            )
          })}
        </div>
      </div>
      <p className="text-center font-bold text-ink/60 mt-3">Score: {score}</p>
    </div>
  )
}
