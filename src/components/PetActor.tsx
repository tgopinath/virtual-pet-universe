import { AnimatePresence, motion, useAnimationControls, type TargetAndTransition } from 'framer-motion'
import { forwardRef, useEffect, useState } from 'react'
import type { Anim, Pet } from '../types'
import PetArt, { moodOf, type Mood } from './PetArt'
import { speciesById, STAGES } from '../data/pets'
import { useGame } from '../store/game'

const IDLE: Record<string, TargetAndTransition> = {
  bounce: { y: [0, -8, 0], transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' } },
  sway: { rotate: [-3, 3, -3], transition: { duration: 2.6, repeat: Infinity, ease: 'easeInOut' } },
  hop: { y: [0, -16, 0, 0, 0], transition: { duration: 2, repeat: Infinity, times: [0, 0.15, 0.3, 0.7, 1] } },
  doze: { scaleY: [1, 0.96, 1], scaleX: [1, 1.03, 1], transition: { duration: 3, repeat: Infinity } },
  prowl: { x: [-10, 10, -10], transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' } },
  float: { y: [-10, 4, -10], transition: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } },
  waddle: { rotate: [-7, 7, -7], transition: { duration: 0.9, repeat: Infinity, ease: 'easeInOut' } },
  prance: { y: [0, -10, 0], rotate: [0, -4, 0], transition: { duration: 1.4, repeat: Infinity } },
}

const ACTIONS: Record<Anim, TargetAndTransition> = {
  idle: {},
  jump: { y: [0, 8, -90, 0, 6, 0], scaleY: [1, 0.8, 1.1, 1, 0.9, 1], transition: { duration: 0.9 } },
  spin: { rotate: [0, 360], transition: { duration: 0.8, ease: 'easeInOut' } },
  roll: { rotate: [0, 360, 720], x: [0, 60, -60, 0], transition: { duration: 1.4 } },
  dance: { rotate: [0, -14, 14, -14, 14, 0], y: [0, -14, 0, -14, 0, 0], transition: { duration: 1.4 } },
  wave: { rotate: [0, -8, 8, -8, 0], transition: { duration: 1 } },
  sit: { scaleY: [1, 0.82, 0.82, 1], y: [0, 14, 14, 0], transition: { duration: 1.4, times: [0, 0.2, 0.8, 1] } },
  eat: { scale: [1, 1.04, 0.98, 1.04, 1], transition: { duration: 1.2 } },
  sleep: {},
  shake: { x: [0, -10, 10, -10, 10, 0], transition: { duration: 0.6 } },
  love: { scale: [1, 1.12, 1], transition: { duration: 0.6 } },
  fetch: { x: [0, 140, 140, 0], scaleX: [1, 1, -1, -1], transition: { duration: 1.6 } },
  follow: { x: [0, -90, 90, 0], transition: { duration: 2 } },
  special: { rotate: [0, 0, 360, 360], scale: [1, 1.25, 1.25, 1], y: [0, -40, -40, 0], transition: { duration: 1.6 } },
}

const EMOTE: Partial<Record<Anim, string>> = { love: '💕', eat: '😋', wave: '👋', fetch: '🎾', dance: '🎵', jump: '✨', special: '🌟' }
const SPECIAL_FX: Record<string, string> = { puppy: '🦴', kitten: '🧶', bunny: '🥕', panda: '🎋', fox: '🍂', dragon: '🔥', penguin: '❄️', unicorn: '🌈' }

interface Props { pet: Pet; size?: number; onTap?: () => void; highlight?: boolean; anim?: { name: Anim; key: number }; showSpeech?: boolean }

const PetActor = forwardRef<HTMLDivElement, Props>(function PetActor({ pet, size = 220, onTap, highlight, anim: animProp, showSpeech = true }, ref) {
  const storeAnim = useGame((s) => s.anim)
  const speech = useGame((s) => s.speech)
  const anim = animProp ?? storeAnim
  const controls = useAnimationControls()
  const sp = speciesById(pet.species)
  const [mood, setMood] = useState<Mood>(moodOf(pet))
  const [bursts, setBursts] = useState<{ id: number; e: string; x: number }[]>([])
  const [look, setLook] = useState(0)
  const baseMood = moodOf(pet)

  useEffect(() => setMood(baseMood), [baseMood])

  useEffect(() => {
    let alive = true
    const idle = pet.sleeping ? { scaleY: [1, 0.95, 1], transition: { duration: 3, repeat: Infinity } } : IDLE[sp.idle]
    const run = async () => {
      if (anim.name !== 'idle' && anim.key && Date.now() - anim.key < 1500) {
        if (anim.name === 'eat') setMood('eat')
        if (anim.name === 'love' || anim.name === 'dance' || anim.name === 'special') setMood('happy')
        const e = anim.name === 'special' ? SPECIAL_FX[sp.id] : EMOTE[anim.name]
        if (e) setBursts((b) => [...b, ...[0, 1, 2].map((i) => ({ id: anim.key + i, e, x: -40 + i * 40 }))])
        await controls.start(ACTIONS[anim.name])
        if (!alive) return
        setMood(moodOf(pet))
      }
      controls.set({ x: 0, rotate: 0, scale: 1, scaleX: 1, scaleY: 1, y: 0 })
      controls.start(idle)
    }
    run()
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anim.key, pet.sleeping, sp.idle])

  // glance around now and then
  useEffect(() => {
    const t = setInterval(() => setLook(Math.random() < 0.5 ? 0 : Math.random() < 0.5 ? -1 : 1), 2500)
    return () => clearInterval(t)
  }, [])

  const scale = STAGES[pet.stage].scale
  const need = needIcon(pet)

  return (
    <div ref={ref} className="relative flex flex-col items-center select-none" style={{ width: size }}>
      <AnimatePresence>
        {showSpeech && speech && Date.now() - speech.key < 3000 && (
          <motion.div
            key={speech.key}
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onAnimationComplete={() => setTimeout(() => useGame.setState((s) => (s.speech?.key === speech.key ? { speech: null } : {})), 2200)}
            className="absolute -top-4 z-20 bubble"
          >
            {speech.text}
          </motion.div>
        )}
      </AnimatePresence>

      {need && !pet.sleeping && (
        <motion.div className="absolute top-6 right-0 z-10 text-3xl bg-white/90 rounded-full w-12 h-12 grid place-items-center shadow-md"
          animate={{ y: [0, -6, 0] }} transition={{ duration: 1.4, repeat: Infinity }} aria-label={need.label} title={need.label}>
          {need.icon}
        </motion.div>
      )}
      {pet.sleeping && (
        <div className="absolute top-8 right-6 z-10 text-2xl font-bold text-indigo-500 zzz" aria-label="Sleeping">Z<span>z</span><span>z</span></div>
      )}

      <motion.button
        type="button"
        animate={controls}
        onClick={onTap}
        whileTap={{ scale: 0.94 }}
        aria-label={`${pet.name} the ${sp.label}. Tap to pet.`}
        className={`relative origin-bottom cursor-pointer outline-none ${highlight ? 'drop-target' : ''}`}
        style={{ width: size, marginTop: 24 }}
      >
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'bottom center' }}>
          <PetArt pet={pet} mood={mood} size={size} look={look} />
        </div>
        {pet.equipped.effect === 'fx_hearts' && <Aura e="💕" />}
        {pet.equipped.effect === 'fx_sparkle' && <Aura e="✨" />}
        {pet.stage >= 4 && <Aura e="⭐" />}
      </motion.button>

      <AnimatePresence>
        {bursts.map((b) => (
          <motion.span
            key={b.id}
            className="absolute text-3xl pointer-events-none"
            style={{ top: '40%', left: '50%' }}
            initial={{ opacity: 1, x: b.x, y: 0, scale: 0.5 }}
            animate={{ opacity: 0, y: -120, scale: 1.4 }}
            transition={{ duration: 1.3 }}
            onAnimationComplete={() => setBursts((all) => all.filter((x) => x.id !== b.id))}
          >
            {b.e}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  )
})

export default PetActor

function Aura({ e }: { e: string }) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className="aura-dot absolute text-xl" style={{ left: `${10 + i * 25}%`, top: `${20 + (i % 2) * 40}%`, animationDelay: `${i * 0.6}s` }}>{e}</span>
      ))}
    </div>
  )
}

export function needIcon(p: Pet): { icon: string; label: string } | null {
  const s = p.stats
  if (s.health < 35) return { icon: '🤒', label: 'Not feeling well — try Get-Well Syrup' }
  if (s.hunger < 30) return { icon: '🍖', label: 'Hungry!' }
  if (s.energy < 25) return { icon: '🥱', label: 'Sleepy' }
  if (s.cleanliness < 30) return { icon: '🛁', label: 'Needs a bath' }
  if (s.happiness < 35) return { icon: '🧸', label: 'Bored — wants to play' }
  return null
}
