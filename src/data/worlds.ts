import type { WorldId } from '../types'

export interface World {
  id: WorldId
  name: string
  icon: string
  desc: string
  unlock: { level: number; coins: number; achievement?: string }
  sky: string
  ground: string
  groundTop: string
  props: string[] // decorative emoji placed in the scene
  particles: string // ambient particle emoji
  activity: { game: string; title: string; desc: string }
  music: number[] // pentatonic-ish root notes for the ambient loop
}

export const WORLDS: World[] = [
  {
    id: 'garden', name: 'Cozy Garden', icon: '🌷', desc: 'Grass, flowers, trees and a little pond.',
    unlock: { level: 1, coins: 0 },
    sky: 'linear-gradient(180deg,#9fd8ff 0%,#cdeeff 55%,#eafaff 100%)',
    ground: 'linear-gradient(180deg,#8fdc7a,#5fbf5a)', groundTop: '#a6e88f',
    props: ['🌳', '🌷', '🌼', '🍄', '🌻', '🪨'], particles: '🦋',
    activity: { game: 'treasure', title: 'Flower Dig', desc: 'Dig in the flower beds for buried goodies.' },
    music: [523, 587, 659, 784, 880],
  },
  {
    id: 'snow', name: 'Snow Kingdom', icon: '❄️', desc: 'Snowy mountains, ice caves and snowball fun.',
    unlock: { level: 3, coins: 150 },
    sky: 'linear-gradient(180deg,#b7c9ff 0%,#dfe8ff 60%,#f6f9ff 100%)',
    ground: 'linear-gradient(180deg,#ffffff,#dbe7ff)', groundTop: '#ffffff',
    props: ['🏔️', '⛄', '🌲', '🧊', '🌲'], particles: '❄️',
    activity: { game: 'bubble', title: 'Snowflake Catch', desc: 'Pop falling snowflakes before they melt!' },
    music: [440, 494, 587, 659, 740],
  },
  {
    id: 'tropical', name: 'Tropical Island', icon: '🏝️', desc: 'Sunny beaches, palm trees and hidden treasure.',
    unlock: { level: 5, coins: 300 },
    sky: 'linear-gradient(180deg,#5fd0ff 0%,#a8ecff 55%,#fff6d6 100%)',
    ground: 'linear-gradient(180deg,#ffe3a1,#f5c96b)', groundTop: '#fff0c2',
    props: ['🌴', '🐚', '🦀', '🌺', '🥥'], particles: '🫧',
    activity: { game: 'treasure', title: 'Pirate Treasure', desc: 'Find the pirate chest buried in the sand.' },
    music: [392, 440, 523, 587, 659],
  },
  {
    id: 'forest', name: 'Magical Forest', icon: '🍄', desc: 'Glowing mushrooms and friendly fairy folk.',
    unlock: { level: 7, coins: 500, achievement: 'trainer' },
    sky: 'linear-gradient(180deg,#4b3f8f 0%,#7f66c9 55%,#b9a3ff 100%)',
    ground: 'linear-gradient(180deg,#4fa37a,#2f7a5a)', groundTop: '#6cc497',
    props: ['🍄', '🌲', '🔮', '🧚', '🌿', '🦉'], particles: '✨',
    activity: { game: 'hide', title: 'Fairy Hide & Seek', desc: 'Your pet hides among glowing mushrooms.' },
    music: [349, 415, 466, 523, 622],
  },
  {
    id: 'space', name: 'Space World', icon: '🪐', desc: 'Floating islands, planets and starlight.',
    unlock: { level: 10, coins: 800 },
    sky: 'radial-gradient(circle at 70% 20%,#3b3f9e 0%,#1b1d4f 55%,#0b0c26 100%)',
    ground: 'linear-gradient(180deg,#9a8fd6,#5f55a8)', groundTop: '#b8afef',
    props: ['🪐', '🌙', '🛸', '☄️', '🌟'], particles: '⭐',
    activity: { game: 'run', title: 'Low-Gravity Run', desc: 'Floaty jumps over space rocks.' },
    music: [262, 311, 349, 392, 466],
  },
  {
    id: 'dragon', name: 'Dragon Mountain', icon: '🌋', desc: 'Volcanoes, caves and dragon gold.',
    unlock: { level: 13, coins: 1200, achievement: 'explorer' },
    sky: 'linear-gradient(180deg,#ff9a6b 0%,#ffc08a 50%,#ffe0b8 100%)',
    ground: 'linear-gradient(180deg,#a86a4a,#7a4632)', groundTop: '#c4825d',
    props: ['🌋', '🪨', '💎', '🔥', '🏺'], particles: '🔥',
    activity: { game: 'memory', title: 'Dragon Rune Match', desc: 'Match ancient runes — hard mode!' },
    music: [294, 330, 370, 440, 494],
  },
]

export const worldById = (id: string) => WORLDS.find((w) => w.id === id)!
