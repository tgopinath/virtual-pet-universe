export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary'
export type StatKey = 'hunger' | 'happiness' | 'energy' | 'cleanliness' | 'health' | 'friendship'
export type Stats = Record<StatKey, number>

export type SpeciesId = 'puppy' | 'kitten' | 'bunny' | 'panda' | 'fox' | 'dragon' | 'penguin' | 'unicorn'
export type WorldId = 'garden' | 'snow' | 'tropical' | 'forest' | 'space' | 'dragon'
export type Slot = 'hat' | 'glasses' | 'neck' | 'wings' | 'shoes' | 'effect'
export type Screen =
  | 'home' | 'play' | 'train' | 'shop' | 'explore'
  | 'customize' | 'decorate' | 'collection' | 'missions' | 'profile' | 'adopt'

export type Anim = 'idle' | 'jump' | 'spin' | 'roll' | 'dance' | 'wave' | 'sit' | 'eat' | 'sleep' | 'shake' | 'love' | 'fetch' | 'follow' | 'special'

export interface Pet {
  id: string
  species: SpeciesId
  name: string
  xp: number
  stage: number // 0 Baby .. 4 Legendary
  stats: Stats
  skills: Record<string, number> // skillId -> level (0 = not learned, max 3)
  equipped: Partial<Record<Slot, string>>
  color: number // palette variant index
  looks: { name: string; equipped: Partial<Record<Slot, string>>; color: number }[]
  sleeping: boolean
  adoptedAt: number
}

export interface PlacedFurniture { uid: string; id: string; x: number; y: number; flip: boolean; rot: number }

export interface Reward { coins?: number; gems?: number; xp?: number; petXp?: number; item?: string }
