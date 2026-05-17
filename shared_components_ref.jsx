// Shared components for iTouch Admin.

// ─── Tokens ──────────────────────────────────────────────────
const T = {
  bg:        '#0A0E13',
  surface:   '#121821',
  surface2:  '#1A2230',
  elevated:  '#1F2937',
  border:    '#243044',
  borderSoft:'#1B2435',
  text:      '#E5EAF0',
  textDim:   '#8A95A5',
  textFaint: '#5A6473',
  accent:    '#3B82F6',
  accentSoft:'rgba(59,130,246,0.16)',
  good:      '#10B981',
  warn:      '#F59E0B',
  bad:       '#EF4444',
  goodSoft:  'rgba(16,185,129,0.14)',
  badSoft:   'rgba(239,68,68,0.12)',
};

// ─── Role badge ──────────────────────────────────────────────
function RoleBadge({ role, size = 'sm' }) {
  const r = window.ROLES[role] || { label: role, color: T.textDim, bg: 'rgba(255,255,255,.06)' };
  const px = size === 'xs' ? '2px 6px' : '3px 8px';
  const fs = size === 'xs' ? 9.5 : 10.5;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: px, borderRadius: 999, background: r.bg,
      color: r.color, fontSize: fs, fontWeight: 600, letterSpacing: '.06em',
      fontFamily: 'JetBrains Mono, ui-monospace, monospace',
      whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: r.color }} />
      {r.short}
    </span>
  );
}

// ─── Status pill ─────────────────────────────────────────────
function StatusPill({ status }) {
  const map = {
    ACTIVE:    { color: T.good, bg: T.goodSoft, border: 'transparent', label: 'ACTIVE' },
    INACTIVE:  { color: T.bad,  bg: 'transparent', border: 'rgba(239,68,68,.5)', label: 'INACTIVE' },
    PENDING:   { color: T.warn, bg: 'rgba(245,158,11,.12)', border: 'transparent', label: 'PENDING' },
    ONLINE:    { color: T.good, bg: T.goodSoft, border: 'transparent', label: 'ONLINE' },
    OFFLINE:   { color: T.bad,  bg: 'transparent', border: 'rgba(239,68,68,.5)', label: 'OFFLINE' },
    WARN:      { color: T.warn, bg: 'rgba(245,158,11,.12)', border: 'transparent', label: 'WARN'   },
    IDLE:      { color: T.textDim, bg: 'rgba(138,149,165,.1)', border: 'transparent', label: 'IDLE' },
    OCCUPIED:  { color: T.accent, bg: T.accentSoft, border: 'transparent', label: 'OCCUPIED' },
    AVAILABLE: { color: T.good, bg: T.goodSoft, border: 'transparent', label: 'AVAILABLE' },
    CLEANING:  { color: T.warn, bg: 'rgba(245,158,11,.12)', border: 'transparent', label: 'CLEANING' },
  };
  const s = map[status] || { color: T.textDim, bg: 'rgba(138,149,165,.1)', border: 'transparent', label: status };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 7px', borderRadius: 4, background: s.bg,
      border: `1px solid ${s.border}`,
      color: s.color, fontSize: 9.5, fontWeight: 600, letterSpacing: '.06em',
      fontFamily: 'JetBrains Mono, ui-monospace, monospace',
    }}>{s.label}</span>
  );
}

// ─── Card surface ────────────────────────────────────────────
function Card({ children, style, onClick, padding = 14, accent = false }) {
  return (
    <div onClick={onClick} style={{
      background: accent ? 'linear-gradient(180deg, rgba(59,130,246,.06), transparent)' : T.surface,
      border: `1px solid ${T.borderSoft}`,
      borderRadius: 14, padding, cursor: onClick ? 'pointer' : 'default',
      transition: 'border-color .15s, background .15s',
      ...style,
    }}>{children}</div>
  );
}

