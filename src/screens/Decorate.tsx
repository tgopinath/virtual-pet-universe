import { motion } from 'framer-motion'
import { useRef, useState } from 'react'
import { useGame, useActivePet } from '../store/game'
import { FURNITURE, ROOM_THEMES, itemById } from '../data/items'
import { RoomBackdrop } from '../components/Scene'
import PetArt from '../components/PetArt'
import { sfx } from '../lib/audio'

export default function Decorate() {
  const g = useGame()
  const pet = useActivePet()!
  const box = useRef<HTMLDivElement>(null)
  const [sel, setSel] = useState<string | null>(null)
  const [panel, setPanel] = useState<'furniture' | 'themes' | 'layouts'>('furniture')
  const placedIds = new Set(g.room.items.map((i) => i.id))
  const owned = FURNITURE.filter((f) => g.owned.includes(f.id))
  const selItem = g.room.items.find((i) => i.uid === sel)

  const onDragEnd = (uid: string, e: PointerEvent | MouseEvent | TouchEvent) => {
    const r = box.current?.getBoundingClientRect()
    if (!r) return
    const pt = 'changedTouches' in e ? e.changedTouches[0] : (e as PointerEvent)
    const x = Math.max(5, Math.min(95, ((pt.clientX - r.left) / r.width) * 100))
    const y = Math.max(10, Math.min(98, ((pt.clientY - r.top) / r.height) * 100 + 4))
    g.moveFurniture(uid, x, y)
    sfx.step()
  }

  return (
    <div className="absolute inset-0">
      <RoomBackdrop theme={g.room.theme}>
        <div ref={box} className="absolute inset-x-0" style={{ bottom: 240, top: 150 }} onClick={() => setSel(null)}>
          {g.room.items.map((f) => {
            const it = itemById(f.id)!
            return (
              <div key={f.uid + f.x + f.y} className="absolute -translate-x-1/2 -translate-y-full" style={{ left: `${f.x}%`, top: `${f.y}%` }}>
                <motion.div drag dragMomentum={false} onDragStart={() => setSel(f.uid)} onDragEnd={(e) => onDragEnd(f.uid, e)}
                  onClick={(e) => { e.stopPropagation(); sfx.tap(); setSel(f.uid) }}
                  className={`cursor-grab active:cursor-grabbing touch-none leading-none rounded-2xl ${sel === f.uid ? 'outline-4 outline-dashed outline-yellow-300 outline-offset-4' : ''}`}
                  style={{ fontSize: `${it.w ?? 4}rem` }}
                  role="button" aria-label={`${it.name}. Drag to move.`}>
                  <span style={{ display: 'inline-block', transform: `scaleX(${f.flip ? -1 : 1}) rotate(${f.rot}deg)` }}>{it.icon}</span>
                </motion.div>
              </div>
            )
          })}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none opacity-90"><PetArt pet={pet} size={140} mood="happy" /></div>
        </div>
      </RoomBackdrop>

      <div className="absolute top-[76px] inset-x-3 z-20 flex justify-between items-start gap-2">
        <div className="card px-4 py-2 font-display font-bold">🛋️ Decorating — drag items to move them</div>
        <button className="btn btn-green !min-h-12" onClick={() => { sfx.success(); g.go('home') }}>✓ Done</button>
      </div>

      {selItem && (
        <motion.div className="absolute top-[140px] left-1/2 -translate-x-1/2 z-30 card p-2 flex gap-2" initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <span className="px-2 self-center font-display font-bold">{itemById(selItem.id)?.name}</span>
          <button className="btn btn-white !min-h-11 !px-3" onClick={() => g.updateFurniture(selItem.uid, { flip: !selItem.flip })} aria-label="Flip">↔️</button>
          <button className="btn btn-white !min-h-11 !px-3" onClick={() => g.updateFurniture(selItem.uid, { rot: (selItem.rot + 15) % 360 })} aria-label="Rotate">🔄</button>
          <button className="btn btn-white !min-h-11 !px-3" onClick={() => g.updateFurniture(selItem.uid, { rot: 0, flip: false })} aria-label="Reset">⟲</button>
          <button className="btn !min-h-11 !px-3" onClick={() => { g.removeFurniture(selItem.uid); setSel(null) }} aria-label="Put away">🗑️</button>
        </motion.div>
      )}

      <div className="absolute inset-x-0 bottom-[92px] z-30 px-3">
        <div className="max-w-3xl mx-auto card p-3">
          <div className="flex gap-2 mb-2">
            {(['furniture', 'themes', 'layouts'] as const).map((p) => (
              <button key={p} onClick={() => setPanel(p)} className={`px-4 min-h-11 rounded-full font-display font-semibold capitalize ${panel === p ? 'bg-candy text-white' : 'bg-slate-100'}`}>{p}</button>
            ))}
          </div>
          {panel === 'furniture' && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {owned.map((f) => {
                const placed = placedIds.has(f.id)
                return (
                  <button key={f.id} disabled={placed} onClick={() => g.addFurniture(f.id)} className={`shrink-0 w-20 rounded-2xl p-2 text-center ${placed ? 'bg-slate-100 opacity-50' : 'bg-pink-50'}`}>
                    <div className="text-4xl">{f.icon}</div>
                    <div className="text-[11px] font-extrabold leading-tight">{placed ? 'Placed' : f.name}</div>
                  </button>
                )
              })}
              <button className="shrink-0 w-20 rounded-2xl border-4 border-dashed border-pink-200 font-display font-bold text-pink-400" onClick={() => g.go('shop')}>+ Shop</button>
            </div>
          )}
          {panel === 'themes' && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {ROOM_THEMES.map((t) => {
                const own = g.ownedThemes.includes(t.id)
                return (
                  <button key={t.id} onClick={() => (own ? g.setTheme(t.id) : g.buyTheme(t.id))} className={`shrink-0 w-28 rounded-2xl p-1.5 ${g.room.theme === t.id ? 'ring-4 ring-candy' : ''}`}>
                    <div className="h-14 rounded-xl relative overflow-hidden" style={{ background: t.wall }}><div className="absolute bottom-0 inset-x-0 h-1/3" style={{ background: t.floor }} /></div>
                    <div className="text-xs font-extrabold mt-1">{t.name}</div>
                    <div className="text-[11px] font-bold">{own ? (g.room.theme === t.id ? '✓ Using' : 'Owned') : `🪙 ${t.price}`}</div>
                  </button>
                )
              })}
            </div>
          )}
          {panel === 'layouts' && (
            <div className="flex gap-2 flex-wrap items-center">
              {g.savedLayouts.map((l, i) => (
                <button key={i} className="btn btn-white !min-h-11 !text-sm" onClick={() => g.loadLayout(i)}>📐 {l.name}</button>
              ))}
              <button className="btn btn-blue !min-h-11 !text-sm" onClick={() => g.saveLayout(`Layout ${g.savedLayouts.length + 1}`)}>💾 Save current layout</button>
              <span className="text-xs font-bold text-ink/50">Changes save automatically; saved layouts let you swap styles.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
