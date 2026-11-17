import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Anim, Pet, PlacedFurniture, Reward, Screen, Slot, SpeciesId, StatKey, Stats, WorldId } from '../types'
import { SPECIES, STAGES, LEGENDARY_FRIENDSHIP, speciesById } from '../data/pets'
import { itemById, ROOM_THEMES } from '../data/items'
import { WORLDS, worldById } from '../data/worlds'
import { ACHIEVEMENTS, MISSION_POOL, SKILLS, levelInfo } from '../data/progress'
import { sfx } from '../lib/audio'

const uid = () => Math.random().toString(36).slice(2, 10)
const clamp = (n: number) => Math.max(0, Math.min(100, n))
const today = () => new Date().toISOString().slice(0, 10)

/** Decay per minute while the app is open. Kept gentle on purpose. */
const DECAY: Partial<Stats> = { hunger: 1.0, happiness: 0.5, energy: 0.4, cleanliness: 0.35 }
/** Stats never drop below this while the player is away — no harsh punishment. */
const OFFLINE_FLOOR = 25

interface Transient {
  screen: Screen
  toasts: { id: string; text: string; icon?: string }[]
  floats: { id: string; text: string; color: string }[]
  anim: { name: Anim; key: number }
  speech: { text: string; key: number } | null
  evolution: { petId: string; to: number } | null
  levelUp: number | null
  feedOpen: boolean
}

interface Saved {
  tutorialStep: number
  player: { name: string; avatar: string; xp: number; createdAt: number; playtime: number }
  coins: number
  gems: number
  pets: Pet[]
  activePetId: string | null
  inventory: Record<string, number>
  owned: string[]
  ownedThemes: string[]
  room: { theme: string; items: PlacedFurniture[] }
  savedLayouts: { name: string; theme: string; items: PlacedFurniture[] }[]
  world: WorldId
  unlockedWorlds: WorldId[]
  daily: { date: string; missions: string[]; progress: Record<string, number>; claimed: string[] }
  achievementsClaimed: string[]
  counters: Record<string, number>
  settings: { volume: number; music: boolean; sfx: boolean; reducedMotion: boolean; notifications: boolean; reminders: boolean }
  lastSeen: number
  lastDailyReward: string
  streak: number
  bestScores: Record<string, number>
}

interface Actions {
  go: (s: Screen) => void
  setFeedOpen: (o: boolean) => void
  toast: (text: string, icon?: string) => void
  dismissToast: (id: string) => void
  say: (text: string) => void
  play: (a: Anim) => void
  adopt: (species: SpeciesId, name: string) => boolean
  switchPet: (id: string) => void
  renamePet: (id: string, name: string) => void
  tick: (sec: number) => void
  applyOffline: () => void
  feed: (itemId: string) => void
  useToy: (itemId: string) => void
  care: (itemId: string) => void
  toggleSleep: () => void
  petPet: () => void
  buy: (itemId: string, qty?: number) => boolean
  buyTheme: (id: string) => boolean
  equip: (slot: Slot, itemId: string | null) => void
  setColor: (c: number) => void
  saveLook: (name: string) => void
  applyLook: (i: number) => void
  addFurniture: (id: string) => void
  moveFurniture: (uid: string, x: number, y: number) => void
  updateFurniture: (uid: string, patch: Partial<PlacedFurniture>) => void
  removeFurniture: (uid: string) => void
  setTheme: (id: string) => void
  saveLayout: (name: string) => void
  loadLayout: (i: number) => void
  travel: (w: WorldId) => void
  unlockWorld: (w: WorldId) => boolean
  reward: (r: Reward, label?: string) => void
  finishGame: (game: string, score: number, won: boolean) => Reward
  trainComplete: (skillId: string) => void
  performTrick: (skillId: string) => void
  track: (event: string, n?: number) => void
  ensureDaily: () => void
  claimMission: (id: string) => void
  claimAchievement: (id: string) => void
  claimDailyReward: () => void
  dailyRewardReady: () => boolean
  setSettings: (s: Partial<Saved['settings']>) => void
  setPlayer: (p: Partial<Saved['player']>) => void
  clearEvolution: () => void
  clearLevelUp: () => void
  nextTutorial: () => void
  resetGame: () => void
}

