import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { useGame, achievementValue } from './store/game'
import { BottomNav, Overlays, TopBar, Tutorial } from './components/Chrome'
import { WorldBackdrop } from './components/Scene'
import { needIcon } from './components/PetActor'
import { configureAudio, setMusicWorld, unlockAudio } from './lib/audio'
import { worldById } from './data/worlds'
import { ACHIEVEMENTS } from './data/progress'
import { initCloud } from './lib/cloud'
import Adopt from './screens/Adopt'
import Home from './screens/Home'
import Play from './screens/Play'
import Train from './screens/Train'
import Shop from './screens/Shop'
import Explore from './screens/Explore'
import Customize from './screens/Customize'
import Decorate from './screens/Decorate'
import Collection from './screens/Collection'
import Missions from './screens/Missions'
import Profile from './screens/Profile'

const SCREENS = { home: Home, play: Play, train: Train, shop: Shop, explore: Explore, customize: Customize, decorate: Decorate, collection: Collection, missions: Missions, profile: Profile, adopt: Adopt }

export default function App() {
  const screen = useGame((s) => s.screen)
  const hasPet = useGame((s) => s.pets.length > 0)
  const world = useGame((s) => s.world)
  const settings = useGame((s) => s.settings)
  const notified = useRef<Record<string, number>>({})
  const announced = useRef<Set<string>>(new Set())

  // boot: catch up time away (gently), roll daily missions, optional cloud
  useEffect(() => {
    const g = useGame.getState()
    g.applyOffline()
    g.ensureDaily()
    if (!g.pets.length) useGame.setState({ screen: 'adopt' })
    initCloud()
    ACHIEVEMENTS.forEach((a) => { if (achievementValue(g, a.stat) >= a.goal) announced.current.add(a.id) })
    const unlock = () => unlockAudio()
    window.addEventListener('pointerdown', unlock, { once: true })
    return () => window.removeEventListener('pointerdown', unlock)
  }, [])

  // real-time needs loop
  useEffect(() => {
    const t = setInterval(() => {
      const g = useGame.getState()
      if (document.hidden) return
      g.tick(2)
      // newly reachable achievements get one friendly toast
      ACHIEVEMENTS.forEach((a) => {
        if (!announced.current.has(a.id) && !g.achievementsClaimed.includes(a.id) && achievementValue(g, a.stat) >= a.goal) {
          announced.current.add(a.id)
          g.toast(`Badge ready: ${a.name}! Claim it in Missions.`, a.icon)
        }
      })
    }, 2000)
    return () => clearInterval(t)
  }, [])

  // optional device notifications while the tab is in the background (max once per hour per need)
  useEffect(() => {
    if (!settings.notifications || !('Notification' in window)) return
    const t = setInterval(() => {
      if (!document.hidden || Notification.permission !== 'granted') return
      const g = useGame.getState()
      const p = g.pets.find((x) => x.id === g.activePetId)
      const n = p && needIcon(p)
      if (!p || !n) return
      if (Date.now() - (notified.current[n.label] ?? 0) < 3600_000) return
      notified.current[n.label] = Date.now()
      new Notification(`${p.name} says hi ${n.icon}`, { body: `${n.label} Come visit when you can!` })
    }, 60_000)
    return () => clearInterval(t)
  }, [settings.notifications])

  useEffect(() => configureAudio({ volume: settings.volume, music: settings.music, sfx: settings.sfx }), [settings.volume, settings.music, settings.sfx])
  useEffect(() => setMusicWorld(worldById(world).music), [world])

  const current = !hasPet ? 'adopt' : screen
  const Screen = SCREENS[current]
  const immersive = current === 'home' || current === 'decorate' || current === 'adopt'
  const reduce = settings.reducedMotion

  return (
    <MotionConfig reducedMotion={reduce ? 'always' : 'user'}>
      <div className={`fixed inset-0 overflow-hidden ${reduce ? 'reduce-motion' : ''}`}>
        {!immersive && (
          <div className="absolute inset-0">
            <WorldBackdrop world={world} />
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/25 to-pink-400/25 backdrop-blur-[2px]" />
          </div>
        )}
        <div className="relative h-full flex flex-col">
          {current !== 'adopt' && <TopBar />}
          <main className={immersive ? 'absolute inset-0' : 'relative flex-1 min-h-0'}>
            <AnimatePresence mode="wait">
              <motion.div key={current} className="absolute inset-0" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.22 }}>
                <Screen />
              </motion.div>
            </AnimatePresence>
          </main>
          {current !== 'adopt' && <BottomNav />}
        </div>
        {current === 'home' && <Tutorial />}
        <Overlays />
      </div>
    </MotionConfig>
  )
}
