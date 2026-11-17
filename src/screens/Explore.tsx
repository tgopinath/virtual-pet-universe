import { motion } from 'framer-motion'
import { useGame, achievementValue } from '../store/game'
import { WORLDS } from '../data/worlds'
import { ACHIEVEMENTS, levelInfo } from '../data/progress'
import { ScreenShell } from '../components/ui'

export default function Explore() {
  const g = useGame()
  const lv = levelInfo(g.player.xp).level
  return (
    <ScreenShell title="Explore" icon="🗺️">
      <p className="text-white font-bold drop-shadow mb-3">Travel between worlds. Each world has its own look, music and featured game. Level up to unlock more!</p>
      <div className="grid sm:grid-cols-2 gap-4">
        {WORLDS.map((w, i) => {
          const open = g.unlockedWorlds.includes(w.id)
          const ach = w.unlock.achievement ? ACHIEVEMENTS.find((a) => a.id === w.unlock.achievement)! : null
          const achOk = !ach || achievementValue(g, ach.stat) >= ach.goal
          const lvOk = lv >= w.unlock.level
          const coinOk = g.coins >= w.unlock.coins
          const here = g.world === w.id
          return (
            <motion.div key={w.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="relative rounded-[28px] overflow-hidden shadow-xl min-h-52" style={{ background: w.sky }}>
              <div className="absolute bottom-0 inset-x-0 h-1/3" style={{ background: w.ground }} />
              <div className="absolute bottom-[25%] inset-x-0 flex justify-around text-5xl">{w.props.slice(0, 4).map((p, k) => <span key={k} className="float-y" style={{ animationDelay: `${k * 0.4}s` }}>{p}</span>)}</div>
              {!open && <div className="absolute inset-0 bg-slate-900/45 backdrop-grayscale" />}
              <div className="relative p-4 flex flex-col h-full min-h-52">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className={`text-2xl font-bold ${['space', 'forest'].includes(w.id) || !open ? 'text-white' : 'text-ink'}`}>{w.icon} {w.name}</h2>
                    <p className={`text-sm font-bold ${['space', 'forest'].includes(w.id) || !open ? 'text-white/85' : 'text-ink/70'}`}>{w.desc}</p>
                  </div>
                  {here && <span className="pill bg-white text-sm">📍 You're here</span>}
                </div>
                <div className="mt-auto pt-16">
                  {open ? (
                    <button className="btn btn-blue w-full" disabled={here} onClick={() => g.travel(w.id)}>{here ? 'Current world' : `Travel to ${w.name} ✈️`}</button>
                  ) : (
                    <div className="glass rounded-2xl p-3">
                      <div className="text-sm font-extrabold space-y-0.5">
                        <div>{lvOk ? '✅' : '🔒'} Reach level {w.unlock.level} <span className="text-ink/50">(you: {lv})</span></div>
                        {w.unlock.coins > 0 && <div>{coinOk ? '✅' : '🪙'} {w.unlock.coins} coins</div>}
                        {ach && <div>{achOk ? '✅' : '🏅'} Earn “{ach.name}”</div>}
                      </div>
                      <button className="btn btn-gold w-full mt-2 !min-h-11" disabled={!lvOk || !coinOk || !achOk} onClick={() => g.unlockWorld(w.id)}>Unlock 🔓</button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </ScreenShell>
  )
}