export type GameStore = Saved & Transient & Actions

const freshSave = (): Saved => ({
  tutorialStep: 0,
  player: { name: 'Pet Pal', avatar: '🧒', xp: 0, createdAt: Date.now(), playtime: 0 },
  coins: 150,
  gems: 10,
  pets: [],
  activePetId: null,
  inventory: { milk: 3, bread: 2, apple: 3, carrot: 2, fish: 1, biscuit: 3, soap: 3, brush: 1, ball: 1, medicine: 1 },
  owned: ['bowl', 'bed'],
  ownedThemes: ['sunny'],
  room: {
    theme: 'sunny',
    items: [
      { uid: 'b1', id: 'bed', x: 16, y: 78, flip: false, rot: 0 },
      { uid: 'b2', id: 'bowl', x: 82, y: 84, flip: false, rot: 0 },
    ],
  },
  savedLayouts: [],
  world: 'garden',
  unlockedWorlds: ['garden'],
  daily: { date: '', missions: [], progress: {}, claimed: [] },
  achievementsClaimed: [],
  counters: {},
  settings: { volume: 0.7, music: true, sfx: true, reducedMotion: false, notifications: false, reminders: true },
  lastSeen: Date.now(),
  lastDailyReward: '',
  streak: 0,
  bestScores: {},
})

const transient = (): Transient => ({
  screen: 'home',
  toasts: [],
  floats: [],
  anim: { name: 'idle', key: 0 },
  speech: null,
  evolution: null,
  levelUp: null,
  feedOpen: false,
})

export function stageFor(p: Pet) {
  let s = 0
  STAGES.forEach((st, i) => { if (p.xp >= st.xp) s = i })
  if (s === 4 && p.stats.friendship < LEGENDARY_FRIENDSHIP) s = 3
  return s
}

export function achievementValue(st: Saved, stat: string): number {
  switch (stat) {
    case 'adopted': return st.pets.length
    case 'skillLevels': return st.pets.reduce((a, p) => a + Object.values(p.skills).reduce((x, y) => x + y, 0), 0)
    case 'maxFriendship': return Math.max(0, ...st.pets.map((p) => p.stats.friendship))
    case 'worlds': return st.unlockedWorlds.length
    case 'accessories': return st.owned.filter((i) => itemById(i)?.kind === 'accessory').length
    case 'furniture': return st.room.items.length
    case 'maxStage': return Math.max(0, ...st.pets.map((p) => p.stage))
    default: return st.counters[stat] ?? 0
  }
}

function pickMissions(): string[] {
  const pool = [...MISSION_POOL].sort(() => Math.random() - 0.5)
  return pool.slice(0, 4).map((m) => m.id)
}

