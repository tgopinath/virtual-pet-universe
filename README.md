# Virtual Pet Universe 🐾

A virtual pet game for kids aged 5–14. You adopt a pet, raise it from Baby to Legendary, feed it, play mini-games, train tricks, dress it up, decorate its home and explore six worlds.

## Run

```bash
npm install
npm run dev        # http://localhost:5280
npm run build      # typecheck + production build to dist/
```

Progress saves automatically to localStorage (guest mode). To turn on cloud save, copy `.env.example` to `.env`, fill in the Supabase URL and anon key, and run `supabase/schema.sql` on the project.

## Stack

React 19 + TypeScript · Tailwind CSS v4 · Framer Motion · Zustand (with persist) · Web Audio API (synthesized sound, no audio files) · optional Supabase (magic-link auth + JSON snapshot sync, loaded lazily).

## Structure

```
src/
  types.ts            shared types (Pet, Stats, Slot, …)
  data/               game content as plain data: species, items, worlds, skills, missions, achievements
  store/game.ts       all game logic: needs decay, offline catch-up, economy, XP/levels, evolution,
                      missions, achievements, inventory, room layout, persistence
  lib/audio.ts        synth SFX + per-world ambient music, volume/mute
  lib/cloud.ts        optional Supabase sync (no-op without env vars)
  components/
    PetArt.tsx        parametric SVG pet: 8 species × 3 palettes × 5 stages × mood × accessories
    PetActor.tsx      animation layer: idle per species, 13 actions, speech bubbles, need icons, emote bursts
    Scene.tsx         parallax world backdrops (6 worlds) + indoor room themes
    Chrome.tsx        top bar, bottom nav, toasts, floating rewards, evolution + level-up modals, tutorial
    ui.tsx            modal, stat bars (green/yellow/red), tabs, price, rarity tags
  screens/            Adopt, Home, Play, Train, Shop, Explore, Customize, Decorate, Collection, Missions, Profile
  games/              BallCatch, ObstacleRun, HideSeek, BubblePop, MemoryMatch, TreasureHunt
supabase/schema.sql   normalized Postgres schema + RLS (users, pets, attributes, inventory, catalog, progress)
```

## Game systems

- **Needs:** hunger, happiness, energy, cleanliness, health and friendship, each 0–100. They change in real time (every 2 s) and the change rates are kept low on purpose. While you're away, needs drift down but never below 25 and the pet rests. You can't lose a pet, and missing a day only resets the daily-gift streak.
- **Growth:** pet XP moves a pet through Baby → Young → Teen → Adult → Legendary. Legendary also needs 70 friendship. Each stage changes how the pet looks (size, markings, chest emblem, then a golden aura and crown) and unlocks skills and accessories.
- **Economy:** coins and gems come from care, mini-games, training, missions, achievements, daily gifts and tapping things in the world. Everything can be bought with in-game currency; there are no real-money purchases.
- **Species abilities change gameplay:**

  | Species | Ability |
  | --- | --- |
  | Puppy | +25% coins in Ball Catch |
  | Kitten | +20% score in Bubble Pop |
  | Bunny | Higher jump |
  | Panda | Recovers energy 2× faster while sleeping |
  | Fox | An extra dig in Treasure Hunt |
  | Dragon | Smashes through one obstacle |
  | Unicorn | A gem on every win |

- **Worlds:** each world has its own sky, terrain, props, particles, music key and featured game. Space, for example, has low gravity in Obstacle Run. Worlds unlock by player level, coins and some achievements.

## Swapping in real art later

`PetArt` is the only file that draws the pet. Its props are `pet`, `mood`, `size` and `look`. To use React Three Fiber models or Lottie files, replace that component and keep its props the same; the rest of the game doesn't change. Item and world art are emoji, set in `src/data/*`, so they can be replaced with image paths in one place.

## Not in v0.1 yet

- 3D models (R3F) and Lottie. Characters are hand-built animated SVG for now.
- Native Android and iOS builds. The app is a responsive web app; the planned route is Capacitor (`npx cap add android ios`), and no code changes are expected.
- Writing to the normalized tables. The schema is there, but the client currently syncs one JSON snapshot.
- Bundle splitting. The production bundle is about 515 kB (163 kB gzipped).
