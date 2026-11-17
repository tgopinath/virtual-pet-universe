import { motion } from 'framer-motion'
import { useState } from 'react'
import { useGame, useActivePet } from '../store/game'
import { ACCESSORIES, CARE, FOODS, FURNITURE, ROOM_THEMES, TOYS, type Item } from '../data/items'
import { Modal, Price, RarityTag, ScreenShell, Tabs } from '../components/ui'
import { SPECIES } from '../data/pets'
import PetArt from '../components/PetArt'
import { STAGES } from '../data/pets'

type T = 'food' | 'toys' | 'care' | 'acc' | 'furn' | 'themes' | 'special' | 'pets'

export default function Shop() {
  const g = useGame()
  const pet = useActivePet()
  const [tab, setTab] = useState<T>('food')
  const [confirm, setConfirm] = useState<Item | null>(null)
  const [qty, setQty] = useState(1)

  const list: Item[] =
    tab === 'food' ? FOODS.filter((f) => !f.special) :
    tab === 'toys' ? TOYS :
    tab === 'care' ? CARE.filter((c) => c.price.coins) :
    tab === 'acc' ? ACCESSORIES :
    tab === 'furn' ? FURNITURE :
    tab === 'special' ? FOODS.filter((f) => f.special) : []

  const isOwned = (it: Item) => (it.kind === 'accessory' || it.kind === 'furniture' ? g.owned.includes(it.id) : it.kind === 'toy' ? (g.inventory[it.id] ?? 0) > 0 : false)
  const stackable = (it: Item) => it.kind === 'food' || it.kind === 'care'

  return (
    <ScreenShell title="Shop" icon="🛍️" right={<div className="flex gap-2"><span className="glass pill">🪙 {g.coins}</span><span className="glass pill">💎 {g.gems}</span></div>}>
      <Tabs<T> value={tab} onChange={setTab} tabs={[
        { id: 'food', label: '🍎 Food' }, { id: 'special', label: '🌈 Special' }, { id: 'toys', label: '⚽ Toys' }, { id: 'care', label: '🫧 Care' },
        { id: 'acc', label: '🎩 Accessories' }, { id: 'furn', label: '🛋️ Furniture' }, { id: 'themes', label: '🎨 Rooms' }, { id: 'pets', label: '🐾 Pets' },
      ]} />

      {tab === 'themes' ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {ROOM_THEMES.map((t) => {
            const own = g.ownedThemes.includes(t.id)
            return (
              <div key={t.id} className="card p-3">
                <div className="h-24 rounded-2xl relative overflow-hidden" style={{ background: t.wall }}><div className="absolute bottom-0 inset-x-0 h-1/3" style={{ background: t.floor }} /></div>
                <div className="font-display font-bold mt-2">{t.name}</div>
                {own ? (
                  <button className="btn btn-white w-full !min-h-11 mt-2" onClick={() => g.setTheme(t.id)}>{g.room.theme === t.id ? '✓ Using' : 'Use'}</button>
                ) : (
                  <button className="btn btn-gold w-full !min-h-11 mt-2" onClick={() => g.buyTheme(t.id)}>🪙 {t.price}</button>
                )}
              </div>
            )
          })}
        </div>
      ) : tab === 'pets' ? (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {SPECIES.map((s) => {
              const has = g.pets.some((p) => p.species === s.id)
              return (
                <div key={s.id} className="card p-3 text-center">
                  <RarityTag r={s.rarity} />
                  <div className="grid place-items-center h-24"><PetArt pet={{ species: s.id, color: 0, equipped: {}, stage: 0 }} size={90} /></div>
                  <div className="font-display font-bold">{s.label}</div>
                  <div className="text-sm">{has ? <span className="font-bold text-mint">✓ Adopted</span> : <Price p={s.adoptCost} />}</div>
                </div>
              )
            })}
          </div>
          <button className="btn btn-gold w-full mt-4" onClick={() => g.go('adopt')}>Visit the Adoption Center 🏠</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {list.map((it, i) => {
            const owned = isOwned(it)
            const locked = (it.minStage ?? 0) > (pet?.stage ?? 0)
            return (
              <motion.button key={it.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }} whileTap={{ scale: 0.96 }}
                disabled={owned || locked} onClick={() => { setQty(1); setConfirm(it) }}
                className={`card p-3 text-left relative ${owned ? 'opacity-70' : ''}`}>
                {it.special && <span className="absolute top-2 right-2 pill bg-yellow-100 text-[10px]">SPECIAL</span>}
                <div className="h-20 grid place-items-center text-5xl rounded-2xl bg-gradient-to-b from-pink-50 to-sky-50">{locked ? '🔒' : it.icon}</div>
                <div className="font-display font-bold mt-2 leading-tight">{it.name}</div>
                <div className="text-xs font-bold text-ink/60 min-h-8">{locked ? `Needs ${STAGES[it.minStage!].name} pet` : it.desc}</div>
                {it.effect && <div className="text-[11px] font-extrabold text-ink/50">{Object.entries(it.effect).map(([k, v]) => `${v! > 0 ? '+' : ''}${v} ${k}`).join(' · ')}</div>}
                <div className="flex justify-between items-center mt-2">
                  {owned ? <span className="font-bold text-mint">✓ Owned</span> : <Price p={it.price} />}
                  {stackable(it) && <span className="text-xs font-extrabold text-ink/50">Have {g.inventory[it.id] ?? 0}</span>}
                </div>
              </motion.button>
            )
          })}
        </div>
      )}

      <Modal open={!!confirm} onClose={() => setConfirm(null)} title="Buy this?">
        {confirm && (() => {
          const unit = confirm.price.gems ? confirm.price.gems : confirm.price.coins ?? 0
          const cur = confirm.price.gems ? '💎' : '🪙'
          const total = unit * qty
          const can = confirm.price.gems ? total <= g.gems : total <= g.coins
          return (
            <div className="text-center">
              <div className="text-7xl">{confirm.icon}</div>
              <div className="text-2xl font-display font-bold mt-1">{confirm.name}</div>
              <p className="font-bold text-ink/60">{confirm.desc}</p>
              {stackable(confirm) && (
                <div className="flex items-center justify-center gap-4 mt-4">
                  <button className="w-12 h-12 rounded-full bg-slate-100 text-2xl font-bold" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Fewer">−</button>
                  <span className="text-3xl font-display font-bold w-10">{qty}</span>
                  <button className="w-12 h-12 rounded-full bg-slate-100 text-2xl font-bold" onClick={() => setQty((q) => Math.min(20, q + 1))} aria-label="More">+</button>
                </div>
              )}
              <div className="mt-4 text-xl font-bold">Total: {cur} {total}</div>
              <div className="text-sm font-bold text-ink/50">You have {cur} {confirm.price.gems ? g.gems : g.coins}</div>
              <div className="grid grid-cols-2 gap-3 mt-5">
                <button className="btn btn-white" onClick={() => setConfirm(null)}>Not now</button>
                <button className="btn btn-gold" disabled={!can} onClick={() => { if (g.buy(confirm.id, qty)) setConfirm(null) }}>{can ? 'Buy!' : 'Not enough'}</button>
              </div>
              {confirm.kind === 'accessory' && <button className="mt-3 font-bold text-sky min-h-11" onClick={() => { setConfirm(null); g.go('customize') }}>Preview in Style Studio →</button>}
            </div>
          )
        })()}
      </Modal>
    </ScreenShell>
  )
}
