import type { Pet, Slot } from '../types'
import { speciesById } from '../data/pets'

export type Mood = 'normal' | 'happy' | 'sad' | 'sleep' | 'sleepy' | 'hungry' | 'dirty' | 'eat'

export function moodOf(p: Pet): Mood {
  if (p.sleeping) return 'sleep'
  const s = p.stats
  if (s.hunger < 30) return 'hungry'
  if (s.energy < 25) return 'sleepy'
  if (s.cleanliness < 30) return 'dirty'
  if (s.happiness < 30 || s.health < 30) return 'sad'
  if (s.happiness > 75) return 'happy'
  return 'normal'
}

interface Props {
  pet: Pick<Pet, 'species' | 'color' | 'equipped' | 'stage'> & { stats?: Pet['stats'] }
  mood?: Mood
  size?: number
  look?: number // -1..1 pupil offset
  className?: string
}

/** Pure, replaceable pet illustration. Swap this component for 3D/Lottie art later — props stay the same. */
export default function PetArt({ pet, mood = 'normal', size = 200, look = 0, className }: Props) {
  const sp = speciesById(pet.species)
  const [body, belly, accent] = sp.palettes[pet.color % sp.palettes.length]
  const eq = pet.equipped as Partial<Record<Slot, string>>
  const dirty = (pet.stats?.cleanliness ?? 100) < 30 || mood === 'dirty'
  const stage = pet.stage
  const isPenguin = sp.id === 'penguin'
  const ink = '#2b2340'
  const id = `p${sp.id}${pet.color}`

  return (
    <svg viewBox="0 0 200 210" width={size} height={size * 1.05} className={className} aria-hidden>
      <defs>
        <radialGradient id={`${id}-b`} cx="40%" cy="35%" r="75%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="60%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-glow`}>
          <stop offset="0%" stopColor="#fff6a8" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ffd23f" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* legendary aura */}
      {stage >= 4 && <circle cx="100" cy="115" r="98" fill={`url(#${id}-glow)`} />}
      {eq.effect === 'fx_rainbow' && (
        <g fill="none" strokeWidth="7" opacity="0.8" strokeLinecap="round">
          {['#ff6b6b', '#ffd93d', '#6bcB77', '#4d96ff', '#c77dff'].map((c, i) => (
            <path key={c} d={`M ${18 + i * 7} 120 A ${82 - i * 7} ${82 - i * 7} 0 0 1 ${182 - i * 7} 120`} stroke={c} />
          ))}
        </g>
      )}

      {/* ground shadow */}
      <ellipse cx="100" cy="198" rx="52" ry="8" fill="#000" opacity="0.12" />

      {/* wings (species or accessory) */}
      {(sp.extras.includes('wings') || eq.wings) && (
        <g className="wing-flap" style={{ transformOrigin: '100px 130px' }}>
          {eq.wings === 'wg_angel' ? (
            <>
              <path d="M62 128 C20 100 18 150 40 160 C30 150 48 140 66 146 Z" fill="#fff" stroke="#dfe6ff" strokeWidth="3" />
              <path d="M138 128 C180 100 182 150 160 160 C170 150 152 140 134 146 Z" fill="#fff" stroke="#dfe6ff" strokeWidth="3" />
            </>
          ) : eq.wings === 'wg_fairy' ? (
            <>
              <ellipse cx="54" cy="118" rx="26" ry="16" transform="rotate(-30 54 118)" fill="#bde0fe" opacity="0.75" stroke="#a2d2ff" strokeWidth="2" />
              <ellipse cx="146" cy="118" rx="26" ry="16" transform="rotate(30 146 118)" fill="#ffc8dd" opacity="0.75" stroke="#ffafcc" strokeWidth="2" />
              <ellipse cx="60" cy="146" rx="16" ry="10" transform="rotate(20 60 146)" fill="#cdb4db" opacity="0.7" />
              <ellipse cx="140" cy="146" rx="16" ry="10" transform="rotate(-20 140 146)" fill="#cdb4db" opacity="0.7" />
            </>
          ) : (
            <>
              <path d="M64 130 L26 102 L34 124 L20 128 L36 140 L28 152 L62 148 Z" fill={accent} opacity="0.9" />
              <path d="M136 130 L174 102 L166 124 L180 128 L164 140 L172 152 L138 148 Z" fill={accent} opacity="0.9" />
            </>
          )}
        </g>
      )}

      {/* tail */}
      <g className={sp.tail === 'wag' || sp.tail === 'bushy' ? 'tail-wag' : ''} style={{ transformOrigin: '140px 160px' }}>
        {sp.tail === 'wag' && <ellipse cx="152" cy="148" rx="9" ry="18" transform="rotate(35 152 148)" fill={accent} />}
        {sp.tail === 'curl' && <path d="M140 165 C175 165 175 120 158 118" stroke={body} strokeWidth="11" fill="none" strokeLinecap="round" />}
        {sp.tail === 'puff' && <circle cx="148" cy="166" r="13" fill={belly} stroke="#fff" strokeWidth="2" />}
        {sp.tail === 'stub' && <circle cx="146" cy="166" r="9" fill={accent} />}
        {sp.tail === 'bushy' && (
          <g>
            <path d="M136 168 C178 172 190 120 162 104 C170 130 150 150 136 156 Z" fill={body} />
            <path d="M162 104 C176 112 180 124 174 136 C168 124 166 114 162 104 Z" fill="#fff" />
          </g>
        )}
        {sp.tail === 'spike' && <path d="M138 170 C170 176 182 160 188 140 L176 150 L178 138 L166 152 L164 142 L152 158 Z" fill={body} stroke={accent} strokeWidth="2" />}
        {sp.tail === 'flow' && (
          <g fill="none" strokeLinecap="round" strokeWidth="7">
            <path d="M140 160 C170 150 172 180 186 168" stroke="#ff9de2" />
            <path d="M140 166 C168 162 168 190 184 182" stroke="#9de2ff" />
            <path d="M140 172 C164 174 160 196 176 194" stroke="#c9a7ff" />
          </g>
        )}
      </g>

      {/* body */}
      <ellipse cx="100" cy="150" rx={stage >= 3 ? 48 : 44} ry={stage >= 2 ? 42 : 38} fill={body} />
      <ellipse cx="100" cy="158" rx="30" ry="27" fill={belly} />
      {stage >= 3 && <path d="M100 146 l5 9 10 1 -8 7 3 10 -10 -5 -10 5 3 -10 -8 -7 10 -1z" fill={accent} opacity="0.75" />}
      <ellipse cx="100" cy="150" rx="44" ry="38" fill={`url(#${id}-b)`} />

      {/* feet / shoes */}
      {[76, 124].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy="188" rx="15" ry="9" fill={sp.id === 'panda' ? accent : isPenguin ? '#ffb02e' : body} />
          {eq.shoes === 'sh_boots' && <path d={`M${x - 14} 192 L${x - 14} 178 Q${x} 170 ${x + 14} 178 L${x + 14} 192 Z`} fill="#ff5d73" stroke="#d63a52" strokeWidth="2" />}
          {eq.shoes === 'sh_sneak' && (
            <g>
              <ellipse cx={x} cy="189" rx="16" ry="9" fill="#4d96ff" />
              <rect x={x - 16} y="191" width="32" height="5" rx="2.5" fill="#fff" />
            </g>
          )}
        </g>
      ))}

      {/* arms */}
      <ellipse cx="62" cy="150" rx="10" ry="16" transform="rotate(20 62 150)" fill={sp.id === 'panda' ? accent : body} />
      <ellipse cx="138" cy="150" rx="10" ry="16" transform="rotate(-20 138 150)" fill={sp.id === 'panda' ? accent : body} />

      {/* neck accessory */}
      {eq.neck === 'nk_bow' && (
        <g>
          <path d="M100 118 L78 106 L80 132 Z" fill="#ff6fa5" />
          <path d="M100 118 L122 106 L120 132 Z" fill="#ff6fa5" />
          <circle cx="100" cy="118" r="7" fill="#ff3d84" />
        </g>
      )}
      {eq.neck === 'nk_scarf' && (
        <g>
          <rect x="66" y="112" width="68" height="14" rx="7" fill="#ef476f" />
          <rect x="112" y="118" width="12" height="30" rx="5" fill="#ef476f" transform="rotate(-12 118 120)" />
          {[74, 90, 106, 122].map((x) => <rect key={x} x={x} y="112" width="5" height="14" fill="#ffd166" />)}
        </g>
      )}
      {eq.neck === 'nk_bell' && (
        <g>
          <rect x="70" y="114" width="60" height="9" rx="4.5" fill="#e63946" />
          <circle cx="100" cy="128" r="8" fill="#ffd23f" stroke="#e0a800" strokeWidth="2" />
          <circle cx="100" cy="131" r="2" fill="#a86b00" />
        </g>
      )}

      {/* ears behind head */}
      {sp.ears === 'floppy' && (
        <>
          <ellipse cx="54" cy="84" rx="15" ry="30" transform="rotate(18 54 84)" fill={accent} />
          <ellipse cx="146" cy="84" rx="15" ry="30" transform="rotate(-18 146 84)" fill={accent} />
        </>
      )}
      {sp.ears === 'long' && (
        <g className="ear-twitch" style={{ transformOrigin: '100px 50px' }}>
          <ellipse cx="78" cy="22" rx="13" ry="34" transform="rotate(-10 78 22)" fill={body} />
          <ellipse cx="78" cy="24" rx="6" ry="24" transform="rotate(-10 78 24)" fill="#ffb3c7" />
          <ellipse cx="122" cy="22" rx="13" ry="34" transform="rotate(10 122 22)" fill={body} />
          <ellipse cx="122" cy="24" rx="6" ry="24" transform="rotate(10 122 24)" fill="#ffb3c7" />
        </g>
      )}
      {sp.ears === 'pointy' && (
        <>
          <path d="M58 62 L64 18 L92 46 Z" fill={body} />
          <path d="M66 54 L68 30 L84 46 Z" fill={sp.id === 'unicorn' ? '#ffd6f0' : '#ffb3c7'} />
          <path d="M142 62 L136 18 L108 46 Z" fill={body} />
          <path d="M134 54 L132 30 L116 46 Z" fill={sp.id === 'unicorn' ? '#ffd6f0' : '#ffb3c7'} />
        </>
      )}
      {sp.ears === 'round' && (
        <>
          <circle cx="60" cy="44" r="17" fill={accent} />
          <circle cx="140" cy="44" r="17" fill={accent} />
        </>
      )}
      {sp.ears === 'horns' && (
        <>
          <path d="M70 44 Q60 18 74 8 Q74 30 84 40 Z" fill={accent} />
          <path d="M130 44 Q140 18 126 8 Q126 30 116 40 Z" fill={accent} />
        </>
      )}

      {/* mane (behind head top) */}
      {sp.extras.includes('mane') && (
        <g>
          <circle cx="64" cy="54" r="15" fill="#ff9de2" />
          <circle cx="56" cy="76" r="13" fill="#9de2ff" />
          <circle cx="58" cy="98" r="11" fill="#c9a7ff" />
        </g>
      )}

      {/* head */}
      <circle cx="100" cy="82" r="48" fill={body} />
      {isPenguin && <path d="M60 92 C60 60 80 52 100 66 C120 52 140 60 140 92 C140 118 60 118 60 92 Z" fill={belly} />}
      {sp.extras.includes('mask') && (
        <>
          <ellipse cx="74" cy="100" rx="20" ry="14" fill="#fff" />
          <ellipse cx="126" cy="100" rx="20" ry="14" fill="#fff" />
        </>
      )}
      <circle cx="100" cy="82" r="48" fill={`url(#${id}-b)`} />
      {stage >= 2 && <path d="M92 44 Q100 36 108 44 Q100 50 92 44 Z" fill={accent} opacity="0.7" />}

      {/* panda patches */}
      {sp.extras.includes('patches') && (
        <>
          <ellipse cx="80" cy="88" rx="14" ry="17" transform="rotate(25 80 88)" fill={accent} />
          <ellipse cx="120" cy="88" rx="14" ry="17" transform="rotate(-25 120 88)" fill={accent} />
        </>
      )}

      {/* unicorn horn */}
      {sp.extras.includes('horn') && (
        <g>
          <path d="M92 40 L100 0 L108 40 Z" fill="#ffd23f" stroke="#f4a300" strokeWidth="2" />
          <path d="M94 30 L106 26 M96 20 L104 17" stroke="#f4a300" strokeWidth="2" />
        </g>
      )}

      {/* eyes */}
      <Eyes mood={mood} look={look} ink={sp.extras.includes('patches') ? '#fff' : ink} pupil={ink} light={sp.extras.includes('patches')} />

      {/* cheeks */}
      <ellipse cx="68" cy="104" rx="9" ry="5.5" fill="#ff8fab" opacity={mood === 'happy' || mood === 'eat' ? 0.75 : 0.45} />
      <ellipse cx="132" cy="104" rx="9" ry="5.5" fill="#ff8fab" opacity={mood === 'happy' || mood === 'eat' ? 0.75 : 0.45} />

      {/* nose / beak + mouth */}
      {sp.extras.includes('beak') ? (
        <path d="M90 100 L110 100 L100 114 Z" fill="#ffb02e" stroke="#e08a00" strokeWidth="1.5" />
      ) : (
        <ellipse cx="100" cy="100" rx="6" ry="4.5" fill={sp.id === 'dragon' ? accent : ink} />
      )}
      <Mouth mood={mood} ink={ink} />

      {sp.extras.includes('whiskers') && (
        <g stroke={ink} strokeWidth="1.6" strokeLinecap="round" opacity="0.6">
          <path d="M60 98 L40 94 M60 104 L40 106 M140 98 L160 94 M140 104 L160 106" />
        </g>
      )}

      {/* dirt */}
      {dirty && (
        <g fill="#8d6e53" opacity="0.55">
          <circle cx="76" cy="66" r="6" /><circle cx="128" cy="140" r="8" /><circle cx="84" cy="164" r="5" /><circle cx="124" cy="62" r="4" /><circle cx="70" cy="140" r="4" />
        </g>
      )}

      {/* glasses */}
      {eq.glasses === 'gl_round' && (
        <g fill="none" stroke="#5a3e2b" strokeWidth="4">
          <circle cx="80" cy="86" r="14" /><circle cx="120" cy="86" r="14" /><path d="M94 86 L106 86" />
        </g>
      )}
      {eq.glasses === 'gl_sun' && (
        <g>
          <rect x="62" y="76" width="34" height="20" rx="9" fill="#1d1b2c" />
          <rect x="104" y="76" width="34" height="20" rx="9" fill="#1d1b2c" />
          <rect x="94" y="82" width="12" height="4" fill="#1d1b2c" />
          <path d="M68 82 L76 80" stroke="#fff" strokeWidth="3" opacity="0.6" strokeLinecap="round" />
        </g>
      )}
      {eq.glasses === 'gl_star' && (
        <g fill="#ffd23f" stroke="#ff8fab" strokeWidth="2.5" fillOpacity="0.5">
          <Star cx={80} cy={86} r={17} />
          <Star cx={120} cy={86} r={17} />
        </g>
      )}

      {/* hats */}
      {eq.hat === 'hat_party' && (
        <g>
          <path d="M76 46 L100 -2 L124 46 Z" fill="#4d96ff" />
          <path d="M84 30 L116 30 M90 16 L110 16" stroke="#ffd93d" strokeWidth="5" />
          <circle cx="100" cy="-2" r="7" fill="#ff6b6b" />
        </g>
      )}
      {eq.hat === 'hat_beanie' && (
        <g>
          <path d="M56 56 Q100 -4 144 56 Z" fill="#06d6a0" />
          <rect x="54" y="48" width="92" height="14" rx="7" fill="#05b384" />
          <circle cx="100" cy="14" r="10" fill="#fff" />
        </g>
      )}
      {eq.hat === 'hat_flower' && (
        <g>
          {[62, 78, 100, 122, 138].map((x, i) => (
            <g key={x}>
              <circle cx={x} cy={i === 2 ? 32 : i % 4 === 0 ? 50 : 38} r="9" fill={['#ff8fab', '#ffd93d', '#c77dff', '#ffd93d', '#ff8fab'][i]} />
              <circle cx={x} cy={i === 2 ? 32 : i % 4 === 0 ? 50 : 38} r="3.5" fill="#fff" />
            </g>
          ))}
        </g>
      )}
      {eq.hat === 'hat_top' && (
        <g>
          <rect x="66" y="38" width="68" height="9" rx="4" fill="#2b2340" />
          <rect x="78" y="0" width="44" height="42" rx="4" fill="#2b2340" />
          <rect x="78" y="28" width="44" height="7" fill="#ef476f" />
        </g>
      )}
      {(eq.hat === 'hat_crown' || stage >= 4) && !(eq.hat && eq.hat !== 'hat_crown') && (
        <g>
          <path d="M72 44 L74 14 L88 30 L100 6 L112 30 L126 14 L128 44 Z" fill="#ffd23f" stroke="#e0a800" strokeWidth="2.5" />
          <circle cx="100" cy="30" r="4.5" fill="#ef476f" /><circle cx="84" cy="36" r="3" fill="#4d96ff" /><circle cx="116" cy="36" r="3" fill="#06d6a0" />
        </g>
      )}
    </svg>
  )
}

