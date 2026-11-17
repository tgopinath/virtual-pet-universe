import { motion } from 'framer-motion'
import { useState, type ComponentType } from 'react'
import { useGame, useActivePet } from '../store/game'
import { GAMES, type GameProps } from '../games/common'
import BallCatch from '../games/BallCatch'
import ObstacleRun from '../games/ObstacleRun'
import HideSeek from '../games/HideSeek'
import BubblePop from '../games/BubblePop'
import MemoryMatch from '../games/MemoryMatch'
import TreasureHunt from '../games/TreasureHunt'
import { ScreenShell } from '../components/ui'
import { worldById } from '../data/worlds'
import { levelInfo } from '../data/progress'
import PetArt from '../components/PetArt'
import { Confetti } from '../components/Chrome'
import type { Reward } from '../types'
import { sfx } from '../lib/audio'

const COMPONENTS: Record<string, ComponentType<GameProps>> = { ball: BallCatch, run: ObstacleRun, hide: HideSeek, bubble: BubblePop, memory: MemoryMatch, treasure: TreasureHunt }

export default function Play() {
  const pet = useActivePet()!
  const { world, player, bestScores, finishGame, go } = useGame()
  const [game, setGame] = useState<string | null>(null)
  const [phase, setPhase] = useState<'how' | 'play' | 'done'>('how')
  const [result, setResult] = useState<{ score: number; won: boolean; reward: Reward } | null>(null)
  const [runKey, setRunKey] = useState(0)
  const level = levelInfo(player.xp).level
  const w = worldById(world)

  const open = (id: string) => { sfx.tap(); setGame(id); setPhase('how'); setResult(null) }

  if (game) {
    const def = GAMES.find((g) => g.id === game)!
    const C = COMPONENTS[game]
    const tired = pet.stats.energy < 10
    return (
      <div className="h-full overflow-y-auto no-scrollbar px-4 pb-32 pt-2">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between my-3">
            <h1 className="text-3xl font-bold text-white drop-shadow-[0_3px_0_rgba(60,40,120,.35)]">{def.icon} {w.activity.game === game && world !== 'garden' ? w.activity.title : def.name}</h1>
            <button className="btn btn-white !min-h-11" onClick={() => setGame(null)}>✕ Quit</button>
          </div>
          {phase === 'how' && (
            <motion.div className="card p-5 text-center" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <PetArt pet={pet} size={130} mood="happy" />
              <h2 className="text-2xl font-bold">How to play</h2>
              <ol className="text-left mt-3 space-y-2 font-bold">
                {def.how.map((h, i) => <li key={i} className="flex gap-3 items-start"><span className="w-8 h-8 shrink-0 rounded-full bg-sky text-white grid place-items-center font-display">{i + 1}</span>{h}</li>)}
              </ol>
              <div className="mt-4 p-3 rounded-2xl bg-yellow-50 font-bold">🎯 Goal: {def.goal(level)}</div>
              {tired ? (
                <div className="mt-4 font-bold text-ink/70">{pet.name} is too tired to play 🥱 — let them nap first!
                  <button className="btn btn-blue w-full mt-3" onClick={() => { useGame.getState().toggleSleep(); go('home') }}>Take a nap 🌙</button>
                </div>
              ) : (
                <button className="btn btn-green w-full mt-5 text-2xl min-h-16" onClick={() => { sfx.success(); setPhase('play'); setRunKey((k) => k + 1) }}>Start! ▶</button>
              )}
            </motion.div>
          )}
          {phase === 'play' && (
            <div className="card p-3 sm:p-4">
              <C key={runKey} pet={pet} world={world} level={level} onEnd={(score, won) => { const reward = finishGame(game, score, won); setResult({ score, won, reward }); setPhase('done') }} />
            </div>
          )}
          {phase === 'done' && result && (
            <motion.div className="card p-6 text-center relative overflow-hidden" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
              {result.won && <Confetti />}
              <div className="text-7xl">{result.won ? '🏆' : '💪'}</div>
              <h2 className="text-3xl font-bold mt-2">{result.won ? 'You won!' : 'Nice try!'}</h2>
              <p className="font-bold text-ink/60">{result.won ? `${pet.name} had so much fun!` : 'Every game makes your pet happier. Try again!'}</p>
              <div className="text-5xl font-display font-bold my-3">{result.score}</div>
              <div className="flex justify-center gap-2 flex-wrap">
                {result.reward.coins ? <span className="pill bg-yellow-100 text-lg">🪙 +{result.reward.coins}</span> : null}
                {result.reward.gems ? <span className="pill bg-violet-100 text-lg">💎 +{result.reward.gems}</span> : null}
                <span className="pill bg-sky-100 text-lg">⭐ +{result.reward.xp} XP</span>
                <span className="pill bg-pink-100 text-lg">😊 Happiness up</span>
              </div>
              {(bestScores[game] ?? 0) <= result.score && result.score > 0 && <div className="mt-3 font-display font-bold text-grape">New best score! 🌟</div>}
              <div className="grid grid-cols-2 gap-3 mt-5">
                <button className="btn btn-white" onClick={() => setGame(null)}>All games</button>
                <button className="btn btn-green" onClick={() => setPhase('how')}>Play again</button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    )
  }

  return (
    <ScreenShell title="Play" icon="🎮">
      <motion.button whileTap={{ scale: 0.98 }} onClick={() => open(w.activity.game)} className="card w-full p-4 mb-4 flex items-center gap-4 text-left overflow-hidden relative" style={{ background: w.sky }}>
        <span className="text-6xl">{w.icon}</span>
        <span className="flex-1">
          <span className="pill bg-white/80 text-xs">FEATURED IN {w.name.toUpperCase()}</span>
          <span className="block text-2xl font-display font-bold mt-1 text-ink drop-shadow-[0_1px_0_#fff]">{w.activity.title}</span>
          <span className="block font-bold text-ink/80">{w.activity.desc}</span>
        </span>
        <span className="btn btn-gold !min-h-12">Play</span>
      </motion.button>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {GAMES.map((g, i) => (
          <motion.button key={g.id} onClick={() => open(g.id)} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ y: -4 }} whileTap={{ scale: 0.96 }}
            className={`rounded-[28px] p-4 text-left text-white bg-gradient-to-br ${g.color} shadow-lg min-h-40 flex flex-col`}>
            <span className="text-5xl drop-shadow">{g.icon}</span>
            <span className="text-xl font-display font-bold mt-auto drop-shadow">{g.name}</span>
            <span className="text-xs font-extrabold opacity-90">{bestScores[g.id] ? `Best: ${bestScores[g.id]}` : 'Not played yet'}</span>
          </motion.button>
        ))}
      </div>
    </ScreenShell>
  )
}
