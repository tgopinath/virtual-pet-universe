import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { SPECIES, speciesById } from '../data/pets'
import { useGame } from '../store/game'
import type { Anim, Pet, SpeciesId } from '../types'
import PetArt from '../components/PetArt'
import PetActor from '../components/PetActor'
import { Price, RarityTag, StatsPanel } from '../components/ui'
import { Confetti } from '../components/Chrome'
import { sfx, unlockAudio } from '../lib/audio'

const NAMES = ['Biscuit', 'Mochi', 'Pip', 'Luna', 'Noodle', 'Sunny', 'Bean', 'Pixel', 'Clover', 'Waffles', 'Ziggy', 'Peaches', 'Comet', 'Bubbles']

export default function Adopt() {
  const { pets, coins, gems, adopt, go } = useGame()
  const first = pets.length === 0
  const [step, setStep] = useState<'intro' | 'browse' | 'name' | 'done'>(first ? 'intro' : 'browse')
  const [sel, setSel] = useState<SpeciesId | null>(null)
  const [name, setName] = useState('')
  const [anim, setAnim] = useState<{ name: Anim; key: number }>({ name: 'idle', key: 0 })

  const preview = (id: SpeciesId): Pet => ({
    id: 'preview', species: id, name: '', xp: 0, stage: 0, stats: speciesById(id).base, skills: {}, equipped: {}, color: 0, looks: [], sleeping: false, adoptedAt: 0,
  })
  const owned = (id: SpeciesId) => pets.some((p) => p.species === id)
  const sp = sel ? speciesById(sel) : null
  const cost = sp && !first ? sp.adoptCost : {}
  const affordable = (cost.coins ?? 0) <= coins && (cost.gems ?? 0) <= gems

  return (
    <div className="absolute inset-0 overflow-y-auto no-scrollbar" style={{ background: 'linear-gradient(180deg,#ffd6ec 0%,#d8e8ff 60%,#c8f5e4 100%)' }}>
      <div className="absolute inset-0 pointer-events-none opacity-40" style={{ backgroundImage: 'radial-gradient(#fff 3px, transparent 3px)', backgroundSize: '36px 36px' }} />
      <AnimatePresence mode="wait">
        {step === 'intro' && (
          <motion.div key="intro" className="relative min-h-full flex flex-col items-center justify-center text-center px-6 py-10" exit={{ opacity: 0, scale: 0.95 }}>
            <motion.div className="text-8xl" animate={{ y: [0, -12, 0] }} transition={{ repeat: Infinity, duration: 2 }}>🏠</motion.div>
            <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-5xl sm:text-6xl font-bold mt-4 text-white drop-shadow-[0_4px_0_#c25f9b]">Virtual Pet<br />Universe</motion.h1>
            <p className="mt-4 text-lg font-bold text-ink/70 max-w-sm">Welcome to the Adoption Center! A little friend is waiting to meet you.</p>
            <div className="flex -space-x-6 mt-6">
              {SPECIES.slice(0, 5).map((s, i) => (
                <motion.div key={s.id} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 * i }}>
                  <PetArt pet={{ species: s.id, color: 0, equipped: {}, stage: 0 }} size={80} mood={i % 2 ? 'happy' : 'normal'} />
                </motion.div>
              ))}
            </div>
            <button className="btn btn-gold text-xl mt-8 px-10 min-h-16" onClick={() => { unlockAudio(); sfx.success(); setStep('browse') }}>Enter Adoption Center ✨</button>
          </motion.div>
        )}

        {step === 'browse' && (
          <motion.div key="browse" className="relative max-w-5xl mx-auto px-4 pt-6 pb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-white drop-shadow-[0_3px_0_#c25f9b]">Choose a friend</h1>
              {!first && <button className="btn btn-white !min-h-11" onClick={() => go('collection')}>← Back</button>}
            </div>
            <p className="font-bold text-ink/60 mt-1">{first ? 'Your first pet is free! Tap a pet to meet it.' : `You have 🪙 ${coins} and 💎 ${gems}.`}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              {SPECIES.map((s, i) => (
                <motion.button key={s.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  whileHover={{ y: -4 }} whileTap={{ scale: 0.96 }}
                  onClick={() => { sfx.voice(s.sound); setSel(s.id); setAnim({ name: 'jump', key: Date.now() }) }}
                  className={`card p-3 text-left relative ${sel === s.id ? 'ring-4 ring-yellow-300' : ''}`} aria-pressed={sel === s.id}>
                  <div className="absolute top-2 right-2"><RarityTag r={s.rarity} /></div>
                  <div className="grid place-items-center h-28"><PetArt pet={{ species: s.id, color: 0, equipped: {}, stage: 0 }} size={100} /></div>
                  <div className="font-display font-bold text-lg">{s.label}</div>
                  <div className="text-xs font-bold text-ink/60">{s.personality.join(' · ')}</div>
                  <div className="mt-1 text-sm">{owned(s.id) ? <span className="font-bold text-mint">✓ In your family</span> : first ? <span className="font-bold text-mint">Free</span> : <Price p={s.adoptCost} />}</div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 'name' && sp && (
          <motion.div key="name" className="relative min-h-full flex flex-col items-center justify-center px-6 py-10" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <PetActor pet={preview(sp.id)} size={200} anim={anim} showSpeech={false} onTap={() => setAnim({ name: 'love', key: Date.now() })} />
            <h2 className="text-3xl font-bold mt-2 text-white drop-shadow-[0_3px_0_#c25f9b]">Name your {sp.label}</h2>
            <form className="card p-4 mt-4 w-full max-w-sm" onSubmit={(e) => { e.preventDefault(); if (adopt(sp.id, name || sp.label)) { setStep('done'); setTimeout(() => go('home'), 2600) } }}>
              <label htmlFor="petname" className="font-bold text-sm text-ink/70">Pet name</label>
              <div className="flex gap-2 mt-1">
                <input id="petname" autoFocus value={name} maxLength={14} onChange={(e) => setName(e.target.value)} placeholder={sp.label}
                  className="flex-1 min-w-0 min-h-12 rounded-2xl border-4 border-pink-200 px-3 text-xl font-display font-semibold outline-none focus:border-pink-400" />
                <button type="button" className="btn btn-white !px-3" aria-label="Random name" onClick={() => { sfx.tap(); setName(NAMES[Math.floor(Math.random() * NAMES.length)]) }}>🎲</button>
              </div>
              <button type="submit" className="btn btn-gold w-full mt-4 text-xl">Adopt {name || sp.label} 💛</button>
              <button type="button" className="w-full mt-2 font-bold text-ink/50 min-h-11" onClick={() => setStep('browse')}>Choose a different pet</button>
            </form>
          </motion.div>
        )}

        {step === 'done' && sp && (
          <motion.div key="done" className="relative min-h-full flex flex-col items-center justify-center text-center px-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Confetti n={40} />
            <motion.div className="absolute w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle,#fff,#fff0 70%)' }} animate={{ scale: [0, 1.6, 1.2] }} transition={{ duration: 1 }} />
            <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', delay: 0.2 }}>
              <PetArt pet={{ species: sp.id, color: 0, equipped: {}, stage: 0 }} mood="happy" size={220} />
            </motion.div>
            <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="text-4xl font-bold text-white drop-shadow-[0_3px_0_#c25f9b]">Welcome home, {name || sp.label}!</motion.h2>
            <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.3, 1] }} transition={{ delay: 0.9 }} className="text-6xl mt-2">💖</motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* preview sheet */}
      <AnimatePresence>
        {step === 'browse' && sp && (
          <motion.div className="fixed inset-0 z-50 bg-indigo-950/40 flex items-end sm:items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSel(null)}>
            <motion.div className="card w-full sm:max-w-lg rounded-b-none sm:rounded-b-[28px] p-5 max-h-[92vh] overflow-y-auto" initial={{ y: 300 }} animate={{ y: 0 }} exit={{ y: 300 }} transition={{ type: 'spring', damping: 24, stiffness: 260 }} onClick={(e) => e.stopPropagation()} role="dialog" aria-label={`${sp.label} details`}>
              <div className="flex justify-between items-start">
                <div>
                  <RarityTag r={sp.rarity} />
                  <h2 className="text-3xl font-bold mt-1">{sp.label}</h2>
                  <div className="font-bold text-ink/60 text-sm">{sp.breed}</div>
                </div>
                <button onClick={() => setSel(null)} aria-label="Close" className="w-11 h-11 rounded-full bg-slate-100 text-xl font-bold">✕</button>
              </div>
              <div className="grid place-items-center rounded-3xl mt-2 py-2" style={{ background: 'radial-gradient(circle at 50% 70%,#fff,#ffe9f5)' }}>
                <PetActor pet={preview(sp.id)} size={190} anim={anim} showSpeech={false} onTap={() => { sfx.voice(sp.sound); setAnim({ name: (['jump', 'spin', 'love', 'dance'] as Anim[])[Math.floor(Math.random() * 4)], key: Date.now() }) }} />
                <div className="flex gap-2 pb-2">
                  {(['jump', 'spin', 'dance', 'love'] as Anim[]).map((a) => (
                    <button key={a} className="pill bg-white shadow text-sm min-h-10 capitalize" onClick={() => { sfx.tap(); setAnim({ name: a, key: Date.now() }) }}>{a}</button>
                  ))}
                </div>
              </div>
              <p className="font-bold mt-3">{sp.blurb}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">{sp.personality.map((p) => <span key={p} className="pill bg-pink-100 text-pink-700 text-sm">{p}</span>)}</div>
              <div className="mt-3 p-3 rounded-2xl bg-yellow-50">
                <div className="font-display font-bold">✨ {sp.ability.name}</div>
                <div className="text-sm font-bold text-ink/70">{sp.ability.desc}</div>
              </div>
              <div className="mt-3"><StatsPanel stats={sp.base} /></div>
              <button disabled={!affordable} className="btn btn-gold w-full mt-4 text-xl" onClick={() => { sfx.success(); setStep('name') }}>
                {affordable ? <>Choose {sp.label} {!first && (cost.coins || cost.gems) ? <span className="opacity-80">· <Price p={cost} /></span> : ''}</> : <>Need <Price p={cost} /></>}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