function Star({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2
    const rr = i % 2 ? r * 0.5 : r
    return `${cx + Math.cos(a) * rr},${cy + Math.sin(a) * rr}`
  }).join(' ')
  return <polygon points={pts} />
}

function Eyes({ mood, look, ink, pupil, light }: { mood: Mood; look: number; ink: string; pupil: string; light: boolean }) {
  const dx = look * 4
  if (mood === 'happy' || mood === 'eat')
    return (
      <g stroke={light ? '#fff' : ink} strokeWidth="4.5" fill="none" strokeLinecap="round">
        <path d="M70 90 Q80 78 90 90" /><path d="M110 90 Q120 78 130 90" />
      </g>
    )
  if (mood === 'sleep')
    return (
      <g stroke={light ? '#fff' : ink} strokeWidth="4" fill="none" strokeLinecap="round">
        <path d="M70 88 Q80 96 90 88" /><path d="M110 88 Q120 96 130 88" />
      </g>
    )
  const lid = mood === 'sleepy'
  return (
    <g>
      {[80, 120].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy="87" rx="9.5" ry={lid ? 6 : 12} fill={pupil} />
          <circle cx={x + 3 + dx} cy={lid ? 85 : 82} r="3.8" fill="#fff" />
          <circle cx={x - 3 + dx} cy="92" r="1.8" fill="#fff" opacity="0.8" />
          {lid && <rect x={x - 11} y="74" width="22" height="10" fill="none" />}
        </g>
      ))}
      {mood === 'sad' && (
        <g stroke={light ? '#fff' : ink} strokeWidth="3" strokeLinecap="round">
          <path d="M70 70 L88 75" /><path d="M130 70 L112 75" />
        </g>
      )}
      {mood === 'sad' && <path d="M132 98 q4 8 0 12 q-4 -4 0 -12z" fill="#7ad7ff" />}
    </g>
  )
}

function Mouth({ mood, ink }: { mood: Mood; ink: string }) {
  if (mood === 'eat') return <ellipse className="chew" cx="100" cy="116" rx="9" ry="7" fill="#7a2b3a" style={{ transformOrigin: '100px 116px' }} />
  if (mood === 'happy') return <path d="M88 110 Q100 126 112 110 Z" fill="#7a2b3a" stroke={ink} strokeWidth="2" strokeLinejoin="round" />
  if (mood === 'sad') return <path d="M90 118 Q100 110 110 118" stroke={ink} strokeWidth="3" fill="none" strokeLinecap="round" />
  if (mood === 'sleep') return <ellipse cx="100" cy="114" rx="4" ry="3" fill="#7a2b3a" />
  if (mood === 'hungry') return <path d="M90 112 Q100 122 110 112" stroke={ink} strokeWidth="3" fill="#ff8fab" strokeLinecap="round" />
  return <path d="M90 108 Q95 115 100 108 Q105 115 110 108" stroke={ink} strokeWidth="3" fill="none" strokeLinecap="round" />
}
