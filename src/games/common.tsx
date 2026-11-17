import type { Pet, WorldId } from '../types'

export interface GameProps {
  pet: Pet
  world: WorldId
  level: number
  onEnd: (score: number, won: boolean) => void
}

export interface GameDef {
  id: string
  name: string
  icon: string
  color: string
  how: string[]
  goal: (level: number) => string
}

export const GAMES: GameDef[] = [
  { id: 'ball', name: 'Ball Catch', icon: '⚽', color: 'from-orange-300 to-pink-400', how: ['Watch the power meter swing.', 'Tap THROW when it lines up with your pet.', 'Your pet catches the ball if it lands close!'], goal: () => 'Get 3 catches out of 5 throws' },
  { id: 'run', name: 'Obstacle Run', icon: '🏃', color: 'from-sky-300 to-indigo-400', how: ['Your pet runs on its own.', 'Tap, click or press Space to jump.', 'Jump over rocks — it gets faster!'], goal: (l) => `Jump over ${8 + Math.min(l, 10)} obstacles` },
  { id: 'hide', name: 'Hide & Seek', icon: '🙈', color: 'from-emerald-300 to-teal-400', how: ['Your pet hides behind something.', 'Tap where you think it is.', 'Wrong guesses give you a hint wiggle.'], goal: () => 'Find your pet in 2 of 3 rounds' },
  { id: 'bubble', name: 'Bubble Pop', icon: '🫧', color: 'from-cyan-300 to-blue-400', how: ['Tap bubbles to pop them.', 'Golden bubbles are worth 5!', 'Avoid the spiky ones 🌵'], goal: () => 'Score 25 points in 30 seconds' },
  { id: 'memory', name: 'Memory Match', icon: '🃏', color: 'from-violet-300 to-fuchsia-400', how: ['Flip two cards at a time.', 'Find all the matching pairs.', 'Finish before the timer runs out!'], goal: (l) => `Match ${pairsFor(l)} pairs in 90 seconds` },
  { id: 'treasure', name: 'Treasure Hunt', icon: '🗝️', color: 'from-amber-300 to-orange-400', how: ['Tap a spot to dig.', 'Colors show how close you are: 🔥 hot, 🌤 warm, 🧊 cold.', 'Find the treasure chest before your digs run out!'], goal: () => 'Find the hidden treasure chest' },
]

export const pairsFor = (level: number, world?: WorldId) => (world === 'dragon' ? 10 : level < 4 ? 6 : level < 8 ? 8 : 10)