// ─── Sparkline ───────────────────────────────────────────────
function Sparkline({ data, color = '#3B82F6', height = 28, width = 76, fill = true }) {
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);
  const pts = data.map((v, i) => [i * stepX, height - ((v - min) / range) * (height - 2) - 1]);
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const area = `${path} L${width} ${height} L0 ${height} Z`;
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      {fill && (
        <defs>
          <linearGradient id={`sg-${color.slice(1)}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%"   stopColor={color} stopOpacity=".28"/>
            <stop offset="100%" stopColor={color} stopOpacity="0"/>
          </linearGradient>
        </defs>
      )}
      {fill && <path d={area} fill={`url(#sg-${color.slice(1)})`} />}
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ─── Stat card ───────────────────────────────────────────────
function StatCard({ icon, label, value, delta, spark, sparkColor, accent }) {
  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.borderSoft}`,
      borderRadius: 14, padding: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div style={{
          width: 26, height: 26, borderRadius: 7, background: accent || T.accentSoft,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: T.accent,
        }}>{icon}</div>
        <div style={{ fontSize: 10.5, color: T.textDim, fontWeight: 500, letterSpacing: '.02em', flex: 1 }}>{label}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-.01em', color: T.text, fontFeatureSettings: '"tnum"' }}>{value}</div>
          {delta != null && (
            <div style={{ fontSize: 10, color: delta >= 0 ? T.good : T.bad, fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>
              {delta >= 0 ? '↑' : '↓'} {Math.abs(delta)}%
            </div>
          )}
        </div>
        {spark && }
      </div>
    </div>
  );
}

// ─── Top bar (custom) ────────────────────────────────────────
function TopBar({ title, subtitle, leading, trailing, onBack, onLeadingClick }) {
  const handleClick = onBack || onLeadingClick;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 14px 12px',
      borderBottom: `1px solid ${T.borderSoft}`,
      background: T.bg,
    }}>
      {(handleClick || leading) && (
        <button onClick={handleClick} style={{
          width: 36, height: 36, borderRadius: 10, border: 'none',
          background: 'transparent', color: T.text, display: 'flex',
          alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>{leading || }</button>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: T.text, lineHeight: 1.1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{title}</div>
        {subtitle && (
          <div style={{ fontSize: 11, color: T.textDim, marginTop: 2, fontFamily: 'JetBrains Mono, monospace', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{subtitle}</div>
        )}
      </div>
      {trailing}
    </div>
  );
}

// ─── Bottom nav ──────────────────────────────────────────────
function BottomNav({ items, active, onChange }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: `repeat(${items.length}, 1fr)`,
      borderTop: `1px solid ${T.borderSoft}`, background: T.bg,
      padding: '6px 4px 8px',
    }}>
      {items.map(it => {
        const on = it.id === active;
        return (
          <button key={it.id} onClick={() => onChange(it.id)} style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 3, padding: '6px 2px', color: on ? T.text : T.textDim,
            position: 'relative',
          }}>
            <div style={{
              padding: '3px 14px', borderRadius: 999,
              background: on ? T.accentSoft : 'transparent',
              color: on ? T.accent : T.textDim,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{React.cloneElement(it.icon, { size: 19 })}</div>
            <span style={{ fontSize: 9.5, fontWeight: on ? 600 : 500, letterSpacing: '.02em' }}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Section header ──────────────────────────────────────────
function SectionHeader({ title, action, count }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '4px 2px 8px',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.08em', color: T.textDim, textTransform: 'uppercase' }}>{title}</span>
        {count != null && <span style={{ fontSize: 11, color: T.textFaint, fontFamily:'JetBrains Mono, monospace' }}>{count}</span>}
      </div>
      {action}
    </div>
  );
}

// ─── Search bar ──────────────────────────────────────────────
function SearchBar({ placeholder = 'Search', value = '', onChange, trailing }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      background: T.surface, border: `1px solid ${T.borderSoft}`,
      borderRadius: 12, padding: '0 10px', height: 38,
    }}>
      
      <input value={value} onChange={(e) => onChange && onChange(e.target.value)}
        placeholder={placeholder} style={{
        flex: 1, border: 'none', background: 'transparent', outline: 'none',
        color: T.text, fontSize: 13, fontFamily: 'inherit',
      }}/>
      {trailing}
    </div>
  );
}

// ─── Form field ──────────────────────────────────────────────
function Field({ label, hint, error, children, optional, mono }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <label style={{ fontSize: 11, color: T.textDim, fontWeight: 500, letterSpacing: '.02em' }}>{label}</label>
        {optional && <span style={{ fontSize: 10, color: T.textFaint, fontFamily:'JetBrains Mono, monospace' }}>OPTIONAL</span>}
      </div>
      {children}
      {error
        ? <div style={{ fontSize: 11, color: T.bad, display:'flex', alignItems:'center', gap:5 }}>{error}</div>
        : hint && <div style={{ fontSize: 11, color: T.textFaint, fontFamily: mono ? 'JetBrains Mono, monospace' : 'inherit' }}>{hint}</div>}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = 'text', leading, trailing, mono, error, autoFocus }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      background: T.surface, border: `1px solid ${error ? T.bad : T.borderSoft}`,
      borderRadius: 12, padding: '0 12px', height: 42,
      transition: 'border-color .15s',
    }}>
      {leading && <span style={{ color: T.textDim }}>{leading}</span>}
      <input value={value} onChange={(e) => onChange && onChange(e.target.value)}
        placeholder={placeholder} type={type} autoFocus={autoFocus}
        style={{
          flex: 1, border: 'none', background: 'transparent', outline: 'none',
          color: T.text, fontSize: 14, fontFamily: mono ? 'JetBrains Mono, monospace' : 'inherit',
        }}/>
      {trailing}
    </div>
  );
}

function Select({ value, onChange, options, placeholder }) {
  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.borderSoft}`,
      borderRadius: 12, padding: '0 12px', height: 42, position: 'relative',
      display: 'flex', alignItems: 'center',
    }}>
      <select value={value} onChange={(e) => onChange && onChange(e.target.value)} style={{
        flex: 1, border: 'none', background: 'transparent', outline: 'none',
        color: value ? T.text : T.textDim, fontSize: 14, fontFamily: 'inherit',
        appearance: 'none', WebkitAppearance: 'none',
      }}>
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      
    </div>
  );
}

