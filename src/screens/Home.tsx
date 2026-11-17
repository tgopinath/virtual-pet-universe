import { AnimatePresence, motion, type PanInfo } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { useGame, useActivePet } from '../store/game'
import PetActor, { needIcon } from '../components/PetActor'
import { RoomBackdrop, WorldBackdrop } from '../components/Scene'
import { StatsPanel, Tabs } from '../components/ui'
import { CARE, FOODS, TOYS, itemById, type Item } from '../data/items'
import { STAGES, speciesById } from '../data/pets'
import { SKILLS } from '../data/progress'
import { sfx } from '../lib/audio'

type DrawerTab = 'food' | 'toys' | 'care'

export default function Home() {
  const pet = useActivePet()!
  const g = useGame()
  const petRef = useRef<HTMLDivElement>(null)
  const [inside, setInside] = useState(true)
  const [hover, setHover] = useState(false)
  const [tab, setTab] = useState<DrawerTab>('food')
  const [petX, setPetX] = useState(50)
  const [statsOpen, setStatsOpen] = useState(true)
  const [tricksOpen, setTricksOpen] = useState(false)
  const [propCooldown, setPropCooldown] = useState<Record<string, number>>({})
  const sp = speciesById(pet.species)

  // gentle, optional reminders spoken by the pet
  useEffect(() => {
    if (!g.settings.reminders) return
    const t = setInterval(() => {
      const p = useGame.getState().pets.find((x) => x.id === pet.id)
      const n = p && needIcon(p)
      if (n && !p.sleeping) useGame.getState().say(`${n.icon} ${n.label}`)
    }, 40000)
    return () => clearInterval(t)
  }, [pet.id, g.settings.reminders])

  const overPet = (info: PanInfo) => {
    const r = petRef.current?.getBoundingClientRect()
    if (!r) return false
    const { x, y } = { x: info.point.x - window.scrollX, y: info.point.y - window.scrollY }
    return x > r.left - 20 && x < r.right + 20 && y > r.top - 20 && y < r.bottom + 20
  }

  const useItem = (it: Item) => {
    if (it.kind === 'food') g.feed(it.id)
    else if (it.kind === 'toy') g.useToy(it.id)
    else g.care(it.id)
  }

  const visit = (fid: string, x: number) => {
    const f = itemById(fid)
    if (!f) return
    sfx.step()
    setPetX(Math.max(15, Math.min(85, x)))
    setTimeout(() => {
      if (f.use === 'sleep') { if (!pet.sleeping) g.toggleSleep() }
      else if (f.use === 'eat') { const food = FOODS.find((fd) => (g.inventory[fd.id] ?? 0) > 0); if (food) g.feed(food.id); else g.say('The bowl is empty... 🥺') }
      else if (f.use === 'play') { g.play('jump'); g.say(`I love the ${f.name}! ${f.icon}`); useGame.getState().reward({ petXp: 2 }) }
      else { g.play('sit'); g.say(`So comfy ${f.icon}`) }
      setTimeout(() => setPetX(50), 2600)
    }, 700)
  }

  const onProp = (e: string) => {
    sfx.pop()
    const now = Date.now()
    if ((propCooldown[e] ?? 0) < now && Math.random() < 0.5) {
      setPropCooldown((c) => ({ ...c, [e]: now + 5 * 60_000 }))
      g.reward({ coins: 3 + Math.floor(Math.random() * 5) })
      g.say(`Ooh, something shiny near the ${e}!`)
    } else g.say(['Pretty!', 'Ooh!', 'What’s that?', 'Hehe!'][Math.floor(Math.random() * 4)] + ' ' + e)
    g.play('jump')
  }

  const items: Item[] = tab === 'food' ? FOODS : tab === 'toys' ? TOYS : CARE
  const nextStage = STAGES[pet.stage + 1]
  const stageProgress = nextStage ? Math.min(1, (pet.xp - STAGES[pet.stage].xp) / (nextStage.xp - STAGES[pet.stage].xp)) : 1
  const learned = SKILLS.filter((s) => (pet.skills[s.id] ?? 0) > 0)

  const scene = (
    <motion.div className="absolute inset-x-0 h-[60%]" initial={false} animate={{ bottom: g.feedOpen ? 250 : '15%' }} transition={{ type: 'spring', damping: 20 }}>
      {inside && g.room.items.map((f) => {
        const it = itemById(f.id)
        if (!it) return null
        return (
          <div key={f.uid} className="absolute -translate-x-1/2 -translate-y-full" style={{ left: `${f.x}%`, top: `${f.y}%` }}>
            <motion.button onClick={() => visit(f.id, f.x)} whileTap={{ scale: 1.1 }} className="leading-none" aria-label={`${it.name} — tap to send ${pet.name}`}
              style={{ fontSize: `${it.w ?? 4}rem`, filter: 'drop-shadow(0 6px 5px rgba(0,0,0,.18))' }}>
              <span style={{ display: 'inline-block', transform: `scaleX(${f.flip ? -1 : 1}) rotate(${f.rot}deg)` }}>{it.icon}</span>
            </motion.button>
          </div>
        )
      })}
      <motion.div className="absolute bottom-0 -translate-x-1/2" animate={{ left: `${petX}%` }} transition={{ type: 'spring', stiffness: 60, damping: 14 }}>
        <PetActor ref={petRef} pet={pet} size={Math.min(260, window.innerWidth * 0.55)} onTap={g.petPet} highlight={hover} />
      </motion.div>
    </motion.div>
  )

  return (
    <div className="absolute inset-0">
      {inside ? <RoomBackdrop theme={g.room.theme}>{scene}</RoomBackdrop> : <WorldBackdrop world={g.world} interactive onProp={onProp}>{scene}</WorldBackdrop>}

      {/* pet status card */}
      <div className="absolute left-3 top-[76px] z-20 w-[min(calc(100vw-96px),340px)]">
        <motion.div layout className="card p-3">
          <button className="w-full flex items-center gap-2 text-left" onClick={() => setStatsOpen((o) => !o)} aria-expanded={statsOpen}>
            <span className="text-2xl">{sp.label === 'Dragon' ? '🐉' : '🐾'}</span>
            <span className="flex-1 min-w-0">
              <span className="block font-display font-bold text-lg leading-tight truncate">{pet.name}</span>
              <span className="block text-xs font-extrabold text-ink/60">{STAGES[pet.stage].name} {sp.label}{nextStage ? ` · ${Math.round(stageProgress * 100)}% to ${nextStage.name}` : ' · Max stage!'}</span>
            </span>
            <span className="text-ink/50 font-bold">{statsOpen ? '▲' : '▼'}</span>
          </button>
          <div className="h-2 mt-2 rounded-full bg-black/10 overflow-hidden" aria-label="Growth progress">
            <motion.div className="h-full bg-gradient-to-r from-yellow-300 to-pink-400" animate={{ width: `${stageProgress * 100}%` }} />
          </div>
          {nextStage?.name === 'Legendary' && pet.stats.friendship < 70 && <div className="text-[11px] font-extrabold text-pink-600 mt-1">Needs 70 friendship to become Legendary 💖</div>}
          <AnimatePresence initial={false}>
            {statsOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="pt-3"><StatsPanel stats={pet.stats} compact /></div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* side actions */}
      <div className="absolute right-3 top-[76px] z-20 flex flex-col gap-2">
        <SideBtn icon={pet.sleeping ? '☀️' : '🌙'} label={pet.sleeping ? 'Wake' : 'Sleep'} onClick={g.toggleSleep} />
        <SideBtn icon="🛁" label="Bath" onClick={() => g.care('soap')} badge={g.inventory.soap ?? 0} />
        <SideBtn icon="🎪" label="Tricks" onClick={() => setTricksOpen((o) => !o)} />
        <SideBtn icon="👗" label="Style" onClick={() => g.go('customize')} />
        <SideBtn icon="🛋️" label="Decor" onClick={() => { setInside(true); g.go('decorate') }} />
        <SideBtn icon="📚" label="Pets" onClick={() => g.go('collection')} />
        <SideBtn icon={inside ? '🌳' : '🏠'} label={inside ? 'Outside' : 'Inside'} onClick={() => { sfx.whoosh(); setInside((v) => !v) }} />
      </div>

      {g.dailyRewardReady() && (
        <motion.button className="absolute left-3 z-20 bottom-[max(110px,15%)] btn btn-gold !min-h-14" animate={{ rotate: [-3, 3, -3] }} transition={{ repeat: Infinity, duration: 1 }} onClick={g.claimDailyReward}>
          🎁 Daily gift!
        </motion.button>
      )}

      {/* tricks */}
      <AnimatePresence>
        {tricksOpen && (
          <motion.div className="absolute right-20 top-[76px] z-30 card p-3 w-56" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <div className="font-display font-bold mb-2">Tricks {pet.name} knows</div>
            {learned.length === 0 ? (
              <div className="text-sm font-bold text-ink/60">No tricks yet! <button className="underline text-sky" onClick={() => g.go('train')}>Go train</button></div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {learned.map((s) => (
                  <button key={s.id} className="rounded-2xl bg-sky-50 min-h-14 font-display font-semibold text-sm" onClick={() => g.performTrick(s.id)}>
                    <span className="text-xl block">{s.icon}</span>{s.name}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* feed / toy / care drawer */}
      <AnimatePresence>
        {g.feedOpen && (
          <motion.div className="absolute inset-x-0 bottom-[92px] z-30 px-3" initial={{ y: 200, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 200, opacity: 0 }} transition={{ type: 'spring', damping: 22 }}>
            <div className="max-w-3xl mx-auto card p-3">
              <div className="flex items-center justify-between">
                <Tabs onCard tabs={[{ id: 'food', label: '🍎 Food' }, { id: 'toys', label: '⚽ Toys' }, { id: 'care', label: '🫧 Care' }]} value={tab} onChange={(t) => { sfx.tap(); setTab(t) }} />
                <button className="w-11 h-11 rounded-full bg-slate-100 font-bold shrink-0 mb-2" aria-label="Close drawer" onClick={() => g.setFeedOpen(false)}>✕</button>
              </div>
              <p className="text-xs font-extrabold text-ink/50 -mt-1 mb-2">Drag onto {pet.name} — or tap to use.</p>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {items.map((it) => {
                  const count = it.kind === 'toy' ? (g.inventory[it.id] ? '∞' : 0) : it.id === 'brush' ? '∞' : g.inventory[it.id] ?? 0
                  const empty = count === 0
                  return (
                    <div key={it.id} className="shrink-0 w-20 text-center">
                      <motion.button
                        drag={!empty} dragSnapToOrigin dragElastic={0.9} whileDrag={{ scale: 1.4, zIndex: 50 }}
                        onDrag={(_, info) => setHover(overPet(info))}
                        onDragEnd={(_, info) => { setHover(false); if (overPet(info)) useItem(it) }}
                        onTap={() => (empty ? g.go('shop') : useItem(it))}
                        className={`relative w-20 h-20 rounded-3xl text-4xl grid place-items-center touch-none ${empty ? 'bg-slate-100 opacity-50' : 'bg-gradient-to-b from-white to-pink-50 shadow-md'}`}
                        aria-label={`${it.name}, ${count} left. ${it.desc}`}>
                        {it.icon}
                        <span className="absolute -top-1 -right-1 min-w-6 h-6 px-1 rounded-full bg-candy text-white text-xs font-extrabold grid place-items-center">{count}</span>
                      </motion.button>
                      <div className="text-[11px] font-extrabold mt-1 leading-tight">{it.name}</div>
                    </div>
                  )
                })}
                <button className="shrink-0 w-20 h-20 rounded-3xl border-4 border-dashed border-pink-200 font-display font-bold text-pink-400" onClick={() => g.go('shop')}>+ Shop</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function SideBtn({ icon, label, onClick, badge }: { icon: string; label: string; onClick: () => void; badge?: number }) {
  return (
    <motion.button whileTap={{ scale: 0.9 }} onClick={() => { sfx.tap(); onClick() }} className="relative glass w-14 h-14 rounded-2xl shadow-md flex flex-col items-center justify-center" aria-label={label}>
      <span className="text-2xl leading-none">{icon}</span>
      <span className="text-[10px] font-display font-semibold leading-none mt-0.5">{label}</span>
      {badge !== undefined && <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-sky text-white text-[10px] font-extrabold grid place-items-center">{badge}</span>}
    </motion.button>
  )
}
