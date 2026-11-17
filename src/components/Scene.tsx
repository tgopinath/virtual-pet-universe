import { useEffect, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { worldById } from '../data/worlds'
import { ROOM_THEMES } from '../data/items'
import type { WorldId } from '../types'

/** Layered parallax world backdrop: sky → far hills → clouds → props → ground → ambient particles. */
export function WorldBackdrop({ world, children, interactive = false, onProp }: { world: WorldId; children?: ReactNode; interactive?: boolean; onProp?: (emoji: string) => void }) {
  const w = worldById(world)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  useEffect(() => {
    const onMove = (e: PointerEvent) => setTilt({ x: e.clientX / window.innerWidth - 0.5, y: e.clientY / window.innerHeight - 0.5 })
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [])
  const night = world === 'space' || world === 'forest'
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: w.sky }}>
      {night && Array.from({ length: 40 }, (_, i) => (
        <span key={i} className="absolute rounded-full bg-white" style={{ width: (i % 3) + 1.5, height: (i % 3) + 1.5, left: `${(i * 53) % 100}%`, top: `${(i * 29) % 55}%`, opacity: 0.4 + (i % 5) * 0.12 }} />
      ))}
      {world === 'space' ? (
        <motion.div className="absolute text-[9rem] right-[8%] top-[8%]" animate={{ x: tilt.x * -20 }}>🪐</motion.div>
      ) : world === 'forest' ? (
        <motion.div className="absolute text-7xl right-[12%] top-[10%]" animate={{ x: tilt.x * -14 }}>🌙</motion.div>
      ) : (
        <motion.div className="absolute w-24 h-24 rounded-full right-[10%] top-[10%]" style={{ background: world === 'dragon' ? '#ffdf8a' : '#fff3a6', boxShadow: '0 0 60px 20px #fff7c2' }} animate={{ x: tilt.x * -14 }} />
      )}

      {/* far layer */}
      <motion.svg className="absolute bottom-[26%] left-[-5%] w-[110%] h-[40%]" viewBox="0 0 1000 300" preserveAspectRatio="none" animate={{ x: tilt.x * -18 }}>
        <path d={world === 'snow' || world === 'dragon' ? 'M0 300 L120 90 L230 220 L380 40 L520 230 L650 70 L800 210 L900 110 L1000 200 L1000 300Z' : 'M0 300 Q120 120 260 220 T520 200 T780 180 T1000 210 L1000 300Z'}
          fill={world === 'snow' ? '#c9d8ff' : world === 'dragon' ? '#c4705a' : world === 'space' ? '#4a4896' : world === 'forest' ? '#3d7a6a' : world === 'tropical' ? '#5fd0c0' : '#9fdc9a'} opacity="0.8" />
        {world === 'snow' && <path d="M380 40 L340 110 L420 110Z M120 90 L90 150 L150 150Z M650 70 L620 130 L690 130Z" fill="#fff" />}
        {world === 'dragon' && <path d="M380 40 Q390 0 370 -20" stroke="#ff7a3d" strokeWidth="18" fill="none" opacity="0.6" />}
      </motion.svg>
      {world === 'tropical' && (
        <div className="absolute bottom-[24%] inset-x-0 h-[10%]" style={{ background: 'linear-gradient(#3fb6ff,#7fd8ff)' }}>
          <div className="absolute inset-0 shimmer opacity-60" />
        </div>
      )}

      {/* clouds */}
      {!night && [0, 1, 2].map((i) => (
        <div key={i} className="cloud text-6xl" style={{ top: `${8 + i * 9}%`, animationDuration: `${50 + i * 25}s`, animationDelay: `${-i * 18}s`, opacity: 0.85 }}>☁️</div>
      ))}

      {/* ground */}
      <div className="absolute bottom-0 inset-x-0 h-[30%]" style={{ background: w.ground }}>
        <svg className="absolute -top-6 left-0 w-full h-8" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 10 Q10 0 20 6 T40 5 T60 6 T80 4 T100 6 V10Z" fill={w.groundTop} /></svg>
      </div>

      {/* props (tap for a tiny surprise) */}
      <motion.div className="absolute inset-x-0 bottom-[22%] h-[18%]" animate={{ x: tilt.x * -8 }}>
        {w.props.map((p, i) => {
          const left = [4, 18, 74, 88, 32, 62][i] ?? i * 15
          const big = i < 2
          return (
            <motion.button key={i} type="button" disabled={!interactive}
              aria-label={interactive ? `Tap the ${p}` : undefined}
              onClick={() => onProp?.(p)}
              whileTap={{ scale: 1.25, rotate: -8 }}
              className={`absolute bottom-0 ${big ? 'text-7xl' : 'text-4xl'} ${interactive ? 'cursor-pointer' : 'pointer-events-none'}`}
              style={{ left: `${left}%`, filter: 'drop-shadow(0 6px 4px rgba(0,0,0,.15))' }}>
              {p}
            </motion.button>
          )
        })}
      </motion.div>

      {/* ambient particles */}
      {Array.from({ length: world === 'snow' ? 14 : 6 }, (_, i) => (
        <span key={i} className="particle text-xl" style={{ left: `${(i * 41) % 100}%`, animationDuration: `${10 + (i % 5) * 3}s`, animationDelay: `${-i * 2.3}s`, opacity: 0.8 }}>
          {w.particles}
        </span>
      ))}
      {children}
    </div>
  )
}

export function RoomBackdrop({ theme, children }: { theme: string; children?: ReactNode }) {
  const t = ROOM_THEMES.find((x) => x.id === theme) ?? ROOM_THEMES[0]
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: t.wall }}>
      {/* window */}
      <div className="absolute left-1/2 -translate-x-1/2 top-[12%] w-44 h-32 rounded-t-[90px] rounded-b-2xl border-[10px] border-white/90 overflow-hidden shadow-lg" style={{ background: theme === 'night' ? '#1b1d4f' : 'linear-gradient(#9fd8ff,#e0f6ff)' }}>
        <div className="absolute inset-y-0 left-1/2 w-2 bg-white/90" />
        <div className="absolute inset-x-0 top-1/2 h-2 bg-white/90" />
        <span className="absolute text-3xl left-3 top-2">{theme === 'night' ? '🌙' : '☁️'}</span>
      </div>
      {/* wall pattern */}
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#fff 2px, transparent 2px)', backgroundSize: '28px 28px' }} />
      <div className="absolute top-[34%] left-[8%] text-4xl">🖼️</div>
      <div className="absolute bottom-0 inset-x-0 h-[30%]" style={{ background: t.floor }}>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(90deg,#0000 0 60px,#0003 60px 62px)' }} />
        <div className="absolute -top-3 inset-x-0 h-3 bg-white/60" />
      </div>
      {children}
    </div>
  )
}
