// Auth screens: Login, 2FA, account-inactive.

function LoginScreen({ onLogin }) {
  const [username, setUsername] = React.useState('priya.r');
  const [password, setPassword] = React.useState('••••••••••');
  const [org, setOrg] = React.useState('cleveland-clinic');
  const [showPw, setShowPw] = React.useState(false);
  const [state, setState] = React.useState('idle'); // idle | loading | error | twofa | inactive
  const [otp, setOtp] = React.useState(['', '', '', '', '', '']);
  const [demoRole, setDemoRole] = React.useState('ORG_OWNER');

  const submit = () => {
    setState('loading');
    setTimeout(() => {
      if (username === 'wrong') setState('error');
      else if (username === 'inactive') setState('inactive');
      else setState('twofa');
    }, 700);
  };

  const verify = () => {
    setState('loading');
    setTimeout(() => onLogin(demoRole), 500);
  };

  const otpChange = (i, v) => {
    const next = [...otp];
    next[i] = v.replace(/\D/g, '').slice(-1);
    setOtp(next);
  };

  if (state === 'twofa') {
    return (
      <div style={{
        flex: 1, padding: '24px 24px 36px', display: 'flex', flexDirection: 'column',
        background: T.bg, gap: 20,
      }}>
        <button onClick={() => setState('idle')} style={{
          background: 'transparent', border: 'none', color: T.textDim, padding: 0,
          display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer',
          alignSelf: 'flex-start',
        }}> Back</button>
        <div>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: T.accentSoft, color: T.accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 18,
          }}></div>
          <div style={{ fontSize: 24, fontWeight: 700, color: T.text, letterSpacing: '-.01em' }}>Verify it's you</div>
          <div style={{ fontSize: 13.5, color: T.textDim, marginTop: 8, lineHeight: 1.5 }}>
            We sent a 6-digit code to <span style={{ color: T.text, fontFamily: 'JetBrains Mono, monospace' }}>•••• 4421</span>. It expires in 5:00.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 7, justifyContent: 'space-between' }}>
          {otp.map((v, i) => (
            <input key={i} value={v} onChange={(e) => otpChange(i, e.target.value)}
              maxLength={1} inputMode="numeric"
              style={{
                width: 44, height: 54, border: `1px solid ${v ? T.accent : T.borderSoft}`,
                background: T.surface, borderRadius: 12, textAlign: 'center',
                color: T.text, fontSize: 22, fontWeight: 600,
                fontFamily: 'JetBrains Mono, monospace', outline: 'none',
              }}/>
          ))}
        </div>
        <div style={{ flex: 1 }}/>
        Verify and continue</Btn>
        <button style={{
          background: 'transparent', border: 'none', color: T.accent, fontSize: 13,
          padding: 8, cursor: 'pointer',
        }}>Resend code</button>

        {/* Demo role picker */}
        <div style={{
          padding: 12, background: T.surface, borderRadius: 12,
          border: `1px dashed ${T.border}`,
        }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.08em', color: T.textDim, marginBottom: 8 }}>DEMO · CONTINUE AS</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
            {['PLATFORM_ADMIN','ORG_OWNER','ORG_ADMIN','CARESITE_OWNER','CARESITE_ADMIN'].map(r => (
              <button key={r} onClick={() => setDemoRole(r)} style={{
                background: demoRole === r ? T.accentSoft : 'transparent',
                border: `1px solid ${demoRole === r ? T.accent : T.borderSoft}`,
                color: demoRole === r ? T.accent : T.text,
                borderRadius: 8, padding: '8px 6px', fontSize: 10.5, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace',
              }}>{window.ROLES[r].short}</button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      flex: 1, padding: '32px 24px 24px', display: 'flex', flexDirection: 'column',
      background: T.bg, gap: 22,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 18 }}>
        
        <div>
          <div style={{ fontSize: 28, fontWeight: 700, color: T.text, letterSpacing: '-.02em', lineHeight: 1.1 }}>
            Welcome back
          </div>
          <div style={{ fontSize: 14, color: T.textDim, marginTop: 8, lineHeight: 1.5 }}>
            Sign in to manage your IoMT estate.
          </div>
        </div>
      </div>

      {/* Form */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        
          } mono />
        </Field>
        
          }
            error={state === 'error'}/>
        </Field>
        
          }
            trailing={
               : }
                       onClick={() => setShowPw(!showPw)}
                       style={{ width: 28, height: 28, color: T.textDim }}/>
            }/>
        </Field>

        {state === 'inactive' && (
          <div style={{
            background: T.badSoft, border: `1px solid rgba(239,68,68,.3)`,
            borderRadius: 12, padding: 12, display: 'flex', gap: 10,
          }}>
            
            <div style={{ fontSize: 12.5, color: T.bad, lineHeight: 1.45 }}>
              Account inactive. Contact your administrator to reactivate.
            </div>
          </div>
        )}

        <button style={{
          alignSelf: 'flex-end', background: 'transparent', border: 'none',
          color: T.accent, fontSize: 12.5, fontWeight: 500, padding: '4px 0', cursor: 'pointer',
        }}>Forgot password?</button>
      </div>

      
        {state === 'loading'
          ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                width: 14, height: 14, borderRadius: '50%',
                border: '2px solid rgba(255,255,255,.4)',
                borderTopColor: '#fff', animation: 'spin .8s linear infinite',
              }}/>
              Signing in…
            </span>
          : 'Sign in'}
      </Btn>

      <div style={{ flex: 1 }}/>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        fontSize: 11, color: T.textFaint, fontFamily: 'JetBrains Mono, monospace',
      }}>
        
      </div>
    </div>
  );
}

Object.assign(window, { LoginScreen });
