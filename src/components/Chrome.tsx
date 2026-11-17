import { AnimatePresence, motion } from 'framer-motion'
import { useGame } from '../store/game'
import { levelInfo } from '../data/progress'
import type { Screen } from '../types'
import { Modal } from './ui'
import PetArt from './PetArt'
import { STAGES, speciesById } from '../data/pets'
import { useEffect, useState } from 'react'
import { MISSION_POOL } from '../data/progress'
import type { Pet } from '../types'

export function TopBar() {
  const { player, coins, gems, go } = useGame()
  const lv = levelInfo(player.xp)
  const [coinBump, setCoinBump] = useState(0)
  useEffect(() => setCoinBump((n) => n + 1), [coins])
  return (
    <header className="relative z-30 px-3 pt-[max(env(safe-area-inset-top),10px)]">
      <div className="max-w-5xl mx-auto flex items-center gap-2">
        <button onClick={() => go('profile')} className="glass rounded-full pl-1 pr-3 py-1 flex items-center gap-2 shadow-md min-h-12" aria-label={`Profile: ${player.name}, level ${lv.level}`}>
          <span className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-200 to-pink-200 grid place-items-center text-2xl">{player.avatar}</span>
          <span className="text-left leading-tight hidden sm:block">
            <span className="block font-display font-semibold text-sm">{player.name}</span>
            <span className="block text-[11px] font-extrabold text-ink/60">Level {lv.level}</span>
          </span>
          <span className="sm:hidden font-display font-bold whitespace-nowrap">Lv {lv.level}</span>
          <span className="w-16 sm:w-24 h-2.5 rounded-full bg-black/10 overflow-hidden" aria-hidden>
            <motion.span className="block h-full bg-gradient-to-r from-sky to-grape" animate={{ width: `${(lv.into / lv.need) * 100}%` }} />
          </span>
        </button>
        <div className="flex-1" />
        <motion.button key={coinBump} initial={{ scale: 1.25 }} animate={{ scale: 1 }} onClick={() => go('shop')} className="glass pill shadow-md min-h-11 text-base" aria-label={`${coins} coins`}>🪙 {coins}</motion.button>
        <button onClick={() => go('shop')} className="glass pill shadow-md min-h-11 text-base" aria-label={`${gems} gems`}>💎 {gems}</button>
        <button onClick={() => go('missions')} className="glass rounded-full w-11 h-11 shadow-md text-xl relative" aria-label="Missions and achievements">
          📜<MissionDot />
        </button>
      </div>
    </header>
  )
}

function MissionDot() {
  const ready = useGame((s) => s.daily.missions.some((id) => !s.daily.claimed.includes(id) && (s.daily.progress[id] ?? 0) >= (missionGoal(id))) || s.dailyRewardReady())
  return ready ? <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 border-2 border-white" /> : null
}
const missionGoal = (id: string) => MISSION_POOL.find((m) => m.id === id)?.goal ?? 1

const NAV: { id: Screen | 'feed'; icon: string; label: string }[] = [
  { id: 'home', icon: '🏡', label: 'Home' },
  { id: 'feed', icon: '🍎', label: 'Feed' },
  { id: 'play', icon: '🎮', label: 'Play' },
  { id: 'train', icon: '🎓', label: 'Train' },
  { id: 'shop', icon: '🛍️', label: 'Shop' },
  { id: 'explore', icon: '🗺️', label: 'Explore' },
]

