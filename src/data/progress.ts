import type { Anim } from '../types'

export interface Skill {
  id: string
  name: string
  icon: string
  anim: Anim
  minStage: number
  energy: number
  desc: string
}

export const SKILLS: Skill[] = [
  { id: 'sit', name: 'Sit', icon: '🪑', anim: 'sit', minStage: 0, energy: 6, desc: 'The classic good-pet move' },
  { id: 'jump', name: 'Jump', icon: '⬆️', anim: 'jump', minStage: 0, energy: 8, desc: 'Boing!' },
  { id: 'wave', name: 'Wave', icon: '👋', anim: 'wave', minStage: 0, energy: 6, desc: 'Say hello' },
  { id: 'spin', name: 'Spin', icon: '🌀', anim: 'spin', minStage: 1, energy: 8, desc: 'Round and round' },
  { id: 'roll', name: 'Roll', icon: '🔄', anim: 'roll', minStage: 1, energy: 10, desc: 'Roll over!' },
  { id: 'fetch', name: 'Fetch', icon: '🎾', anim: 'fetch', minStage: 1, energy: 10, desc: 'Bring it back' },
  { id: 'dance', name: 'Dance', icon: '💃', anim: 'dance', minStage: 2, energy: 12, desc: 'Groovy moves' },
  { id: 'follow', name: 'Follow', icon: '👣', anim: 'follow', minStage: 2, energy: 10, desc: 'Walks beside you' },
  { id: 'special', name: 'Signature Trick', icon: '🌟', anim: 'special', minStage: 3, energy: 15, desc: 'A species-special move' },
]

export interface Mission { id: string; text: string; event: string; goal: number; reward: { coins?: number; gems?: number; xp?: number } }

/** daily missions — 4 are drawn each day */
export const MISSION_POOL: Mission[] = [
  { id: 'feed3', text: 'Feed your pet 3 times', event: 'feed', goal: 3, reward: { coins: 40, xp: 20 } },
  { id: 'game2', text: 'Play 2 mini-games', event: 'game', goal: 2, reward: { coins: 50, xp: 30 } },
  { id: 'train1', text: 'Train 1 skill', event: 'train', goal: 1, reward: { coins: 40, xp: 25 } },
  { id: 'clean1', text: 'Give your pet a bath', event: 'clean', goal: 1, reward: { coins: 30, xp: 15 } },
  { id: 'coins100', text: 'Collect 100 coins', event: 'coins', goal: 100, reward: { gems: 2, xp: 20 } },
  { id: 'explore1', text: 'Visit a different world', event: 'explore', goal: 1, reward: { coins: 40, xp: 20 } },
  { id: 'pet10', text: 'Pet your pet 10 times', event: 'pet', goal: 10, reward: { coins: 25, xp: 15 } },
  { id: 'win3', text: 'Win 3 mini-games', event: 'win', goal: 3, reward: { gems: 3, xp: 40 } },
  { id: 'play_toy', text: 'Play with a toy twice', event: 'toy', goal: 2, reward: { coins: 30, xp: 15 } },
]

export interface Achievement { id: string; name: string; icon: string; desc: string; stat: string; goal: number; reward: { coins?: number; gems?: number } }

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first', name: 'First Adoption', icon: '🏡', desc: 'Adopt your very first pet', stat: 'adopted', goal: 1, reward: { coins: 50 } },
  { id: 'chef', name: 'Little Chef', icon: '🍳', desc: 'Feed pets 25 times', stat: 'feeds', goal: 25, reward: { coins: 100 } },
  { id: 'gamer', name: 'Game Champ', icon: '🎮', desc: 'Win 10 mini-games', stat: 'wins', goal: 10, reward: { gems: 5 } },
  { id: 'trainer', name: 'Master Trainer', icon: '🎓', desc: 'Learn 5 skill levels', stat: 'skillLevels', goal: 5, reward: { gems: 8 } },
  { id: 'bestie', name: 'Best Friend', icon: '💖', desc: 'Reach 80 friendship with a pet', stat: 'maxFriendship', goal: 80, reward: { gems: 10 } },
  { id: 'explorer', name: 'Explorer', icon: '🧭', desc: 'Unlock 3 worlds', stat: 'worlds', goal: 3, reward: { gems: 10 } },
  { id: 'collector', name: 'Pet Collector', icon: '📚', desc: 'Adopt 3 different pets', stat: 'adopted', goal: 3, reward: { gems: 15 } },
  { id: 'stylist', name: 'Style Star', icon: '💅', desc: 'Own 5 accessories', stat: 'accessories', goal: 5, reward: { coins: 150 } },
  { id: 'decorator', name: 'Home Designer', icon: '🛋️', desc: 'Place 5 furniture items', stat: 'furniture', goal: 5, reward: { coins: 150 } },
  { id: 'legend', name: 'Legendary Companion', icon: '🏆', desc: 'Raise a pet to Legendary', stat: 'maxStage', goal: 4, reward: { gems: 30 } },
]

export const xpForLevel = (level: number) => 60 + level * 40
export function levelInfo(xp: number) {
  let level = 1
  let rest = xp
  while (rest >= xpForLevel(level)) { rest -= xpForLevel(level); level++ }
  return { level, into: rest, need: xpForLevel(level) }
}
