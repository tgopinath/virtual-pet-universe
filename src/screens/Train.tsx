import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useGame, useActivePet } from '../store/game'
import { SKILLS, type Skill } from '../data/progress'
import { STAGES } from '../data/pets'
import { ScreenShell } from '../components/ui'
import PetActor from '../components/PetActor'
import { Confetti } from '../components/Chrome'
import { sfx } from '../lib/audio'
import type { Anim } from '../types'

const PADS = [
  { icon: '🦴', color: 'bg-orange-300', tone: 520 },
  { icon: '⭐', color: 'bg-yellow-300', tone: 660 },
  { icon: '💧', color: 'bg-sky-300', tone: 784 },
  { icon: '💖', color: 'bg-pink-300', tone: 988 },
]

export default function Train() {
  const pet = useActivePet()!
  const { trainComplete, go } = useGame()
  const [skill, setSkill] = useState<Skill | null>(null)
  const [seq, setSeq] = useState<number[]>([])
  const [input, setInput] = useState<number[]>([])
  const [lit, setLit] = useState<number | null>(null)
  const [phase, setPhase] = useState<'pick' | 'watch' | 'repeat' | 'success' | 'fail'>('pick')
  const [anim, setAnim] = useState<{ name: Anim; key: number }>({ name: 'idle', key: 0 })

  const lvl = (id: string) => pet.skills[id] ?? 0

  const start = (s: Skill) => {
    if (pet.stats.energy < s.energy) { sfx.error(); useGame.getState().toast(`${pet.name} needs more energy (${s.energy}⚡) — try a nap!`, '🥱'); return }
    if (pet.sleeping) { useGame.getState().toast(`${pet.name} is asleep. Wake them up first!`, '💤'); return }
    sfx.tap()
    setSkill(s)
    const length = 3 + lvl(s.id) + (s.minStage >= 2 ? 1 : 0)
    setSeq(Array.from({ length }, () => Math.floor(Math.random() * 4)))
    setInput([])
    setPhase('watch')
  }

  useEffect(() => {
    if (phase !== 'watch') return
    let i = 0
    const t = setInterval(() => {
      if (i >= seq.length) { clearInterval(t); setLit(null); setPhase('repeat'); return }
      setLit(seq[i]); sfx.voice([PADS[seq[i]].tone])
      setTimeout(() => setLit(null), 380)
      i++
    }, 650)
    return () => clearInterval(t)
  }, [phase, seq])

  const press = (i: number) => {
    if (phase !== 'repeat' || !skill) return
    sfx.voice([PADS[i].tone])
    setLit(i); setTimeout(() => setLit(null), 200)
    const next = [...input, i]
    if (seq[next.length - 1] !== i) { setPhase('fail'); sfx.error(); setAnim({ name: 'shake', key: Date.now() }); return }
    setInput(next)
    if (next.length === seq.length) {
      setPhase('success')
      trainComplete(skill.id)
      setAnim({ name: skill.anim, key: Date.now() })
      sfx.levelUp()
    }
  }

  if (skill && phase !== 'pick') {
    const newLvl = lvl(skill.id)
    return (
      <ScreenShell title={`Train: ${skill.name}`} icon={skill.icon} right={<button className="btn btn-white !min-h-11" onClick={() => { setSkill(null); setPhase('pick') }}>← Skills</button>}>
        <div className="card p-4 relative overflow-hidden max-w-xl mx-auto">
          {phase === 'success' && <Confetti />}
          <div className="text-center font-display font-bold text-xl">
            {phase === 'watch' && `Watch the pattern ${pet.name} learns... 👀`}
            {phase === 'repeat' && `Your turn! Repeat it (${input.length}/${seq.length})`}
            {phase === 'success' && `${pet.name} learned ${skill.name}${newLvl > 1 ? ` level ${newLvl}` : ''}! 🎉`}
            {phase === 'fail' && 'Oops! Let’s try that again 💪'}
          </div>
          <div className="grid place-items-center h-56"><PetActor pet={pet} size={170} anim={anim} showSpeech={false} /></div>
          <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
            {PADS.map((p, i) => (
              <motion.button key={i} onClick={() => press(i)} disabled={phase !== 'repeat'} animate={{ scale: lit === i ? 1.1 : 1, filter: lit === i ? 'brightness(1.25)' : 'brightness(1)' }}
                className={`${p.color} aspect-square rounded-3xl text-5xl shadow-[0_6px_0_rgba(0,0,0,.15)] ${lit === i ? 'ring-8 ring-white' : ''}`} aria-label={`Pad ${i + 1}`}>
                {p.icon}
              </motion.button>
            ))}
          </div>
          {phase === 'success' && (
            <div className="grid grid-cols-2 gap-3 mt-5">
              <button className="btn btn-white" onClick={() => { setSkill(null); setPhase('pick') }}>More skills</button>
              <button className="btn btn-green" onClick={() => go('home')}>Show it off 🏡</button>
            </div>
          )}
          {phase === 'fail' && <button className="btn btn-blue w-full mt-5" onClick={() => start(skill)}>Try again</button>}
        </div>
      </ScreenShell>
    )
  }

  return (
    <ScreenShell title="Training" icon="🎓">
      <p className="text-white font-bold drop-shadow mb-3">Teach {pet.name} tricks! Learned tricks can be performed from Home (🎪 Tricks). Each skill has 3 levels.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {SKILLS.map((s) => {
          const locked = pet.stage < s.minStage
          const l = lvl(s.id)
          return (
            <motion.button key={s.id} whileTap={{ scale: locked ? 1 : 0.96 }} disabled={locked || l >= 3} onClick={() => start(s)} className={`card p-4 text-left ${locked ? 'opacity-60' : ''}`}>
              <div className="flex justify-between items-start"><span className="text-4xl">{locked ? '🔒' : s.icon}</span><span className="text-xs font-extrabold text-ink/50">⚡{s.energy}</span></div>
              <div className="font-display font-bold text-xl mt-1">{s.name}</div>
              <div className="text-xs font-bold text-ink/60">{locked ? `Unlocks at ${STAGES[s.minStage].name} stage` : s.desc}</div>
              <div className="flex gap-1 mt-2" aria-label={`Level ${l} of 3`}>
                {[1, 2, 3].map((n) => <span key={n} className={`h-2.5 flex-1 rounded-full ${n <= l ? 'bg-mint' : 'bg-black/10'}`} />)}
              </div>
              <div className="text-xs font-extrabold mt-1 text-ink/70">{l >= 3 ? '🏅 Mastered' : l ? `Level ${l} — train to level ${l + 1}` : 'Not learned'}</div>
            </motion.button>
          )
        })}
      </div>
    </ScreenShell>
  )
}
