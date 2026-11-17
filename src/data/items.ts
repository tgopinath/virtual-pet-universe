import type { Slot, Stats } from '../types'

export type ItemKind = 'food' | 'toy' | 'care' | 'accessory' | 'furniture'

export interface Item {
  id: string
  name: string
  icon: string
  kind: ItemKind
  price: { coins?: number; gems?: number }
  desc: string
  effect?: Partial<Stats>
  slot?: Slot
  minStage?: number
  special?: boolean
  /** furniture: what the pet does when it visits */
  use?: 'sleep' | 'eat' | 'play' | 'relax'
  w?: number // furniture display size (rem)
}

export const FOODS: Item[] = [
  { id: 'milk', name: 'Milk', icon: '🥛', kind: 'food', price: { coins: 8 }, desc: 'Warm and comforting', effect: { hunger: 15, health: 3 } },
  { id: 'bread', name: 'Bread', icon: '🍞', kind: 'food', price: { coins: 10 }, desc: 'Fluffy and filling', effect: { hunger: 22 } },
  { id: 'apple', name: 'Apple', icon: '🍎', kind: 'food', price: { coins: 10 }, desc: 'Crunchy and healthy', effect: { hunger: 15, health: 6 } },
  { id: 'carrot', name: 'Carrot', icon: '🥕', kind: 'food', price: { coins: 9 }, desc: 'Good for bright eyes', effect: { hunger: 16, health: 5 } },
  { id: 'fish', name: 'Fish', icon: '🐟', kind: 'food', price: { coins: 16 }, desc: 'A protein-packed treat', effect: { hunger: 28, energy: 5 } },
  { id: 'biscuit', name: 'Pet Biscuit', icon: '🍪', kind: 'food', price: { coins: 12 }, desc: 'A crunchy classic', effect: { hunger: 18, happiness: 6 } },
  { id: 'choco', name: 'Choco-Bone', icon: '🦴', kind: 'food', price: { coins: 25 }, desc: 'Pet-safe pretend chocolate treat', effect: { hunger: 12, happiness: 18 }, special: true },
  { id: 'rainbow', name: 'Rainbow Fruit', icon: '🌈', kind: 'food', price: { gems: 3 }, desc: 'Boosts every mood', effect: { hunger: 25, happiness: 15, energy: 10, health: 10 }, special: true },
  { id: 'berry', name: 'Golden Berries', icon: '🫐', kind: 'food', price: { coins: 40 }, desc: 'Shiny and super sweet', effect: { hunger: 20, happiness: 12, friendship: 4 }, special: true },
  { id: 'magic', name: 'Star Stew', icon: '✨', kind: 'food', price: { gems: 5 }, desc: 'Magical food — big XP boost', effect: { hunger: 35, energy: 20, happiness: 10 }, special: true },
]

export const TOYS: Item[] = [
  { id: 'ball', name: 'Bouncy Ball', icon: '⚽', kind: 'toy', price: { coins: 30 }, desc: 'Bounce bounce!', effect: { happiness: 12, energy: -6 } },
  { id: 'yarn', name: 'Yarn Ball', icon: '🧶', kind: 'toy', price: { coins: 30 }, desc: 'Endless tangles of fun', effect: { happiness: 10, energy: -4 } },
  { id: 'duck', name: 'Squeaky Duck', icon: '🦆', kind: 'toy', price: { coins: 45 }, desc: 'Squeak!', effect: { happiness: 15, energy: -5 } },
  { id: 'kite', name: 'Kite', icon: '🪁', kind: 'toy', price: { coins: 60 }, desc: 'Flies high on windy days', effect: { happiness: 18, energy: -8 } },
]

export const CARE: Item[] = [
  { id: 'soap', name: 'Bubble Bath', icon: '🛁', kind: 'care', price: { coins: 6 }, desc: 'Squeaky clean!', effect: { cleanliness: 45, happiness: 4 } },
  { id: 'brush', name: 'Brush', icon: '🪮', kind: 'care', price: { coins: 0 }, desc: 'Fluffy fur, happy pet', effect: { cleanliness: 12, friendship: 2 } },
  { id: 'medicine', name: 'Get-Well Syrup', icon: '🍯', kind: 'care', price: { coins: 20 }, desc: 'Sweet syrup that restores health', effect: { health: 35 } },
]

const acc = (id: string, name: string, icon: string, slot: Slot, price: Item['price'], desc: string, minStage = 0): Item =>
  ({ id, name, icon, kind: 'accessory', slot, price, desc, minStage })

