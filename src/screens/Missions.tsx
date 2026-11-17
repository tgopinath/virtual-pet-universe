import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { useGame, achievementValue } from '../store/game'
import { ACHIEVEMENTS, MISSION_POOL } from '../data/progress'
import { ScreenShell } from '../components/ui'

export default function Missions() {
  const g = useGame()
  useEffect(() => useGame.getState().ensureDaily(), [])
  const ready = g.dailyRewardReady()

  return (
    <ScreenShell title="Missions" icon="📜">
      <div className="card p-4 flex items-center gap-4 mb-4">
        <motion.div className="text-6xl" animate={ready ? { rotate: [-6, 6, -6] } : {}} transition={{ repeat: Infinity, duration: 1 }}>🎁</motion.div>
        <div className="flex-1">
          <div className="font-display font-bold text-xl">Daily Gift</div>
          <div className="text-sm font-bold text-ink/60">Come back each day — streak {g.streak}/7. Missing a day just restarts the streak, nothing is lost.</div>
          <div className="flex gap-1 mt-2">{Array.from({ length: 7 }, (_, i) => <span key={i} className={`flex-1 h-2.5 rounded-full ${i < g.streak ? 'bg-sun' : 'bg-black/10'}`} />)}</div>
        </div>
        <button className="btn btn-gold" disabled={!ready} onClick={g.claimDailyReward}>{ready ? 'Open!' : 'Claimed ✓'}</button>
      </div>

      <h2 className="text-2xl font-bold text-white drop-shadow mb-2">Today's missions</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        {g.daily.missions.map((id) => {
          const m = MISSION_POOL.find((x) => x.id === id)!
          const prog = g.daily.progress[id] ?? 0
          const done = prog >= m.goal
          const claimed = g.daily.claimed.includes(id)
          return (
            <div key={id} className={`card p-4 ${claimed ? 'opacity-60' : ''}`}>
              <div className="flex justify-between gap-2 items-start">
                <div className="font-display font-bold text-lg">{m.text}</div>
                <div className="text-sm font-extrabold whitespace-nowrap">{m.reward.coins ? `🪙${m.reward.coins} ` : ''}{m.reward.gems ? `💎${m.reward.gems} ` : ''}⭐{m.reward.xp}</div>
              </div>
              <div className="h-3 mt-2 rounded-full bg-black/10 overflow-hidden"><motion.div className="h-full bg-mint" animate={{ width: `${(prog / m.goal) * 100}%` }} /></div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm font-extrabold text-ink/60">{Math.min(prog, m.goal)} / {m.goal}</span>
                <button className="btn btn-green !min-h-11 !py-1" disabled={!done || claimed} onClick={() => g.claimMission(id)}>{claimed ? 'Done ✓' : done ? 'Claim!' : 'In progress'}</button>
              </div>
            </div>
          )
        })}
      </div>

      <h2 className="text-2xl font-bold text-white drop-shadow mt-6 mb-2">Achievements · {g.achievementsClaimed.length}/{ACHIEVEMENTS.length}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {ACHIEVEMENTS.map((a) => {
          const v = achievementValue(g, a.stat)
          const done = v >= a.goal
          const claimed = g.achievementsClaimed.includes(a.id)
          return (
            <div key={a.id} className={`card p-4 text-center ${claimed ? 'bg-gradient-to-b from-yellow-50 to-white' : ''}`}>
              <div className={`text-5xl ${done ? '' : 'grayscale opacity-40'}`}>{a.icon}</div>
              <div className="font-display font-bold mt-1">{a.name}</div>
              <div className="text-xs font-bold text-ink/60 min-h-8">{a.desc}</div>
              <div className="h-2 mt-2 rounded-full bg-black/10 overflow-hidden"><div className="h-full bg-sun" style={{ width: `${Math.min(1, v / a.goal) * 100}%` }} /></div>
              <div className="text-[11px] font-extrabold mt-1">{Math.min(v, a.goal)} / {a.goal}</div>
              {claimed ? <div className="font-bold text-mint mt-2">🏅 Earned</div> : <button className="btn btn-gold !min-h-10 !text-sm mt-2 w-full" disabled={!done} onClick={() => g.claimAchievement(a.id)}>{done ? `Claim ${a.reward.gems ? '💎' + a.reward.gems : '🪙' + a.reward.coins}` : 'Locked'}</button>}
            </div>
          )
        })}
      </div>
    </ScreenShell>
  )
}
