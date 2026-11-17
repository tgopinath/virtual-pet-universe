import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import PetArt from '../components/PetArt'
import { sfx } from '../lib/audio'
import { useGame } from '../store/game'
import type { GameProps } from './common'

const W = 6
const H = 5
type Cell = 'chest' | 'coin' | 'gem' | 'none'

const TILE: Record<string, string> = { garden: '#8fdc7a', snow: '#e8efff', tropical: '#ffe3a1', forest: '#4fa37a', space: '#9a8fd6', dragon: '#c4825d' }

export default function TreasureHunt({ pet, world, onEnd }: GameProps) {
  const maxDigs = 8 + (pet.species === 'fox' ? 1 : 0)
  const grid = useMemo(() => {
    const cells: Cell[] = Array(W * H).fill('none')
    const free = () => { let i; do i = Math.floor(Math.random() * W * H); while (cells[i] !== 'none'); return i }
    cells[free()] = 'chest'
    for (let k = 0; k < 5; k++) cells[free()] = 'coin'
    cells[free()] = 'gem'
    return cells
  }, [])
  const chestAt = grid.indexOf('chest')
  const [dug, setDug] = useState<number[]>([])
  const [score, setScore] = useState(0)
  const [over, setOver] = useState(false)
  const [petAt, setPetAt] = useState(0)

  const dist = (i: number) => Math.abs((i % W) - (chestAt % W)) + Math.abs(Math.floor(i / W) - Math.floor(chestAt / W))

  const dig = (i: number) => {
    if (over || dug.includes(i)) return
    const d = [...dug, i]
    setDug(d)
    setPetAt(i)
    let sc = score
    const c = grid[i]
    if (c === 'coin') { sc += 5; sfx.coin() } else if (c === 'gem') { sc += 10; sfx.success() } else if (c === 'chest') { sc += 25; sfx.levelUp() } else sfx.step()
    setScore(sc)
    if (c === 'chest' || d.length >= maxDigs) {
      setOver(true)
      const won = c === 'chest' || d.includes(chestAt)
      if (won) {
        // rare chest bonus: a special treat lands in the inventory
        const bonus = ['berry', 'rainbow', 'choco', 'magic'][Math.floor(Math.random() * 4)]
        useGame.setState((s) => ({ inventory: { ...s.inventory, [bonus]: (s.inventory[bonus] ?? 0) + 1 } }))
        useGame.getState().toast('The chest had a special treat inside!', '🎁')
      }
      if (grid[i] === 'gem' || d.some((x) => grid[x] === 'gem')) useGame.getState().reward({ gems: 1 })
      setTimeout(() => onEnd(sc, won), 1200)
    }
  }

  const hintFor = (i: number) => {
    const c = grid[i]
    if (c === 'chest') return '🧰'
    if (c === 'coin') return '🪙'
    if (c === 'gem') return '💎'
    const dd = dist(i)
    return dd <= 1 ? '🔥' : dd <= 3 ? '🌤️' : '🧊'
  }

  return (
    <div className="select-none">
      <div className="flex justify-between font-display font-bold text-lg px-2">
        <span>Digs left: {'⛏️'.repeat(Math.max(0, maxDigs - dug.length))}</span><span>Loot: {score}</span>
      </div>
      <div className="relative mt-2 rounded-3xl p-3" style={{ background: 'linear-gradient(#ffffff55,#00000011)' }}>
        <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${W}, minmax(0,1fr))` }}>
          {grid.map((_, i) => {
            const open = dug.includes(i) || (over && i === chestAt)
            return (
              <motion.button key={i} onClick={() => dig(i)} whileTap={{ scale: 0.9 }}
                className="relative aspect-square rounded-xl grid place-items-center text-2xl sm:text-3xl shadow-inner"
                style={{ background: open ? '#7a5236' : TILE[world] ?? TILE.garden, boxShadow: open ? 'inset 0 4px 8px #0006' : '0 3px 0 #0002' }}
                aria-label={open ? `Dug: ${hintFor(i)}` : 'Dig here'}>
                {open ? <motion.span initial={{ scale: 0, y: 10 }} animate={{ scale: 1, y: 0 }}>{hintFor(i)}</motion.span> : <span className="opacity-30 text-lg">·</span>}
                {petAt === i && dug.length > 0 && !over && <span className="absolute -top-6 pointer-events-none"><PetArt pet={pet} size={44} mood="happy" /></span>}
              </motion.button>
            )
          })}
        </div>
      </div>
      <p className="text-center font-bold text-ink/70 mt-3">🔥 very close · 🌤️ warm · 🧊 cold</p>
      {over && <p className="text-center font-display font-bold text-2xl mt-1">{dug.includes(chestAt) ? 'Treasure found! 🧰✨' : 'Out of digs — the chest was nearby!'}</p>}
    </div>
  )
}
