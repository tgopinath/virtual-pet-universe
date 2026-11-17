import type { Rarity, SpeciesId, Stats } from '../types'

export type EarType = 'floppy' | 'pointy' | 'long' | 'round' | 'fin' | 'horns'
export type TailType = 'wag' | 'curl' | 'puff' | 'stub' | 'bushy' | 'spike' | 'none' | 'flow'

export interface Species {
  id: SpeciesId
  label: string
  breed: string
  rarity: Rarity
  personality: string[]
  blurb: string
  ability: { name: string; desc: string }
  base: Stats
  /** palettes: [body, belly, accent] — index chosen by pet.color */
  palettes: [string, string, string][]
  ears: EarType
  tail: TailType
  extras: ('patches' | 'beak' | 'wings' | 'horn' | 'mane' | 'whiskers' | 'mask')[]
  sound: number[] // base pitches (Hz) for its voice
  idle: 'bounce' | 'sway' | 'hop' | 'doze' | 'prowl' | 'float' | 'waddle' | 'prance'
  favoriteFood: string
  adoptCost: { coins?: number; gems?: number }
  reactions: string[]
}

export const SPECIES: Species[] = [
  {
    id: 'puppy', label: 'Puppy', breed: 'Golden Pup', rarity: 'Common',
    personality: ['Playful', 'Loyal', 'Energetic'],
    blurb: 'Always ready for a game of fetch and a belly rub.',
    ability: { name: 'Super Fetch', desc: '+25% coins from Ball Catch' },
    base: { hunger: 70, happiness: 80, energy: 85, cleanliness: 80, health: 90, friendship: 10 },
    palettes: [['#f4c27a', '#fff1d6', '#a8642a'], ['#e0e0e0', '#ffffff', '#6b6b6b'], ['#8a5a3b', '#e9c9a8', '#3b2414']],
    ears: 'floppy', tail: 'wag', extras: [], sound: [520, 660], idle: 'bounce',
    favoriteFood: 'biscuit', adoptCost: {},
    reactions: ['Woof! 🐶', 'Play with me!', 'You are my best friend!', '*wags tail*'],
  },
  {
    id: 'kitten', label: 'Kitten', breed: 'Cloud Kitty', rarity: 'Common',
    personality: ['Curious', 'Affectionate', 'Independent'],
    blurb: 'Loves sunny spots, soft pillows and chasing bubbles.',
    ability: { name: 'Bubble Paws', desc: '+20% score in Bubble Pop' },
    base: { hunger: 70, happiness: 75, energy: 70, cleanliness: 90, health: 90, friendship: 10 },
    palettes: [['#c9c9d6', '#f7f7fb', '#ff9db8'], ['#ffb36b', '#fff0dc', '#c75b1a'], ['#4a4a5a', '#d6d6e0', '#ff9db8']],
    ears: 'pointy', tail: 'curl', extras: ['whiskers'], sound: [880, 990], idle: 'sway',
    favoriteFood: 'fish', adoptCost: {},
    reactions: ['Meow~ 🐱', 'Purr purr...', '*boops your finger*', 'Hehe, that tickles!'],
  },
  {
    id: 'bunny', label: 'Bunny', breed: 'Meadow Bun', rarity: 'Common',
    personality: ['Gentle', 'Cute', 'Calm'],
    blurb: 'Hops through flower fields and nibbles crunchy carrots.',
    ability: { name: 'Big Hop', desc: 'Jumps higher in Obstacle Run' },
    base: { hunger: 75, happiness: 75, energy: 75, cleanliness: 85, health: 90, friendship: 10 },
    palettes: [['#ffffff', '#ffe3ec', '#ff9db8'], ['#d9b38c', '#fff3e6', '#a0714f'], ['#b9a6e0', '#f2ecff', '#ff9db8']],
    ears: 'long', tail: 'puff', extras: [], sound: [1040, 1240], idle: 'hop',
    favoriteFood: 'carrot', adoptCost: {},
    reactions: ['*nose wiggle*', 'Hop hop! 🐰', 'Carrots please?', 'So cozy!'],
  },
  {
    id: 'panda', label: 'Panda', breed: 'Bamboo Panda', rarity: 'Uncommon',
    personality: ['Adorable', 'Sleepy', 'Playful'],
    blurb: 'A cuddly napper who rolls everywhere instead of walking.',
    ability: { name: 'Power Nap', desc: 'Recovers energy twice as fast' },
    base: { hunger: 65, happiness: 80, energy: 60, cleanliness: 80, health: 95, friendship: 10 },
    palettes: [['#ffffff', '#ffffff', '#2b2b36'], ['#ffe7d1', '#ffffff', '#7a3b2e'], ['#e8f0ff', '#ffffff', '#3a4a7a']],
    ears: 'round', tail: 'stub', extras: ['patches'], sound: [330, 392], idle: 'doze',
    favoriteFood: 'apple', adoptCost: { coins: 300 },
    reactions: ['*yawns* 🐼', 'Roly poly!', 'Snack time?', 'Hug me!'],
  },
  {
    id: 'fox', label: 'Fox', breed: 'Ember Fox', rarity: 'Rare',
    personality: ['Clever', 'Energetic', 'Adventurous'],
    blurb: 'A sharp-eyed explorer with a nose for buried treasure.',
    ability: { name: 'Treasure Nose', desc: 'Extra dig in Treasure Hunt' },
    base: { hunger: 70, happiness: 75, energy: 90, cleanliness: 80, health: 90, friendship: 10 },
    palettes: [['#ff8a3d', '#fff4e8', '#3b2414'], ['#f2f2f7', '#ffffff', '#7b8aa8'], ['#c7563a', '#ffe8d9', '#2b1a12']],
    ears: 'pointy', tail: 'bushy', extras: ['mask'], sound: [700, 940], idle: 'prowl',
    favoriteFood: 'berry', adoptCost: { coins: 600 },
    reactions: ['Yip yip! 🦊', 'Adventure awaits!', 'I smell treasure...', '*sly grin*'],
  },
  {
    id: 'dragon', label: 'Dragon', breed: 'Sky Wyrmling', rarity: 'Epic',
    personality: ['Magical', 'Powerful', 'Rare'],
    blurb: 'A tiny dragon with a big heart and warm, sparkly sneezes.',
    ability: { name: 'Flame Dash', desc: 'Breaks obstacles in Obstacle Run once' },
    base: { hunger: 65, happiness: 75, energy: 90, cleanliness: 80, health: 100, friendship: 10 },
    palettes: [['#7ed6a8', '#f4ffd6', '#ff7a59'], ['#8fb3ff', '#eaf1ff', '#ffd23f'], ['#ff6f91', '#ffe3ea', '#7a2b8f']],
    ears: 'horns', tail: 'spike', extras: ['wings'], sound: [260, 196], idle: 'float',
    favoriteFood: 'magic', adoptCost: { gems: 40 },
    reactions: ['Rawr! 🐉', '*puffs a sparkle*', 'I can fly... almost!', 'Treasure? Mine!'],
  },
  {
    id: 'penguin', label: 'Penguin', breed: 'Ice Waddler', rarity: 'Uncommon',
    personality: ['Funny', 'Friendly', 'Playful'],
    blurb: 'Slides on its tummy and loves fishy snacks.',
    ability: { name: 'Belly Slide', desc: 'Faster in Snow Kingdom games' },
    base: { hunger: 70, happiness: 85, energy: 75, cleanliness: 85, health: 90, friendship: 10 },
    palettes: [['#2f3650', '#ffffff', '#ffb02e'], ['#4a6fa5', '#ffffff', '#ffb02e'], ['#6b5b95', '#fff6ff', '#ff9db8']],
    ears: 'fin', tail: 'none', extras: ['beak'], sound: [600, 450], idle: 'waddle',
    favoriteFood: 'fish', adoptCost: { coins: 350 },
    reactions: ['Honk! 🐧', '*waddle waddle*', 'Slip and slide!', 'Fish? FISH!'],
  },
  {
    id: 'unicorn', label: 'Unicorn', breed: 'Rainbow Unicorn', rarity: 'Legendary',
    personality: ['Magical', 'Cheerful', 'Rare'],
    blurb: 'Leaves a trail of sparkles and makes rainbows when happy.',
    ability: { name: 'Rainbow Luck', desc: '+1 gem from every mini-game win' },
    base: { hunger: 70, happiness: 90, energy: 80, cleanliness: 95, health: 100, friendship: 10 },
    palettes: [['#ffffff', '#fff0fb', '#c58cff'], ['#ffd6f0', '#fff5fb', '#7ad7ff'], ['#d6f0ff', '#ffffff', '#ff8fd8']],
    ears: 'pointy', tail: 'flow', extras: ['horn', 'mane'], sound: [1320, 1760], idle: 'prance',
    favoriteFood: 'rainbow', adoptCost: { gems: 80 },
    reactions: ['Neigh~ 🦄', '*sparkle sparkle*', 'Let’s make a rainbow!', 'You’re magical too!'],
  },
]

export const speciesById = (id: string) => SPECIES.find((s) => s.id === id)!

export const STAGES = [
  { name: 'Baby', xp: 0, scale: 0.72 },
  { name: 'Young', xp: 120, scale: 0.84 },
  { name: 'Teen', xp: 400, scale: 0.95 },
  { name: 'Adult', xp: 900, scale: 1.05 },
  { name: 'Legendary', xp: 1800, scale: 1.12 },
]
/** Legendary also needs a strong bond */
export const LEGENDARY_FRIENDSHIP = 70

export const RARITY_STYLE: Record<string, { bg: string; fg: string }> = {
  Common: { bg: '#e6f4ea', fg: '#2f7d47' },
  Uncommon: { bg: '#e3f0ff', fg: '#2a62b8' },
  Rare: { bg: '#efe6ff', fg: '#6b3fc4' },
  Epic: { bg: '#ffe6f3', fg: '#b8327a' },
  Legendary: { bg: '#fff3cc', fg: '#a86b00' },
}
