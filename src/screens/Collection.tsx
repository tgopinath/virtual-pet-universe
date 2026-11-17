import { motion } from 'framer-motion'
import { useState } from 'react'
import { useGame } from '../store/game'
import { SPECIES, STAGES, speciesById } from '../data/pets'
import { SKILLS } from '../data/progress'
import { RarityTag, ScreenShell, StatsPanel } from '../components/ui'
import PetArt, { moodOf } from '../components/PetArt'

export default function Collection() {
  const g = useGame()
  const [view, setView] = useState<string | null>(null)
  const [renaming, setRenaming] = useState('')
  const p = g.pets.find((x) => x.id === view)
  const discovered = new Set(g.pets.map((x) => x.species))

  return (
    <ScreenShell title="My Pets" icon="📚" right={<button className="btn btn-gold !min-h-11" onClick={() => g.go('adopt')}>+ Adopt</button>}>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {g.pets.map((x) => {
          const sp = speciesById(x.species)
          return (
            <motion.button key={x.id} whileTap={{ scale: 0.96 }} onClick={() => { setView(x.id); setRenaming(x.name) }} className={`card p-3 text-left ${g.activePetId === x.id ? 'ring-4 ring-mint' : ''}`}>
              <div className="flex justify-between"><RarityTag r={sp.rarity} />{g.activePetId === x.id && <span className="pill bg-green-100 text-xs">Active</span>}</div>
              <div className="grid place-items-center h-28"><div style={{ transform: `scale(${STAGES[x.stage].scale})` }}><PetArt pet={x} mood={moodOf(x)} size={100} /></div></div>
              <div className="font-display font-bold text-lg">{x.name}</div>
              <div className="text-xs font-extrabold text-ink/60">{STAGES[x.stage].name} {sp.label} · {x.xp} XP</div>
              <div className="h-2 mt-1 rounded-full bg-black/10 overflow-hidden"><div className="h-full bg-pink-400" style={{ width: `${x.stats.friendship}%` }} /></div>
            </motion.button>
          )
        })}
      </div>

      <h2 className="text-2xl font-bold text-white drop-shadow mt-6 mb-2">Pet Discovery Book · {discovered.size}/{SPECIES.length}</h2>
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
        {SPECIES.map((s) => (
          <div key={s.id} className="card p-2 text-center" title={s.label}>
            <div className={discovered.has(s.id) ? '' : 'brightness-0 opacity-25'}><PetArt pet={{ species: s.id, color: 0, equipped: {}, stage: 0 }} size={60} /></div>
            <div className="text-[11px] font-extrabold">{discovered.has(s.id) ? s.label : '???'}</div>
          </div>
        ))}
      </div>

      {g.pets.length > 1 && (
        <>
          <h2 className="text-2xl font-bold text-white drop-shadow mt-6 mb-2">Compare</h2>
          <div className="card p-3 overflow-x-auto">
            <table className="w-full text-sm font-bold">
              <thead><tr className="text-left text-ink/50"><th className="p-1">Pet</th><th>Stage</th><th>XP</th><th>Friend</th><th>Skills</th><th>Health</th></tr></thead>
              <tbody>
                {[...g.pets].sort((a, b) => b.xp - a.xp).map((x) => (
                  <tr key={x.id} className="border-t border-black/5"><td className="p-1">{x.name}</td><td>{STAGES[x.stage].name}</td><td>{x.xp}</td><td>{Math.round(x.stats.friendship)}</td><td>{Object.values(x.skills).filter(Boolean).length}</td><td>{Math.round(x.stats.health)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {p && (
        <div className="fixed inset-0 z-50 bg-indigo-950/40 flex items-end sm:items-center justify-center" onClick={() => setView(null)}>
          <motion.div className="card w-full sm:max-w-lg p-5 max-h-[92vh] overflow-y-auto rounded-b-none sm:rounded-b-[28px]" initial={{ y: 300 }} animate={{ y: 0 }} onClick={(e) => e.stopPropagation()} role="dialog" aria-label={`${p.name} details`}>
            <div className="flex justify-between items-start">
              <div><RarityTag r={speciesById(p.species).rarity} /><div className="text-sm font-extrabold text-ink/60 mt-1">{STAGES[p.stage].name} {speciesById(p.species).breed}</div></div>
              <button onClick={() => setView(null)} className="w-11 h-11 rounded-full bg-slate-100 font-bold" aria-label="Close">✕</button>
            </div>
            <div className="grid place-items-center"><PetArt pet={p} mood={moodOf(p)} size={150} /></div>
            <div className="flex gap-2">
              <input value={renaming} maxLength={14} onChange={(e) => setRenaming(e.target.value)} aria-label="Pet name" className="flex-1 min-w-0 min-h-12 rounded-2xl border-4 border-pink-200 px-3 font-display font-semibold text-xl" />
              <button className="btn btn-white !min-h-12" onClick={() => g.renamePet(p.id, renaming)}>Rename</button>
            </div>
            <div className="mt-3"><StatsPanel stats={p.stats} /></div>
            <div className="mt-3 p-3 rounded-2xl bg-yellow-50 text-sm font-bold">✨ {speciesById(p.species).ability.name}: {speciesById(p.species).ability.desc}</div>
            <div className="mt-3">
              <div className="font-display font-bold mb-1">Skills</div>
              <div className="flex flex-wrap gap-1.5">
                {SKILLS.map((s) => (p.skills[s.id] ? <span key={s.id} className="pill bg-sky-100 text-sm">{s.icon} {s.name} {'★'.repeat(p.skills[s.id])}</span> : null))}
                {!Object.values(p.skills).some(Boolean) && <span className="text-sm font-bold text-ink/50">No skills yet</span>}
              </div>
            </div>
            <div className="text-xs font-bold text-ink/50 mt-3">Adopted {new Date(p.adoptedAt).toLocaleDateString()}</div>
            <button className="btn btn-green w-full mt-4" disabled={g.activePetId === p.id} onClick={() => { g.switchPet(p.id); setView(null) }}>{g.activePetId === p.id ? 'Currently active' : `Play with ${p.name}`}</button>
          </motion.div>
        </div>
      )}
    </ScreenShell>
  )
}
