// Optional cloud save via Supabase. With no env vars set the game runs in guest mode
// (zustand persist → localStorage) and this module is a no-op.
import type { SupabaseClient } from '@supabase/supabase-js'
import { useGame } from '../store/game'

const URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
export const cloudEnabled = !!(URL && KEY)

let client: SupabaseClient | null = null
let userId: string | null = null
let lastSync = 0

async function getClient() {
  if (!cloudEnabled) return null
  if (!client) {
    const { createClient } = await import('@supabase/supabase-js')
    client = createClient(URL!, KEY!)
  }
  return client
}

export function cloudStatus() {
  if (!userId) return 'Not signed in — playing as guest.'
  return lastSync ? `Synced ${new Date(lastSync).toLocaleTimeString()}` : 'Signed in.'
}

export async function signInWithEmail(email: string) {
  const c = await getClient()
  if (!c) return 'Cloud save is not configured.'
  const { error } = await c.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.href } })
  return error ? `Could not send link: ${error.message}` : 'Check that inbox for a magic sign-in link!'
}

/** Pull the newest save on sign-in, then push changes (debounced) as the player plays. */
export async function initCloud() {
  const c = await getClient()
  if (!c) return
  const { data } = await c.auth.getSession()
  userId = data.session?.user.id ?? null
  c.auth.onAuthStateChange((_e, s) => { userId = s?.user.id ?? null; if (userId) pull() })
  if (userId) await pull()

  let t: number | undefined
  useGame.subscribe(() => {
    if (!userId) return
    clearTimeout(t)
    t = window.setTimeout(push, 4000)
  })
}

async function pull() {
  const c = await getClient()
  if (!c || !userId) return
  const { data } = await c.from('game_progress').select('state, updated_at').eq('user_id', userId).maybeSingle()
  const local = useGame.getState()
  if (data?.state && (data.state.lastSeen ?? 0) > local.lastSeen) {
    useGame.setState(data.state)
    local.toast('Cloud save loaded!', '☁️')
  } else push()
}

async function push() {
  const c = await getClient()
  if (!c || !userId) return
  const raw = localStorage.getItem('vpu-save-v1')
  if (!raw) return
  const state = JSON.parse(raw).state
  const { error } = await c.from('game_progress').upsert({ user_id: userId, state, updated_at: new Date().toISOString() })
  if (!error) lastSync = Date.now()
}