export const ACCESSORIES: Item[] = [
  acc('hat_party', 'Party Hat', '🥳', 'hat', { coins: 60 }, 'Every day is a party'),
  acc('hat_beanie', 'Snow Beanie', '🧢', 'hat', { coins: 80 }, 'Toasty ears'),
  acc('hat_flower', 'Flower Crown', '🌸', 'hat', { coins: 90 }, 'Fresh from the garden'),
  acc('hat_top', 'Top Hat', '🎩', 'hat', { coins: 150 }, 'Very fancy'),
  acc('hat_crown', 'Royal Crown', '👑', 'hat', { gems: 25 }, 'For pet royalty', 2),
  acc('gl_round', 'Round Specs', '👓', 'glasses', { coins: 70 }, 'Smart and cozy'),
  acc('gl_sun', 'Cool Shades', '🕶️', 'glasses', { coins: 100 }, 'Too cool'),
  acc('gl_star', 'Star Glasses', '⭐', 'glasses', { gems: 10 }, 'Twinkle twinkle'),
  acc('nk_bow', 'Big Bow', '🎀', 'neck', { coins: 50 }, 'Adorable'),
  acc('nk_scarf', 'Cozy Scarf', '🧣', 'neck', { coins: 70 }, 'Perfect for snow days'),
  acc('nk_bell', 'Golden Bell', '🔔', 'neck', { coins: 120 }, 'Jingle jingle'),
  acc('sh_boots', 'Rain Boots', '👢', 'shoes', { coins: 90 }, 'Splash-ready paws'),
  acc('sh_sneak', 'Sneakers', '👟', 'shoes', { coins: 120 }, 'Speedy feet'),
  acc('wg_fairy', 'Fairy Wings', '🧚', 'wings', { gems: 15 }, 'Shimmery and light', 1),
  acc('wg_angel', 'Cloud Wings', '🪽', 'wings', { gems: 30 }, 'Soft as clouds', 3),
  acc('fx_hearts', 'Heart Aura', '💕', 'effect', { coins: 200 }, 'Floating hearts'),
  acc('fx_sparkle', 'Sparkle Aura', '✨', 'effect', { gems: 12 }, 'Glittery magic'),
  acc('fx_rainbow', 'Rainbow Halo', '🌈', 'effect', { gems: 35 }, 'A legendary glow', 4),
]

const fur = (id: string, name: string, icon: string, price: Item['price'], desc: string, use: Item['use'], w = 4): Item =>
  ({ id, name, icon, kind: 'furniture', price, desc, use, w })

export const FURNITURE: Item[] = [
  fur('bed', 'Cloud Bed', '🛏️', { coins: 120 }, 'Pet naps here', 'sleep', 5),
  fur('bowl', 'Food Bowl', '🥣', { coins: 40 }, 'Snack station', 'eat', 3),
  fur('water', 'Water Bowl', '💧', { coins: 30 }, 'Stay hydrated', 'eat', 3),
  fur('sofa', 'Comfy Sofa', '🛋️', { coins: 220 }, 'Lounge in style', 'relax', 6),
  fur('rug', 'Round Rug', '🟣', { coins: 80 }, 'Soft underpaws', 'relax', 6),
  fur('plant', 'Potted Plant', '🪴', { coins: 50 }, 'A touch of green', 'relax', 4),
  fur('shelf', 'Toy Shelf', '🗄️', { coins: 140 }, 'Neat and tidy', 'relax', 4.5),
  fur('teddy', 'Teddy Bear', '🧸', { coins: 70 }, 'Cuddle buddy', 'play', 3.5),
  fur('slide', 'Play Slide', '🛝', { coins: 260 }, 'Wheee!', 'play', 6),
  fur('lamp', 'Star Lamp', '🌟', { gems: 8 }, 'Cozy glow', 'relax', 3.5),
  fur('castle', 'Toy Castle', '🏰', { gems: 20 }, 'A royal hideout', 'play', 6),
]

export const ROOM_THEMES = [
  { id: 'sunny', name: 'Sunny Nook', wall: 'linear-gradient(#fff4d6,#ffe7b3)', floor: '#e9b97a', price: 0 },
  { id: 'mint', name: 'Mint Dream', wall: 'linear-gradient(#e3fff4,#c4f2df)', floor: '#8fcfb4', price: 100 },
  { id: 'berry', name: 'Berry Pop', wall: 'linear-gradient(#ffe6f2,#ffc9e2)', floor: '#d88fb5', price: 150 },
  { id: 'night', name: 'Starry Night', wall: 'radial-gradient(circle at 30% 20%,#5b5fc7,#262a63)', floor: '#3d3a7a', price: 250 },
]

export const ALL_ITEMS = [...FOODS, ...TOYS, ...CARE, ...ACCESSORIES, ...FURNITURE]
export const itemById = (id: string) => ALL_ITEMS.find((i) => i.id === id)
