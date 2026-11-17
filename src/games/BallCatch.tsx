import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import PetArt from '../components/PetArt'
import { sfx } from '../lib/audio'
import type { GameProps } from './common'

const THROWS = 5

export default function BallCatch({ pet, onEnd }: GameProps) {
  const [round, setRound] = useState(1)
  const [catches, setCatches] = useState(0)
  const [power, setPower] = useState(0)
  const [zone, setZone] = useState(60)
  const [phase, setPhase] = useState<'aim' | 'fly' | 'result'>('aim')
  const [landing, setLanding] = useState(0)
  const [caught, setCaught] = useState<boolean | null>(null)
  const dir = useRef(1)
  const reach = 8 + (pet.skills.fetch ?? 0) * 2

  useEffect(() => {
    if (phase !== 'aim') return
    let raf = 0
    let p = power
    const speed = 1.4 + round * 0.25
    const step = () => {
      p += dir.current * speed
      if (p > 100 || p < 0) { dir.current *= -1; p = Math.max(0, Math.min(100, p)) }
      setPower(p)
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, round])

  const landingX = (p: number) => 12 + p * 0.8

  const toss = () => {
    if (phase !== 'aim') return
    const x = landingX(power)
    setLanding(x)
    setPhase('fly')
    sfx.whoosh()
    setTimeout(() => {
      const ok = Math.abs(x - zone) <= reach
      setCaught(ok)
      setPhase('result')
      if (ok) { setCatches((c) => c + 1); sfx.success() } else sfx.error()
      setTimeout(() => {
        if (round >= THROWS) { onEnd(catches + (ok ? 1 : 0), catches + (ok ? 1 : 0) >= 3); return }
        setRound((r) => r + 1)
        setZone(25 + Math.random() * 60)
        setCaught(null)
        setPhase('aim')
      }, 1300)
    }, 900)
  }

  return (
    <div className="relative h-full select-none" onKeyDown={(e) => e.key === ' ' && toss()}>
      <div className="flex justify-between font-display font-bold text-lg px-2">
        <span>Throw {round}/{THROWS}</span><span>Catches: {catches} ⚽</span>
      </div>
      <div className="relative h-[52vh] max-h-[420px] mt-2 rounded-3xl overflow-hidden" style={{ background: 'linear-gradient(#bfe9ff,#e9fbff 60%,#9fe08a 60%,#6cc95a)' }}>
        {/* catch zone */}
        <motion.div className="absolute bottom-[34%] h-4 rounded-full bg-yellow-300/70 border-2 border-yellow-400" animate={{ left: `${zone - reach}%`, width: `${reach * 2}%` }} />
        <motion.div className="absolute bottom-[38%] -translate-x-1/2" animate={{ left: `${zone}%`, y: caught ? [0, -50, 0] : 0 }} transition={{ type: 'spring', stiffness: 80 }}>
          <PetArt pet={pet} mood={caught === false ? 'sad' : caught ? 'happy' : 'normal'} size={110} />
        </motion.div>
        {/* ball */}
        {phase !== 'aim' && (
          <motion.div className="absolute text-4xl" initial={{ left: '6%', bottom: '30%' }}
            animate={phase === 'fly' ? { left: [`6%`, `${(6 + landing) / 2}%`, `${landing}%`], bottom: ['30%', '85%', '40%'] } : caught ? { left: '6%', bottom: '30%' } : { left: `${landing}%`, bottom: '34%' }}
            transition={{ duration: phase === 'fly' ? 0.9 : 1, ease: 'easeOut' }}>⚽</motion.div>
        )}
        <div className="absolute left-[3%] bottom-[30%] text-5xl">🧒</div>
        {phase === 'result' && <div className="absolute inset-x-0 top-6 text-center font-display font-bold text-3xl text-white drop-shadow-[0_3px_0_rgba(0,0,0,.25)]">{caught ? 'Great catch! 🎉' : 'So close!'}</div>}
      </div>
      {/* power meter */}
      <div className="relative h-8 mt-4 rounded-full bg-gradient-to-r from-green-300 via-yellow-300 to-red-400 overflow-hidden" aria-label="Throw power">
        <div className="absolute top-0 bottom-0 bg-white/40 border-x-2 border-yellow-500" style={{ left: `${((zone - reach - 12) / 0.8)}%`, width: `${(reach * 2) / 0.8}%` }} />
        <div className="absolute top-0 bottom-0 w-2 bg-ink rounded" style={{ left: `${power}%` }} />
      </div>
      <button className="btn btn-gold w-full mt-4 text-2xl min-h-16" onClick={toss} disabled={phase !== 'aim'} autoFocus>THROW! ⚽</button>
    </div>
  )
}
