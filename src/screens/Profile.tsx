import { useState } from 'react'
import { useGame } from '../store/game'
import { levelInfo, ACHIEVEMENTS } from '../data/progress'
import { WORLDS } from '../data/worlds'
import { Modal, ScreenShell } from '../components/ui'
import { cloudEnabled, signInWithEmail, cloudStatus } from '../lib/cloud'

const AVATARS = ['🧒', '👧', '👦', '🧑', '👩‍🚀', '🧙', '🦸', '🧚', '🐻', '🐯']

export default function Profile() {
  const g = useGame()
  const lv = levelInfo(g.player.xp)
  const [name, setName] = useState(g.player.name)
  const [confirmReset, setConfirmReset] = useState(false)
  const [email, setEmail] = useState('')
  const [cloudMsg, setCloudMsg] = useState('')
  const hours = Math.floor(g.player.playtime / 3600)
  const mins = Math.floor((g.player.playtime % 3600) / 60)
  const totalProgress = Math.round(
    ((g.achievementsClaimed.length / ACHIEVEMENTS.length) * 0.4 + (g.unlockedWorlds.length / WORLDS.length) * 0.3 + Math.min(1, g.pets.length / 8) * 0.3) * 100,
  )

  const askNotifications = async (on: boolean) => {
    if (on && 'Notification' in window && Notification.permission !== 'granted') {
      const r = await Notification.requestPermission()
      if (r !== 'granted') { g.toast('Notifications were not allowed — in-game reminders still work.', '🔕'); return }
    }
    g.setSettings({ notifications: on })
  }

  return (
    <ScreenShell title="Profile" icon="🧑">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-200 to-pink-200 grid place-items-center text-5xl">{g.player.avatar}</div>
            <div className="flex-1 min-w-0">
              <div className="flex gap-2">
                <input value={name} maxLength={16} onChange={(e) => setName(e.target.value)} aria-label="Player name" className="flex-1 min-w-0 min-h-12 rounded-2xl border-4 border-pink-200 px-3 font-display font-semibold text-xl" />
                <button className="btn btn-white !min-h-12" onClick={() => { g.setPlayer({ name: name.trim() || 'Pet Pal' }); g.toast('Name saved!', '✏️') }}>Save</button>
              </div>
              <div className="font-bold text-ink/60 mt-1">Level {lv.level} · {lv.into}/{lv.need} XP</div>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap mt-3" role="radiogroup" aria-label="Avatar">
            {AVATARS.map((a) => (
              <button key={a} role="radio" aria-checked={g.player.avatar === a} onClick={() => g.setPlayer({ avatar: a })} className={`w-12 h-12 rounded-full text-2xl bg-slate-50 ${g.player.avatar === a ? 'ring-4 ring-candy' : ''}`}>{a}</button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4 text-center">
            {[
              ['🪙', g.coins, 'Coins'], ['💎', g.gems, 'Gems'], ['🐾', g.pets.length, 'Pets'],
              ['🏅', g.achievementsClaimed.length, 'Badges'], ['🗺️', `${g.unlockedWorlds.length}/${WORLDS.length}`, 'Worlds'], ['⏱', hours ? `${hours}h ${mins}m` : `${mins}m`, 'Playtime'],
            ].map(([i, v, l]) => (
              <div key={l as string} className="rounded-2xl bg-slate-50 p-2"><div className="text-2xl">{i}</div><div className="font-display font-bold text-lg">{v}</div><div className="text-[11px] font-extrabold text-ink/50">{l}</div></div>
            ))}
          </div>
          <div className="mt-4">
            <div className="flex justify-between font-bold text-sm"><span>Overall progress</span><span>{totalProgress}%</span></div>
            <div className="h-3 rounded-full bg-black/10 overflow-hidden mt-1"><div className="h-full bg-gradient-to-r from-sky to-grape" style={{ width: `${totalProgress}%` }} /></div>
          </div>
          <div className="text-xs font-bold text-ink/50 mt-3">Total coins earned: {g.counters.coinsEarned ?? 0} · Games played: {g.counters.games ?? 0} · Wins: {g.counters.wins ?? 0}</div>
        </div>

        <div className="card p-4 space-y-3">
          <h2 className="text-xl font-bold">⚙️ Settings</h2>
          <label className="block font-bold">Volume: {Math.round(g.settings.volume * 100)}%
            <input type="range" min={0} max={1} step={0.05} value={g.settings.volume} onChange={(e) => g.setSettings({ volume: +e.target.value })} className="w-full accent-pink-500 h-8" />
          </label>
          <Toggle label="🎵 Background music" on={g.settings.music} set={(v) => g.setSettings({ music: v })} />
          <Toggle label="🔊 Sound effects" on={g.settings.sfx} set={(v) => g.setSettings({ sfx: v })} />
          <Toggle label="🐢 Reduce motion" on={g.settings.reducedMotion} set={(v) => g.setSettings({ reducedMotion: v })} />
          <Toggle label="💬 Pet reminders in game" on={g.settings.reminders} set={(v) => g.setSettings({ reminders: v })} />
          <Toggle label="🔔 Device notifications" on={g.settings.notifications} set={askNotifications} />
          <div className="pt-2 border-t border-black/5">
            <h3 className="font-bold">☁️ Save</h3>
            <p className="text-sm font-bold text-ink/60">Progress saves automatically on this device{cloudEnabled ? ' and can sync to the cloud.' : '. (Guest mode)'}</p>
            {cloudEnabled && (
              <form className="flex gap-2 mt-2" onSubmit={async (e) => { e.preventDefault(); setCloudMsg(await signInWithEmail(email)) }}>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Grown-up's email" className="flex-1 min-w-0 min-h-11 rounded-2xl border-4 border-sky-200 px-3 font-bold" />
                <button className="btn btn-blue !min-h-11">Sync</button>
              </form>
            )}
            {cloudEnabled && <p className="text-xs font-bold text-ink/50 mt-1">{cloudMsg || cloudStatus()}</p>}
          </div>
          <button className="text-sm font-bold text-red-500 min-h-11" onClick={() => setConfirmReset(true)}>Start over…</button>
        </div>
      </div>

      <Modal open={confirmReset} onClose={() => setConfirmReset(false)} title="Start over?">
        <p className="font-bold text-ink/70">This erases all pets, coins and progress on this device. It can’t be undone.</p>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <button className="btn btn-white" onClick={() => setConfirmReset(false)}>Keep playing</button>
          <button className="btn" onClick={() => { g.resetGame(); setConfirmReset(false) }}>Erase</button>
        </div>
      </Modal>
    </ScreenShell>
  )
}

function Toggle({ label, on, set }: { label: string; on: boolean; set: (v: boolean) => void }) {
  return (
    <button role="switch" aria-checked={on} onClick={() => set(!on)} className="w-full flex items-center justify-between min-h-12 font-bold">
      <span>{label}</span>
      <span className={`w-14 h-8 rounded-full p-1 transition ${on ? 'bg-mint' : 'bg-slate-300'}`}><span className={`block w-6 h-6 rounded-full bg-white shadow transition ${on ? 'translate-x-6' : ''}`} /></span>
    </button>
  )
}