export const useGame = create<GameStore>()(
  persist(
    (set, get) => {
      const active = () => get().pets.find((p) => p.id === get().activePetId)
      const patchPet = (fn: (p: Pet) => Pet, id = get().activePetId) =>
        set((s) => ({ pets: s.pets.map((p) => (p.id === id ? fn(p) : p)) }))
      const addStats = (p: Pet, d: Partial<Stats>): Pet => {
        const stats = { ...p.stats }
        ;(Object.keys(d) as StatKey[]).forEach((k) => (stats[k] = clamp(stats[k] + (d[k] ?? 0))))
        return { ...p, stats }
      }
      const float = (text: string, color = '#ff9f1c') => {
        const id = uid()
        set((s) => ({ floats: [...s.floats, { id, text, color }] }))
        setTimeout(() => set((s) => ({ floats: s.floats.filter((f) => f.id !== id) })), 1700)
      }
      const checkEvolution = (petId: string) => {
        const p = get().pets.find((x) => x.id === petId)
        if (!p) return
        const s = stageFor(p)
        if (s > p.stage) {
          patchPet((x) => ({ ...x, stage: s }), petId)
          set({ evolution: { petId, to: s } })
          sfx.evolve()
        }
      }

      return {
        ...freshSave(),
        ...transient(),

        go: (screen) => { sfx.tap(); set({ screen, feedOpen: false }) },
        setFeedOpen: (feedOpen) => set({ feedOpen, screen: 'home' }),
        toast: (text, icon) => {
          const id = uid()
          set((s) => ({ toasts: [...s.toasts.slice(-2), { id, text, icon }] }))
          setTimeout(() => get().dismissToast(id), 3500)
        },
        dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
        say: (text) => set({ speech: { text, key: Date.now() } }),
        play: (name) => set({ anim: { name, key: Date.now() } }),

        adopt: (species, name) => {
          const sp = speciesById(species)
          const st = get()
          const first = st.pets.length === 0
          const cost = first ? {} : sp.adoptCost
          if ((cost.coins ?? 0) > st.coins || (cost.gems ?? 0) > st.gems) { sfx.error(); get().toast('Not enough coins or gems yet!', '🪙'); return false }
          const pet: Pet = {
            id: uid(), species, name: name.trim() || sp.label, xp: 0, stage: 0,
            stats: { ...sp.base }, skills: {}, equipped: {}, color: 0, looks: [], sleeping: false, adoptedAt: Date.now(),
          }
          set((s) => ({
            pets: [...s.pets, pet], activePetId: pet.id,
            coins: s.coins - (cost.coins ?? 0), gems: s.gems - (cost.gems ?? 0),
          }))
          sfx.success()
          get().say(`Hi! I'm ${pet.name}! 💛`)
          get().play('love')
          return true
        },
        switchPet: (activePetId) => { set({ activePetId, screen: 'home' }); get().play('jump') },
        renamePet: (id, name) => patchPet((p) => ({ ...p, name: name.trim() || p.name }), id),

        tick: (sec) => {
          const min = sec / 60
          set((s) => ({
            player: { ...s.player, playtime: s.player.playtime + sec },
            lastSeen: Date.now(),
            pets: s.pets.map((p) => {
              const sp = speciesById(p.species)
              const rate = p.id === s.activePetId ? 1 : 0.5
              const st = { ...p.stats }
              st.hunger = clamp(st.hunger - DECAY.hunger! * min * rate)
              st.happiness = clamp(st.happiness - DECAY.happiness! * min * rate)
              st.cleanliness = clamp(st.cleanliness - DECAY.cleanliness! * min * rate)
              if (p.sleeping) st.energy = clamp(st.energy + 5 * min * (sp.id === 'panda' ? 2 : 1))
              else st.energy = clamp(st.energy - DECAY.energy! * min * rate)
              if (st.hunger < 20 || st.cleanliness < 15) st.health = clamp(st.health - 0.4 * min)
              else if (st.hunger > 50 && st.happiness > 50 && st.cleanliness > 50) st.health = clamp(st.health + 0.3 * min)
              const sleeping = p.sleeping && st.energy < 100
              return { ...p, stats: st, sleeping }
            }),
          }))
        },

        applyOffline: () => {
          const s = get()
          const mins = Math.min((Date.now() - s.lastSeen) / 60000, 12 * 60)
          if (mins < 2) return
          set({
            lastSeen: Date.now(),
            pets: s.pets.map((p) => {
              const st = { ...p.stats }
              ;(['hunger', 'happiness', 'cleanliness'] as StatKey[]).forEach((k) => {
                if (st[k] > OFFLINE_FLOOR) st[k] = Math.max(OFFLINE_FLOOR, st[k] - DECAY[k]! * mins * 0.5)
              })
              st.energy = clamp(st.energy + mins * 0.5) // pets rest while you're away
              return { ...p, stats: st, sleeping: false }
            }),
          })
          if (mins > 30 && s.pets.length) get().toast(`${active()?.name ?? 'Your pet'} missed you! Welcome back 💛`, '👋')
        },

        feed: (itemId) => {
          const p = active()
          const it = itemById(itemId)
          if (!p || !it) return
          if ((get().inventory[itemId] ?? 0) <= 0) { get().toast(`No ${it.name} left — visit the Shop!`, '🛒'); sfx.error(); return }
          if (p.sleeping) { get().say('Zzz... 💤'); return }
          if (p.stats.hunger >= 97) { get().say("I'm so full! 😋"); get().play('shake'); return }
          const sp = speciesById(p.species)
          const fav = sp.favoriteFood === itemId
          set((s) => ({ inventory: { ...s.inventory, [itemId]: s.inventory[itemId] - 1 } }))
          patchPet((x) => addStats(x, { ...it.effect, friendship: (it.effect?.friendship ?? 0) + 1, happiness: (it.effect?.happiness ?? 0) + (fav ? 8 : 2) }))
          get().play('eat')
          sfx.chew()
          get().say(fav ? 'My FAVORITE! 😍' : ['Yum yum! 😋', 'Tasty!', 'Nom nom nom', 'More please!'][Math.floor(Math.random() * 4)])
          get().reward({ petXp: itemId === 'magic' ? 40 : 6, xp: 3 })
          float(`+${it.effect?.hunger ?? 0} 🍖`, '#ff7a59')
          get().track('feed')
        },

        useToy: (itemId) => {
          const p = active()
          const it = itemById(itemId)
          if (!p || !it) return
          if (p.sleeping) { get().say('Zzz... 💤'); return }
          if (p.stats.energy < 10) { get().say("I'm too sleepy to play... 🥱"); get().play('shake'); return }
          patchPet((x) => addStats(x, { ...it.effect, friendship: 1.5 }))
          get().play(['jump', 'spin', 'roll'][Math.floor(Math.random() * 3)] as Anim)
          sfx.pop()
          get().say(['Wheee! 🎉', 'Again! Again!', 'This is the best!'][Math.floor(Math.random() * 3)])
          get().reward({ petXp: 8, xp: 4 })
          float(`+${it.effect?.happiness ?? 0} 💛`, '#ffb703')
          get().track('toy')
        },

        care: (itemId) => {
          const p = active()
          const it = itemById(itemId)
          if (!p || !it) return
          const consumable = itemId !== 'brush'
          if (consumable && (get().inventory[itemId] ?? 0) <= 0) { get().toast(`No ${it.name} left — visit the Shop!`, '🛒'); sfx.error(); return }
          if (consumable) set((s) => ({ inventory: { ...s.inventory, [itemId]: s.inventory[itemId] - 1 } }))
          patchPet((x) => addStats(x, it.effect ?? {}))
          if (itemId === 'soap') { sfx.splash(); get().play('shake'); get().say('Squeaky clean! 🫧'); get().track('clean') }
          else if (itemId === 'brush') { sfx.step(); get().play('love'); get().say('Ahh, so fluffy~') }
          else { sfx.success(); get().play('jump'); get().say('I feel much better! 💪') }
          get().reward({ petXp: 4, xp: 2 })
          float(`+${Object.values(it.effect ?? {})[0]} ${it.icon}`, '#4cc9f0')
        },

        toggleSleep: () => {
          const p = active()
          if (!p) return
          if (!p.sleeping && p.stats.energy > 90) { get().say("I'm not sleepy yet!"); get().play('jump'); return }
          patchPet((x) => ({ ...x, sleeping: !x.sleeping }))
          if (!p.sleeping) { sfx.snore(); get().say('Good night... 💤') } else { sfx.tap(); get().say('Good morning! ☀️'); get().play('jump') }
        },

        petPet: () => {
          const p = active()
          if (!p) return
          if (p.sleeping) { get().say('Zzz... *snuggles*'); return }
          patchPet((x) => addStats(x, { happiness: 2, friendship: 0.6 }))
          const sp = speciesById(p.species)
          sfx.voice(sp.sound)
          get().say(sp.reactions[Math.floor(Math.random() * sp.reactions.length)])
          get().play(['love', 'jump', 'wave'][Math.floor(Math.random() * 3)] as Anim)
          get().track('pet')
          if (Math.random() < 0.08) get().reward({ coins: 2 }, 'Lucky pat!')
        },

        buy: (itemId, qty = 1) => {
          const it = itemById(itemId)
          if (!it) return false
          const c = (it.price.coins ?? 0) * qty
          const g = (it.price.gems ?? 0) * qty
          const s = get()
          if (c > s.coins || g > s.gems) { sfx.error(); get().toast('Not enough yet — play games to earn more!', '🪙'); return false }
          const permanent = it.kind === 'accessory' || it.kind === 'furniture'
          set((st) => ({
            coins: st.coins - c, gems: st.gems - g,
            owned: permanent && !st.owned.includes(itemId) ? [...st.owned, itemId] : st.owned,
            inventory: permanent ? st.inventory : { ...st.inventory, [itemId]: (st.inventory[itemId] ?? 0) + qty },
          }))
          sfx.coin()
          get().toast(`Bought ${qty > 1 ? qty + '× ' : ''}${it.name}!`, it.icon)
          return true
        },
        buyTheme: (id) => {
          const t = ROOM_THEMES.find((x) => x.id === id)!
          if (get().coins < t.price) { sfx.error(); get().toast('Not enough coins yet!', '🪙'); return false }
          set((s) => ({ coins: s.coins - t.price, ownedThemes: [...s.ownedThemes, id], room: { ...s.room, theme: id } }))
          sfx.coin()
          return true
        },

        equip: (slot, itemId) => { patchPet((p) => ({ ...p, equipped: { ...p.equipped, [slot]: itemId ?? undefined } })); sfx.pop(); if (itemId) get().play('spin') },
        setColor: (color) => { patchPet((p) => ({ ...p, color })); sfx.tap() },
        saveLook: (name) => {
          patchPet((p) => ({ ...p, looks: [...p.looks.slice(-3), { name, equipped: { ...p.equipped }, color: p.color }] }))
          sfx.success()
          get().toast('Look saved!', '📸')
        },
        applyLook: (i) => { patchPet((p) => (p.looks[i] ? { ...p, equipped: { ...p.looks[i].equipped }, color: p.looks[i].color } : p)); get().play('spin') },

        addFurniture: (id) => {
          set((s) => ({ room: { ...s.room, items: [...s.room.items, { uid: uid(), id, x: 30 + Math.random() * 40, y: 80, flip: false, rot: 0 }] } }))
          sfx.pop()
        },
        moveFurniture: (u, x, y) => set((s) => ({ room: { ...s.room, items: s.room.items.map((f) => (f.uid === u ? { ...f, x, y } : f)) } })),
        updateFurniture: (u, patch) => set((s) => ({ room: { ...s.room, items: s.room.items.map((f) => (f.uid === u ? { ...f, ...patch } : f)) } })),
        removeFurniture: (u) => { set((s) => ({ room: { ...s.room, items: s.room.items.filter((f) => f.uid !== u) } })); sfx.tap() },
        setTheme: (theme) => set((s) => ({ room: { ...s.room, theme } })),
        saveLayout: (name) => { set((s) => ({ savedLayouts: [...s.savedLayouts.slice(-2), { name, theme: s.room.theme, items: s.room.items.map((i) => ({ ...i })) }] })); sfx.success(); get().toast('Room layout saved!', '💾') },
        loadLayout: (i) => {
          const l = get().savedLayouts[i]
          if (!l) return
          // only restore furniture the player still owns
          set((s) => ({ room: { theme: l.theme, items: l.items.filter((f) => s.owned.includes(f.id)).map((f) => ({ ...f })) } }))
          sfx.pop()
        },

        travel: (w) => {
          if (!get().unlockedWorlds.includes(w)) return
          const changed = get().world !== w
          set({ world: w, screen: 'home' })
          sfx.whoosh()
          if (changed) { get().track('explore'); get().toast(`Welcome to ${worldById(w).name}!`, worldById(w).icon) }
        },
        unlockWorld: (w) => {
          const wd = worldById(w)
          const s = get()
          const lvl = levelInfo(s.player.xp).level
          if (lvl < wd.unlock.level || s.coins < wd.unlock.coins) { sfx.error(); return false }
          if (wd.unlock.achievement && achievementValue(s, ACHIEVEMENTS.find((a) => a.id === wd.unlock.achievement)!.stat) < ACHIEVEMENTS.find((a) => a.id === wd.unlock.achievement)!.goal) { sfx.error(); return false }
          set((st) => ({ coins: st.coins - wd.unlock.coins, unlockedWorlds: [...st.unlockedWorlds, w] }))
          sfx.levelUp()
          get().toast(`${wd.name} unlocked!`, wd.icon)
          return true
        },

        reward: (r, label) => {
          const before = levelInfo(get().player.xp).level
          set((s) => ({
            coins: s.coins + (r.coins ?? 0),
            gems: s.gems + (r.gems ?? 0),
            player: { ...s.player, xp: s.player.xp + (r.xp ?? 0) },
            counters: { ...s.counters, coinsEarned: (s.counters.coinsEarned ?? 0) + (r.coins ?? 0) },
          }))
          if (r.petXp && get().activePetId) { patchPet((p) => ({ ...p, xp: p.xp + r.petXp! })); checkEvolution(get().activePetId!) }
          if (r.coins) { float(`+${r.coins} 🪙`, '#f7b801'); sfx.coin(); get().track('coins', r.coins) }
          if (r.gems) float(`+${r.gems} 💎`, '#9b5de5')
          if (r.xp && r.xp >= 10) float(`+${r.xp} XP`, '#4cc9f0')
          if (label) get().toast(label, '🎁')
          const after = levelInfo(get().player.xp).level
          if (after > before) {
            set({ levelUp: after })
            sfx.levelUp()
            const newly = WORLDS.filter((w) => w.unlock.level === after)
            newly.forEach((w) => get().toast(`${w.name} can now be unlocked in Explore!`, w.icon))
          }
        },

        finishGame: (game, score, won) => {
          const p = active()
          const sp = p ? speciesById(p.species) : null
          let coins = Math.round(8 + score * (won ? 2 : 1))
          if (game === 'ball' && sp?.id === 'puppy') coins = Math.round(coins * 1.25)
          const r: Reward = { coins: Math.min(coins, 120), xp: won ? 25 : 10, petXp: won ? 30 : 12 }
          if (won && sp?.id === 'unicorn') r.gems = 1
          if (won && Math.random() < 0.15) r.gems = (r.gems ?? 0) + 1
          if (p) patchPet((x) => addStats(x, { happiness: won ? 15 : 8, energy: -10, friendship: 2, cleanliness: -4 }))
          set((s) => ({
            counters: { ...s.counters, games: (s.counters.games ?? 0) + 1, wins: (s.counters.wins ?? 0) + (won ? 1 : 0) },
            bestScores: { ...s.bestScores, [game]: Math.max(s.bestScores[game] ?? 0, score) },
          }))
          get().reward(r)
          get().track('game')
          if (won) get().track('win')
          return r
        },

        trainComplete: (skillId) => {
          const p = active()
          if (!p) return
          const lvl = Math.min(3, (p.skills[skillId] ?? 0) + 1)
          patchPet((x) => addStats({ ...x, skills: { ...x.skills, [skillId]: lvl } }, { energy: -(SKILLS.find((s) => s.id === skillId)?.energy ?? 8), friendship: 3, happiness: 6 }))
          get().reward({ coins: 15 + lvl * 10, xp: 20 + lvl * 10, petXp: 25 + lvl * 15, gems: lvl === 3 ? 2 : 0 })
          get().track('train')
        },
        performTrick: (skillId) => {
          const p = active()
          const sk = SKILLS.find((s) => s.id === skillId)
          if (!p || !sk || !p.skills[skillId]) return
          if (p.sleeping) { get().say('Zzz...'); return }
          if (p.stats.energy < 5) { get().say('Too tired... 🥱'); return }
          patchPet((x) => addStats(x, { energy: -2, happiness: 3, friendship: 0.5 }))
          get().play(sk.anim)
          sfx.jump()
          get().say(`${sk.name}! ${sk.icon}`)
        },

        track: (event, n = 1) => {
          get().ensureDaily()
          set((s) => {
            const counters = { ...s.counters }
            if (['feed', 'clean', 'train', 'pet'].includes(event)) counters[event + 's'] = (counters[event + 's'] ?? 0) + n
            const progress = { ...s.daily.progress }
            s.daily.missions.forEach((id) => {
              const m = MISSION_POOL.find((x) => x.id === id)
              if (m && m.event === event) progress[id] = Math.min(m.goal, (progress[id] ?? 0) + n)
            })
            return { counters, daily: { ...s.daily, progress } }
          })
        },
        ensureDaily: () => {
          if (get().daily.date !== today()) set({ daily: { date: today(), missions: pickMissions(), progress: {}, claimed: [] } })
        },
        claimMission: (id) => {
          const m = MISSION_POOL.find((x) => x.id === id)!
          const d = get().daily
          if (d.claimed.includes(id) || (d.progress[id] ?? 0) < m.goal) return
          set({ daily: { ...d, claimed: [...d.claimed, id] } })
          get().reward(m.reward, `Mission complete: ${m.text}`)
        },
        claimAchievement: (id) => {
          const a = ACHIEVEMENTS.find((x) => x.id === id)!
          if (get().achievementsClaimed.includes(id) || achievementValue(get(), a.stat) < a.goal) return
          set((s) => ({ achievementsClaimed: [...s.achievementsClaimed, id] }))
          sfx.levelUp()
          get().reward({ ...a.reward, xp: 30 }, `Badge earned: ${a.name}!`)
        },
        dailyRewardReady: () => get().lastDailyReward !== today() && get().pets.length > 0,
        claimDailyReward: () => {
          if (!get().dailyRewardReady()) return
          const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10)
          const streak = get().lastDailyReward === y ? Math.min(get().streak + 1, 7) : 1
          set({ lastDailyReward: today(), streak })
          get().reward({ coins: 30 + streak * 15, gems: streak >= 7 ? 5 : streak >= 3 ? 1 : 0, xp: 15 }, `Day ${streak} reward!`)
        },

        setSettings: (st) => set((s) => ({ settings: { ...s.settings, ...st } })),
        setPlayer: (p) => set((s) => ({ player: { ...s.player, ...p } })),
        clearEvolution: () => set({ evolution: null }),
        clearLevelUp: () => set({ levelUp: null }),
        nextTutorial: () => set((s) => ({ tutorialStep: s.tutorialStep >= 4 ? -1 : s.tutorialStep + 1 })),
        resetGame: () => set({ ...freshSave(), ...transient(), screen: 'adopt' }),
      }
    },
    {
      name: 'vpu-save-v1',
      version: 1,
      partialize: (s) => {
        const { screen, toasts, floats, anim, speech, evolution, levelUp, feedOpen, ...rest } = s
        return Object.fromEntries(Object.entries(rest).filter(([, v]) => typeof v !== 'function')) as unknown as GameStore
      },
    },
  ),
)

export const useActivePet = () => useGame((s) => s.pets.find((p) => p.id === s.activePetId))
export const SPECIES_LIST = SPECIES
