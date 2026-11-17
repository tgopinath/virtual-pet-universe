import { AnimatePresence, motion } from 'framer-motion'
import type { ReactNode } from 'react'
import type { StatKey, Stats } from '../types'
import { RARITY_STYLE } from '../data/pets'

export function Modal({ open, onClose, children, title, wide }: { open: boolean; onClose?: () => void; children: ReactNode; title?: string; wide?: boolean }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 grid place-items-center p-4 bg-indigo-950/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            role="dialog" aria-modal="true" aria-label={title}
            className={`card w-full ${wide ? 'max-w-2xl' : 'max-w-md'} max-h-[90vh] overflow-y-auto p-5`}
            initial={{ scale: 0.7, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
          >
            {title && (
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-2xl font-bold">{title}</h2>
                {onClose && <button onClick={onClose} aria-label="Close" className="w-11 h-11 rounded-full bg-slate-100 text-xl font-bold">✕</button>}
              </div>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export const STAT_META: Record<StatKey, { icon: string; label: string }> = {
  hunger: { icon: '🍖', label: 'Hunger' },
  happiness: { icon: '😊', label: 'Happy' },
  energy: { icon: '⚡', label: 'Energy' },
  cleanliness: { icon: '🫧', label: 'Clean' },
  health: { icon: '❤️', label: 'Health' },
  friendship: { icon: '💖', label: 'Friend' },
}

export const statColor = (v: number) => (v >= 60 ? '#22c55e' : v >= 30 ? '#facc15' : '#ef4444')
export const statWord = (v: number) => (v >= 60 ? 'Great' : v >= 30 ? 'Needs attention' : 'Critical')

export function StatBar({ k, v, compact }: { k: StatKey; v: number; compact?: boolean }) {
  const m = STAT_META[k]
  const c = k === 'friendship' ? '#ff6fa5' : statColor(v)
  return (
    <div className="flex items-center gap-1.5" role="meter" aria-label={`${m.label} ${Math.round(v)} of 100, ${statWord(v)}`} aria-valuenow={Math.round(v)} aria-valuemin={0} aria-valuemax={100}>
      <span className={compact ? 'text-base' : 'text-lg'} aria-hidden>{m.icon}</span>
      <div className="flex-1 min-w-0">
        {!compact && <div className="flex justify-between text-[11px] font-extrabold leading-none mb-0.5 text-ink/70"><span>{m.label}</span><span>{Math.round(v)}</span></div>}
        <div className={`${compact ? 'h-2.5' : 'h-3'} rounded-full bg-black/10 overflow-hidden`}>
          <motion.div className="h-full rounded-full" style={{ background: c }} animate={{ width: `${v}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
        </div>
      </div>
    </div>
  )
}

export function StatsPanel({ stats, compact }: { stats: Stats; compact?: boolean }) {
  return (
    <div className={`grid ${compact ? 'grid-cols-3 gap-x-3 gap-y-1.5' : 'grid-cols-2 gap-x-4 gap-y-2'}`}>
      {(Object.keys(STAT_META) as StatKey[]).map((k) => <StatBar key={k} k={k} v={stats[k]} compact={compact} />)}
    </div>
  )
}

export function RarityTag({ r }: { r: string }) {
  const s = RARITY_STYLE[r]
  return <span className="pill text-xs" style={{ background: s.bg, color: s.fg }}>{r === 'Legendary' ? '★ ' : ''}{r}</span>
}

export function Price({ p }: { p: { coins?: number; gems?: number } }) {
  if (!p.coins && !p.gems) return <span className="font-bold text-mint">Free</span>
  return <span className="font-bold">{p.gems ? `💎 ${p.gems}` : `🪙 ${p.coins}`}</span>
}

export function ScreenShell({ title, icon, children, right }: { title: string; icon: string; children: ReactNode; right?: ReactNode }) {
  return (
    <div className="h-full overflow-y-auto no-scrollbar px-4 pb-32 pt-2">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between my-3">
          <h1 className="text-3xl font-bold text-white drop-shadow-[0_3px_0_rgba(60,40,120,.35)] flex items-center gap-2"><span aria-hidden>{icon}</span>{title}</h1>
          {right}
        </div>
        {children}
      </div>
    </div>
  )
}

export function Tabs<T extends string>({ tabs, value, onChange, onCard }: { tabs: { id: T; label: string }[]; value: T; onChange: (t: T) => void; onCard?: boolean }) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-3" role="tablist">
      {tabs.map((t) => (
        <button key={t.id} role="tab" aria-selected={value === t.id} onClick={() => onChange(t.id)}
          className={`shrink-0 px-4 min-h-11 rounded-full font-semibold text-base transition ${onCard ? (value === t.id ? 'bg-candy text-white shadow-md' : 'bg-slate-100 text-ink/70') : value === t.id ? 'bg-white text-ink shadow-md' : 'bg-white/40 text-white'}`}>
          {t.label}
        </button>
      ))}
    </div>
  )
}