// ─── Buttons ─────────────────────────────────────────────────
function Btn({ children, variant = 'primary', size = 'md', icon, onClick, full, danger, style, disabled }) {
  const sizes = {
    sm: { h: 32, px: 12, fs: 12.5 },
    md: { h: 42, px: 16, fs: 14 },
    lg: { h: 48, px: 18, fs: 15 },
  }[size];
  let bg, color, border;
  if (variant === 'primary') { bg = danger ? T.bad : T.accent; color = '#fff'; border = 'transparent'; }
  else if (variant === 'ghost') { bg = 'transparent'; color = danger ? T.bad : T.text; border = T.border; }
  else if (variant === 'tonal') { bg = danger ? T.badSoft : T.accentSoft; color = danger ? T.bad : T.accent; border = 'transparent'; }
  else if (variant === 'flat') { bg = 'transparent'; color = danger ? T.bad : T.text; border = 'transparent'; }
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
      height: sizes.h, padding: `0 ${sizes.px}px`, borderRadius: 12,
      background: bg, color, border: `1px solid ${border}`,
      fontSize: sizes.fs, fontWeight: 600, fontFamily: 'inherit',
      cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? .5 : 1,
      width: full ? '100%' : undefined, letterSpacing: '.01em',
      ...style,
    }}>
      {icon}{children}
    </button>
  );
}

function IconBtn({ icon, onClick, label, style, color }) {
  return (
    <button onClick={onClick} title={label} style={{
      width: 36, height: 36, borderRadius: 10, border: 'none',
      background: 'transparent', color: color || T.text, display: 'flex',
      alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
      ...style,
    }}>{icon}</button>
  );
}

// ─── FAB ─────────────────────────────────────────────────────
function FAB({ icon, label, onClick }) {
  return (
    <button onClick={onClick} style={{
      position: 'absolute', right: 16, bottom: 80,
      height: 52, padding: label ? '0 18px 0 16px' : 0, width: label ? undefined : 52,
      borderRadius: 16, border: 'none', cursor: 'pointer',
      background: T.accent, color: '#fff',
      display: 'flex', alignItems: 'center', gap: 8,
      boxShadow: '0 6px 18px rgba(59,130,246,.4), 0 2px 4px rgba(0,0,0,.2)',
      fontSize: 14, fontWeight: 600,
    }}>
      {icon}{label}
    </button>
  );
}