export function BottomNav() {
  const { screen, go, setFeedOpen, feedOpen } = useGame()
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 px-2 pb-[max(env(safe-area-inset-bottom),8px)]" aria-label="Main">
      <div className="max-w-xl mx-auto glass rounded-[28px] shadow-xl flex justify-between px-1 py-1">
        {NAV.map((n) => {
          const on = n.id === 'feed' ? feedOpen : screen === n.id && !feedOpen
          return (
            <button key={n.id} onClick={() => (n.id === 'feed' ? setFeedOpen(!feedOpen) : go(n.id))}
              aria-current={on ? 'page' : undefined}
              className={`relative flex-1 flex flex-col items-center justify-center min-h-14 rounded-3xl transition ${on ? 'text-ink' : 'text-ink/60'}`}>
              {on && <motion.span layoutId="navpill" className="absolute inset-0.5 rounded-3xl bg-white shadow" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
              <motion.span className="relative text-2xl" animate={on ? { y: [0, -5, 0] } : {}} transition={{ duration: 0.4 }}>{n.icon}</motion.span>
              <span className="relative text-[11px] font-display font-semibold">{n.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export function Overlays() {
  const { toasts, floats, evolution, levelUp, clearEvolution, clearLevelUp, pets, dismissToast } = useGame()
  const evoPet = evolution && pets.find((p) => p.id === evolution.petId)
  return (
    <>
      <div className="fixed top-20 inset-x-0 z-[60] flex flex-col items-center gap-2 pointer-events-none px-4" aria-live="polite">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.button key={t.id} onClick={() => dismissToast(t.id)} layout initial={{ y: -30, opacity: 0, scale: 0.9 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="pointer-events-auto card px-4 py-2.5 flex items-center gap-2 font-display font-semibold text-base max-w-md">
              <span className="text-2xl">{t.icon ?? '💬'}</span>{t.text}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
      <div className="fixed inset-x-0 top-[40%] z-[55] pointer-events-none flex justify-center">
        <AnimatePresence>
          {floats.map((f, i) => (
            <motion.div key={f.id} className="absolute font-display font-bold text-3xl" style={{ color: f.color, WebkitTextStroke: '1.5px white', marginLeft: (i % 3 - 1) * 70 }}
              initial={{ y: 0, opacity: 0, scale: 0.5 }} animate={{ y: -140, opacity: [0, 1, 1, 0], scale: 1.2 }} transition={{ duration: 1.6 }}>
              {f.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <Modal open={!!evoPet} onClose={clearEvolution}>
        {evoPet && <EvolutionView pet={evoPet} to={evolution!.to} onDone={clearEvolution} />}
      </Modal>

      <Modal open={levelUp !== null} onClose={clearLevelUp}>
        <div className="text-center py-2">
          <Confetti />
          <motion.div className="text-7xl" initial={{ scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring' }}>🏅</motion.div>
          <h2 className="text-3xl font-bold mt-2">Level {levelUp}!</h2>
          <p className="font-bold text-ink/70 mt-1">You're becoming an amazing pet carer.</p>
          <button className="btn btn-gold mt-5 w-full" onClick={clearLevelUp}>Yay!</button>
        </div>
      </Modal>
    </>
  )
}

function EvolutionView({ pet, to, onDone }: { pet: Pet; to: number; onDone: () => void }) {
  const [phase, setPhase] = useState(0)
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1600)
    return () => clearTimeout(t1)
  }, [])
  const sp = speciesById(pet.species)
  return (
    <div className="text-center relative overflow-hidden">
      <h2 className="text-2xl font-bold">{phase ? `${pet.name} grew up!` : `${pet.name} is evolving...`}</h2>
      <div className="relative h-64 grid place-items-center">
        <motion.div className="absolute w-56 h-56 rounded-full" style={{ background: 'radial-gradient(circle,#fff6a8,#ffd23f00 70%)' }} animate={{ scale: [0.6, 1.4, 1], opacity: [0.4, 1, 0.8] }} transition={{ duration: 1.6 }} />
        <motion.div animate={phase ? { scale: [1.3, 1], filter: 'brightness(1)' } : { scale: [1, 1.1, 0.95, 1.15, 1], filter: ['brightness(1)', 'brightness(3)', 'brightness(1)', 'brightness(4)', 'brightness(5)'] }} transition={{ duration: phase ? 0.6 : 1.6 }}>
          <div style={{ transform: `scale(${STAGES[phase ? to : to - 1].scale})` }}>
            <PetArt pet={{ ...pet, stage: phase ? to : to - 1 }} mood={phase ? 'happy' : 'normal'} size={190} />
          </div>
        </motion.div>
        {phase === 1 && <Confetti />}
      </div>
      {phase === 1 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="font-bold text-lg">Now a <span className="text-grape">{STAGES[to].name}</span> {sp.label}!</p>
          <p className="text-sm font-bold text-ink/60 mt-1">{stageUnlockText(to)}</p>
          <button className="btn btn-gold mt-4 w-full" onClick={onDone}>Amazing!</button>
        </motion.div>
      )}
    </div>
  )
}

export function stageUnlockText(stage: number) {
  return [
    '',
    'New look, new tricks: Spin, Roll and Fetch can now be trained. Fairy Wings unlocked!',
    'Head marking appears! Dance and Follow can now be trained. Royal Crown unlocked.',
    'Bigger and stronger! Signature Trick and Cloud Wings unlocked.',
    'A golden aura and crown! Rainbow Halo unlocked — a true legend.',
  ][stage]
}

export function Confetti({ n = 26 }: { n?: number }) {
  const bits = Array.from({ length: n }, (_, i) => i)
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {bits.map((i) => (
        <motion.span key={i} className="absolute w-2.5 h-3.5 rounded-sm"
          style={{ left: `${(i * 37) % 100}%`, top: -10, background: ['#ff6fa5', '#ffd23f', '#4cc9f0', '#06d6a0', '#9b5de5'][i % 5] }}
          animate={{ y: [0, 420], rotate: [0, 360 * (i % 2 ? 1 : -1)], opacity: [1, 1, 0] }}
          transition={{ duration: 1.8 + (i % 5) * 0.25, delay: (i % 7) * 0.08 }} />
      ))}
    </div>
  )
}

const TUTORIAL = [
  { icon: '👆', title: 'Tap to pet', text: 'Tap your pet to give it some love. Watch how it reacts!' },
  { icon: '🍎', title: 'Drag food to feed', text: 'Open Feed, then drag a snack onto your pet — or just tap the snack.' },
  { icon: '📊', title: 'Watch the bars', text: 'Green is great, yellow needs attention, red needs help soon. Your pet will tell you what it needs.' },
  { icon: '🎮', title: 'Play & train', text: 'Mini-games and training earn coins, XP and help your pet grow up.' },
  { icon: '🗺️', title: 'Explore', text: 'Level up to unlock new worlds — snow, beaches, space and more!' },
]

export function Tutorial() {
  const { tutorialStep, nextTutorial, pets } = useGame()
  if (tutorialStep < 0 || !pets.length) return null
  const t = TUTORIAL[tutorialStep]
  return (
    <motion.div key={tutorialStep} className="fixed inset-x-0 top-[76px] sm:left-auto sm:right-20 z-[45] px-4 flex justify-center" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
      <div className="card max-w-sm w-full p-4 flex gap-3 items-start border-4 border-yellow-300">
        <div className="text-4xl float-y">{t.icon}</div>
        <div className="flex-1">
          <div className="text-xs font-extrabold text-ink/50">TIP {tutorialStep + 1} OF {TUTORIAL.length}</div>
          <h3 className="font-bold text-lg">{t.title}</h3>
          <p className="text-sm font-bold text-ink/70">{t.text}</p>
          <div className="flex gap-2 mt-3">
            <button className="btn btn-blue !min-h-11 !py-1 !text-base" onClick={nextTutorial}>{tutorialStep === TUTORIAL.length - 1 ? 'Let’s play!' : 'Next'}</button>
            <button className="text-sm font-bold text-ink/50 px-3" onClick={() => useGame.setState({ tutorialStep: -1 })}>Skip tips</button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
