import { motion } from 'framer-motion'
import { useRef, useState } from 'react'
import { useGame, useActivePet } from '../store/game'
import { ACCESSORIES, type Item } from '../data/items'
import { STAGES, speciesById } from '../data/pets'
import { Modal, Price, ScreenShell, Tabs } from '../components/ui'
import PetArt from '../components/PetArt'
import type { Slot } from '../types'
import { sfx } from '../lib/audio'

const SLOTS: { id: Slot | 'color'; label: string }[] = [
  { id: 'hat', label: '🎩 Hats' }, { id: 'glasses', label: '👓 Glasses' }, { id: 'neck', label: '🎀 Necklaces' },
  { id: 'shoes', label: '👟 Shoes' }, { id: 'wings', label: '🪽 Wings' }, { id: 'effect', label: '✨ Effects' }, { id: 'color', label: '🎨 Colors' },
]

export default function Customize() {
  const pet = useActivePet()!
  const g = useGame()
  const sp = speciesById(pet.species)
  const [slot, setSlot] = useState<Slot | 'color'>('hat')
  const [turn, setTurn] = useState(0)
  const [trying, setTrying] = useState<Item | null>(null)
  const [buying, setBuying] = useState<Item | null>(null)
  const drag = useRef<number | null>(null)

  const preview = { ...pet, equipped: trying ? { ...pet.equipped, [trying.slot!]: trying.id } : pet.equipped }
  const items = ACCESSORIES.filter((a) => a.slot === slot)

  return (
    <ScreenShell title="Style Studio" icon="👗" right={<button className="btn btn-white !min-h-11" onClick={() => g.go('home')}>Done</button>}>
      <div className="grid md:grid-cols-[1fr_1.2fr] gap-4">
        <div className="card p-4 flex flex-col items-center">
          <div className="relative w-full h-72 grid place-items-center rounded-3xl touch-none cursor-grab active:cursor-grabbing" style={{ background: 'radial-gradient(circle at 50% 80%,#fff,#ffe9f5 60%,#e6e0ff)', perspective: 700 }}
            onPointerDown={(e) => { drag.current = e.clientX; (e.target as HTMLElement).setPointerCapture?.(e.pointerId) }}
            onPointerMove={(e) => { if (drag.current !== null) { setTurn((t) => t + (e.clientX - drag.current!) * 0.8); drag.current = e.clientX } }}
            onPointerUp={() => (drag.current = null)} aria-label="Drag to rotate your pet">
            <div className="absolute bottom-6 w-48 h-8 rounded-[50%] bg-pink-200/70" />
            <motion.div style={{ rotateY: turn, transformStyle: 'preserve-3d' }}>
              <div style={{ transform: `scale(${STAGES[pet.stage].scale})`, transformOrigin: 'bottom' }}>
                <PetArt pet={preview} mood="happy" size={220} />
              </div>
            </motion.div>
            {trying && <span className="absolute top-3 left-3 pill bg-yellow-100 text-sm">Trying on: {trying.name}</span>}
          </div>
          <div className="flex gap-2 mt-3">
            <button className="btn btn-white !min-h-11" onClick={() => setTurn((t) => t - 45)} aria-label="Rotate left">↺</button>
            <button className="btn btn-white !min-h-11" onClick={() => setTurn(0)}>Front</button>
            <button className="btn btn-white !min-h-11" onClick={() => setTurn((t) => t + 45)} aria-label="Rotate right">↻</button>
          </div>
          <div className="w-full mt-4">
            <div className="font-display font-bold mb-2">Saved looks</div>
            <div className="flex gap-2 flex-wrap">
              {pet.looks.map((l, i) => (
                <button key={i} onClick={() => g.applyLook(i)} className="rounded-2xl bg-pink-50 p-1 pr-3 flex items-center gap-1 font-bold text-sm min-h-12">
                  <PetArt pet={{ ...pet, equipped: l.equipped, color: l.color }} size={40} />{l.name}
                </button>
              ))}
              <button className="btn btn-blue !min-h-12 !text-sm" onClick={() => g.saveLook(`Look ${pet.looks.length + 1}`)}>📸 Save this look</button>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <Tabs onCard value={slot} onChange={(s) => { setSlot(s); setTrying(null) }} tabs={SLOTS} />
          {slot === 'color' ? (
            <div className="grid grid-cols-3 gap-3">
              {sp.palettes.map((pal, i) => (
                <button key={i} onClick={() => g.setColor(i)} className={`rounded-3xl p-2 bg-slate-50 ${pet.color === i ? 'ring-4 ring-candy' : ''}`} aria-label={`Color ${i + 1}`}>
                  <PetArt pet={{ ...pet, color: i }} size={90} />
                  <div className="flex justify-center gap-1 mt-1">{pal.map((c) => <span key={c} className="w-4 h-4 rounded-full border border-black/10" style={{ background: c }} />)}</div>
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <button onClick={() => { g.equip(slot, null); setTrying(null) }} className={`rounded-3xl bg-slate-50 p-3 min-h-32 font-display font-bold ${!pet.equipped[slot] ? 'ring-4 ring-candy' : ''}`}>
                <div className="text-4xl">🚫</div>None
              </button>
              {items.map((it) => {
                const owned = g.owned.includes(it.id)
                const on = pet.equipped[slot] === it.id
                const locked = (it.minStage ?? 0) > pet.stage
                return (
                  <button key={it.id} disabled={locked}
                    onClick={() => { if (owned) { g.equip(slot, on ? null : it.id); setTrying(null) } else { sfx.tap(); setTrying(it) } }}
                    className={`relative rounded-3xl p-3 min-h-32 text-center ${on ? 'ring-4 ring-candy bg-pink-50' : trying?.id === it.id ? 'ring-4 ring-yellow-300 bg-yellow-50' : 'bg-slate-50'} ${locked ? 'opacity-50' : ''}`}>
                    <div className="text-4xl">{locked ? '🔒' : it.icon}</div>
                    <div className="font-display font-bold text-sm leading-tight mt-1">{it.name}</div>
                    <div className="text-xs mt-1">{locked ? `${STAGES[it.minStage!].name}+` : owned ? (on ? '✓ Wearing' : 'Owned') : <Price p={it.price} />}</div>
                  </button>
                )
              })}
            </div>
          )}
          {trying && !g.owned.includes(trying.id) && (
            <div className="mt-4 p-3 rounded-2xl bg-yellow-50 flex items-center gap-3">
              <span className="text-3xl">{trying.icon}</span>
              <span className="flex-1 font-bold">Like the {trying.name}?</span>
              <button className="btn btn-gold !min-h-11" onClick={() => setBuying(trying)}>Buy <Price p={trying.price} /></button>
            </div>
          )}
        </div>
      </div>

      <Modal open={!!buying} onClose={() => setBuying(null)} title="Buy accessory?">
        {buying && (
          <div className="text-center">
            <div className="text-6xl">{buying.icon}</div>
            <div className="font-display font-bold text-xl">{buying.name}</div>
            <div className="mt-2 font-bold">Cost: <Price p={buying.price} /></div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button className="btn btn-white" onClick={() => setBuying(null)}>Cancel</button>
              <button className="btn btn-gold" onClick={() => { if (g.buy(buying.id)) { g.equip(buying.slot!, buying.id); setTrying(null) } setBuying(null) }}>Buy & wear</button>
            </div>
          </div>
        )}
      </Modal>
    </ScreenShell>
  )
}