// ─── Empty state ─────────────────────────────────────────────
function EmptyState({ icon, title, hint, action }) {
  return (
    <div style={{
      padding: '36px 24px', textAlign: 'center',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 16,
        background: T.surface, border: `1px solid ${T.borderSoft}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: T.textDim,
      }}>{React.cloneElement(icon, { size: 26 })}</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: T.text }}>{title}</div>
      <div style={{ fontSize: 12.5, color: T.textDim, maxWidth: 240, lineHeight: 1.45 }}>{hint}</div>
      {action && <div style={{ marginTop: 4 }}>{action}</div>}
    </div>
  );
}

// ─── Bottom sheet / modal ────────────────────────────────────
function BottomSheet({ open, onClose, title, children, height }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, background: 'rgba(0,0,0,.5)',
      zIndex: 30, display: 'flex', alignItems: 'flex-end',
      backdropFilter: 'blur(2px)',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: '100%', background: T.surface2,
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        borderTop: `1px solid ${T.border}`,
        padding: 18, maxHeight: height || '80%', overflow: 'auto',
        animation: 'sheetUp .2s ease-out',
      }}>
        <div style={{
          width: 36, height: 4, borderRadius: 2,
          background: T.border, margin: '0 auto 14px',
        }} />
        {title && (
          <div style={{
            fontSize: 16, fontWeight: 600, color: T.text, marginBottom: 14,
          }}>{title}</div>
        )}
        {children}
      </div>
    </div>
  );
}

// ─── Confirm dialog ──────────────────────────────────────────
function ConfirmDialog({ open, onClose, onConfirm, title, body, confirmLabel = 'Confirm', danger }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, background: 'rgba(0,0,0,.55)',
      zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, backdropFilter: 'blur(2px)',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: '100%', background: T.surface2,
        borderRadius: 16, border: `1px solid ${T.border}`,
        padding: 20, animation: 'dialogIn .15s ease-out',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: danger ? T.badSoft : T.accentSoft,
            color: danger ? T.bad : T.accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}></div>
          <div style={{ fontSize: 16, fontWeight: 600, color: T.text }}>{title}</div>
        </div>
        <div style={{ fontSize: 13, color: T.textDim, lineHeight: 1.5, marginBottom: 18 }}>{body}</div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          Cancel</Btn>
          {confirmLabel}</Btn>
        </div>
      </div>
    </div>
  );
}

// ─── Toast ───────────────────────────────────────────────────
function Toast({ message, kind = 'info' }) {
  if (!message) return null;
  const map = {
    info:  { bg: T.surface2,  color: T.text,   icon:  },
    good:  { bg: T.goodSoft,  color: T.good,   icon:  },
    bad:   { bg: T.badSoft,   color: T.bad,    icon:  },
  }[kind];
  return (
    <div style={{
      position: 'absolute', left: 16, right: 16, bottom: 88,
      background: map.bg, color: map.color,
      border: `1px solid ${T.border}`,
      borderRadius: 12, padding: '12px 14px',
      display: 'flex', alignItems: 'center', gap: 10,
      fontSize: 13, fontWeight: 500, zIndex: 25,
      boxShadow: '0 8px 24px rgba(0,0,0,.4)',
      animation: 'toastIn .2s ease-out',
    }}>
      {map.icon}{message}
    </div>
  );
}

// ─── Logo ────────────────────────────────────────────────────
function Logo({ size = 24, withWordmark = true }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <img src={window.__resources?.itouchLogo || "assets/itouch-logo.png"} alt="iTouch" width={size} height={size}
           style={{ borderRadius: size * 0.18 }}/>
      {withWordmark && (
        <span style={{ fontSize: size * 0.62, fontWeight: 700, letterSpacing: '-.01em', color: T.text }}>
          iTouch <span style={{ color: T.textDim, fontWeight: 500 }}>Admin</span>
        </span>
      )}
    </div>
  );
}

// ─── Tag chip ────────────────────────────────────────────────
function Chip({ children, color, on, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 999,
      background: on ? (color || T.accent) : T.surface,
      color: on ? '#fff' : T.text,
      border: `1px solid ${on ? 'transparent' : T.borderSoft}`,
      fontSize: 11.5, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
    }}>{children}</button>
  );
}

// ─── Avatar ──────────────────────────────────────────────────
function Avatar({ initials, color = T.accent, size = 36 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.32,
      background: `linear-gradient(135deg, ${color}, ${color}aa)`,
      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: 600, letterSpacing: '.02em',
      flexShrink: 0,
    }}>{initials}</div>
  );
}

// ─── Signal bars (for devices/gateways) ──────────────────────
function SignalBars({ level = 4, color = T.good }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'flex-end', gap: 1.5, height: 12 }}>
      {[1,2,3,4,5].map(i => (
        <div key={i} style={{
          width: 2.5, height: i * 2 + 2,
          borderRadius: 1,
          background: i <= level ? color : T.border,
        }}/>
      ))}
    </div>
  );
}

Object.assign(window, {
  T, RoleBadge, StatusPill, Card, Sparkline, StatCard, TopBar, BottomNav,
  SectionHeader, SearchBar, Field, TextInput, Select, Btn, IconBtn, FAB,
  EmptyState, BottomSheet, ConfirmDialog, Toast, Logo, Chip, Avatar, SignalBars,
});
