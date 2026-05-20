// ORG_OWNER / ORG_ADMIN screens: Dashboard, Hospitals, Users, Roles, Summary.

function OrgDashboard({ go, role }) {
  const isOwner = role === 'ORG_OWNER';
  return (
    <div style={{ padding: '14px 14px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Greeting */}
      <div>
        <div style={{ fontSize: 11, color: T.textDim, letterSpacing: '.08em', fontWeight: 600 }}>FRI, 16 MAY · CLEVELAND CLINIC</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: T.text, letterSpacing: '-.01em', marginTop: 2 }}>
          {isOwner ? 'Good morning, Priya' : 'Good morning, James'}
        </div>
        <div style={{ fontSize: 12.5, color: T.textDim, marginTop: 4 }}>
          <span style={{ color: T.good, fontWeight: 600 }}>14 hospitals</span> online · 2 alerts pending
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        } label="Hospitals" value="14"    delta={0}  spark={[12,12,13,13,14,14,14,14,14,14]} sparkColor={T.accent}/>
        }    label="Users"     value="1,284" delta={2}  spark={[1180,1200,1220,1240,1255,1268,1272,1278,1281,1284]} sparkColor="#2DD4BF" accent="rgba(45,212,191,.14)"/>
        }    label="Devices"   value="4,218" delta={1}  spark={[4080,4100,4120,4140,4160,4180,4195,4205,4210,4218]} sparkColor="#22D3EE" accent="rgba(34,211,238,.14)"/>
        }  label="Gateways"  value="78"    delta={-1} spark={[80,80,79,79,79,78,78,78,78,78]} sparkColor="#A78BFA" accent="rgba(167,139,250,.14)"/>
      </div>

      {/* Alert strip */}
      
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: 'rgba(245,158,11,.14)', color: T.warn,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>2 hospitals need attention</div>
            <div style={{ fontSize: 11.5, color: T.textDim, marginTop: 3, lineHeight: 1.5 }}>
              Marymount Hospital is inactive · Gateway GW-CLV-005 offline at PED 5W
            </div>
            <button style={{ background:'transparent', border:'none', color:T.warn, fontSize:12, fontWeight:600, padding:0, marginTop: 6, cursor:'pointer' }}>Review →</button>
          </div>
        </div>
      </Card>

      {/* Top hospitals */}
      <div>
         go('hospitals')} style={{ background:'transparent', border:'none', color:T.accent, fontSize:11.5, fontWeight:600, padding:0, cursor:'pointer' }}>View all →</button>
        }/>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {HOSPITALS.slice(0, 3).map(h => (
             go('hospital-detail', { hospId: h.id })}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: T.surface2, color: T.accent,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: T.text, flex: 1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{h.name}</div>
                    
                  </div>
                  <div style={{ fontSize: 11, color: T.textFaint, fontFamily: 'JetBrains Mono, monospace', marginTop: 3, display: 'flex', gap: 10 }}>
                    <span>{h.code}</span>
                    <span>{h.beds} beds</span>
                    <span>{h.devices} dev</span>
                  </div>
                </div>
                
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Capacity bar */}
      
        
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 10 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: T.text, fontFamily: 'JetBrains Mono, monospace' }}>3,331</div>
          <div style={{ fontSize: 12, color: T.textDim }}>/ 4,218 devices active · 79%</div>
        </div>
        <div style={{ height: 8, background: T.surface2, borderRadius: 4, overflow: 'hidden', display: 'flex' }}>
          <div style={{ width: '64%', background: T.good }}/>
          <div style={{ width: '15%', background: T.warn }}/>
          <div style={{ width: '5%', background: T.bad }}/>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: T.textDim }}>
          <span><span style={{ color: T.good }}>●</span> Online 2,698</span>
          <span><span style={{ color: T.warn }}>●</span> Warn 633</span>
          <span><span style={{ color: T.bad }}>●</span> Offline 211</span>
        </div>
      </Card>
    </div>
  );
}

function HospitalsScreen({ go, role, fab }) {
  const [q, setQ] = React.useState('');
  const filtered = HOSPITALS.filter(h => h.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div style={{ padding: '14px 14px 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      } style={{ width: 28, height: 28, color: T.textDim }}/>}/>

      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
        All · {HOSPITALS.length}</Chip>
        Active · {HOSPITALS.filter(h=>h.status==='ACTIVE').length}</Chip>
        Inactive · {HOSPITALS.filter(h=>h.status==='INACTIVE').length}</Chip>
        Ohio</Chip>
      </div>

      

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(h => (
           go('hospital-detail', { hospId: h.id })}>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'linear-gradient(135deg, #14B8A6, #06B6D4)',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: T.text, flex: 1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{h.name}</div>
                  
                </div>
                <div style={{ fontSize: 11.5, color: T.textDim, fontFamily: 'JetBrains Mono, monospace' }}>{h.code} · {h.city}</div>
                <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 11.5, fontFamily: 'JetBrains Mono, monospace', color: T.textDim }}>
                  <span> <span style={{ color: T.text, fontWeight: 600 }}>{h.beds}</span> beds</span>
                  <span> <span style={{ color: T.text, fontWeight: 600 }}>{h.wards}</span> wards</span>
                  <span> <span style={{ color: T.text, fontWeight: 600 }}>{h.devices}</span> dev</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function HospitalDetailScreen({ hospId, go, role, toast }) {
  const h = HOSPITALS.find(x => x.id === hospId) || HOSPITALS[0];
  const [confirm, setConfirm] = React.useState(false);
  return (
    <div style={{ padding: '14px 14px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: 'linear-gradient(135deg, #14B8A6, #06B6D4)',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}></div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: T.text }}>{h.name}</div>
              
            </div>
            <div style={{ fontSize: 11.5, color: T.textDim, fontFamily: 'JetBrains Mono, monospace', marginTop: 4 }}>{h.code}</div>
            <div style={{ fontSize: 12, color: T.textDim, marginTop: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
              {h.city}
            </div>
          </div>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {[
          { l: 'Beds',  v: h.beds,    i:  },
          { l: 'Wards', v: h.wards,   i:  },
          { l: 'Dev',   v: h.devices, i:  },
        ].map((s, i) => (
          <div key={i} style={{
            background: T.surface, border: `1px solid ${T.borderSoft}`,
            borderRadius: 12, padding: '12px 10px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10.5, color: T.textDim, letterSpacing: '.05em' }}>
              {s.i}{s.l.toUpperCase()}
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: T.text, marginTop: 4, fontFamily: 'JetBrains Mono, monospace' }}>{s.v}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        }>Edit</Btn>
        } onClick={() => go('users')}>View users</Btn>
      </div>

      {/* Wards mini */}
      <div>
        
        
          {WARDS.slice(0, 4).map((w, i) => (
            <div key={w.id} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
              borderTop: i ? `1px solid ${T.borderSoft}` : 'none',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 9,
                background: T.surface2, color: '#22D3EE',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: T.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{w.name}</div>
                <div style={{ fontSize: 11, color: T.textFaint, fontFamily: 'JetBrains Mono, monospace' }}>{w.code} · {w.occupied}/{w.beds} occupied</div>
              </div>
              <div style={{
                width: 36, height: 6, background: T.surface2, borderRadius: 3, overflow: 'hidden',
              }}>
                <div style={{ width: `${(w.occupied/w.beds)*100}%`, height: '100%', background: T.good }}/>
              </div>
            </div>
          ))}
        </Card>
      </div>

      {role === 'ORG_OWNER' && (
        } onClick={() => setConfirm(true)}>
          Deactivate hospital
        </Btn>
      )}

       setConfirm(false)}
        onConfirm={() => { setConfirm(false); toast('Hospital ' + h.code + ' deactivated', 'good'); go('hospitals'); }}
        title={`Deactivate ${h.code}?`}
        body={`All users and devices scoped to this hospital will lose access. This can be reversed by reactivating the hospital.`}
        confirmLabel="Deactivate" danger/>
    </div>
  );
}

function CreateHospitalScreen({ go, toast }) {
  const [f, setF] = React.useState({ code: '', name: '', description: '', contact: '', address: '' });
  const set = (k, v) => setF({ ...f, [k]: v });
  const validCode = /^[a-zA-Z0-9-]{1,16}$/.test(f.code);
  const valid = f.code && validCode && f.name;
  return (
    <div style={{ padding: '14px 14px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      
         set('code', v.toUpperCase())} placeholder="CLV-MAIN" mono error={f.code && !validCode}/>
      </Field>
      
         set('name', v)} placeholder="Cleveland Main Campus"/>
      </Field>
      
         set('description', v)} placeholder="Flagship campus, level-1 trauma"/>
      </Field>
      
         set('contact', v)} leading={} placeholder="Dr. Anika Bhatt"/>
      </Field>
      
         set('address', v)} leading={} placeholder="9500 Euclid Ave, Cleveland, OH"/>
      </Field>
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
         go('hospitals')} full>Cancel</Btn>
         { toast('Hospital ' + f.code + ' created', 'good'); go('hospitals'); }} full>Create hospital</Btn>
      </div>
    </div>
  );
}

function UsersScreen({ go, role, hospScoped }) {
  const [q, setQ] = React.useState('');
  const [tab, setTab] = React.useState('all');
  let filtered = hospScoped
    ? USERS.filter(u => u.hospital !== '—')
    : USERS;
  filtered = filtered.filter(u => u.name.toLowerCase().includes(q.toLowerCase()));
  if (tab !== 'all') filtered = filtered.filter(u => u.role === tab);

  return (
    <div style={{ padding: '14px 14px 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      

      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
         setTab('all')}>All · {USERS.length}</Chip>
        {!hospScoped &&  setTab('ORG_OWNER')}>Org Owners</Chip>}
        {!hospScoped &&  setTab('ORG_ADMIN')}>Org Admins</Chip>}
         setTab('HOSP_OWNER')}>Hosp Owners</Chip>
         setTab('HOSP_ADMIN')}>Hosp Admins</Chip>
         setTab('DOCTOR')}>Clinical</Chip>
      </div>

      

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(u => (
           go('user-detail', { userId: u.id })}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: T.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.name}</div>
                <div style={{ fontSize: 11, color: T.textFaint, fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>{u.email}</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 6, alignItems: 'center' }}>
                  
                  
                  {u.hospital !== '—' && <span style={{ fontSize: 10.5, color: T.textDim, fontFamily: 'JetBrains Mono, monospace' }}>{u.hospital}</span>}
                </div>
              </div>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && (
          } title="No users match"
            hint="Try a different filter or invite someone new."
            action={}>Invite user</Btn>}/>
        )}
      </div>
    </div>
  );
}

function CreateUserScreen({ go, toast, defaultRole, scope, activeRole }) {
  // Filter role options by what `activeRole` is permitted to create.
  // ORG_ADMIN cannot create ORG_ADMIN.  HOSP_ADMIN cannot create HOSP_ADMIN.
  const orgRolesAll = [
    { value: 'ORG_ADMIN',  label: 'Org Admin',         hint: 'Administrative control of the org', ownerOnly: true },
    { value: 'HOSP_OWNER', label: 'Hospital Owner',    hint: 'Full control of one hospital' },
    { value: 'HOSP_ADMIN', label: 'Hospital Admin',    hint: 'Administrative control of one hospital' },
  ];
  const hospRolesAll = [
    { value: 'HOSP_ADMIN', label: 'Hospital Admin', hint: 'Administrative control of this hospital', ownerOnly: true },
    { value: 'DOCTOR',     label: 'Doctor',         hint: 'Clinical · attending physician' },
    { value: 'NURSE',      label: 'Nurse',          hint: 'Clinical · bedside care' },
  ];
  const allow = (o) => !o.ownerOnly
    || activeRole === 'ORG_OWNER' || activeRole === 'PLATFORM_ADMIN'
    || (scope === 'hosp' && activeRole === 'HOSP_OWNER');
  const opts = (scope === 'org' ? orgRolesAll : hospRolesAll).filter(allow);

  const [f, setF] = React.useState({
    role: defaultRole || opts[0]?.value,
    name: '', username: '', email: '', phone: '', hospital: scope === 'org' ? 'CLV-MAIN' : '',
  });
  const set = (k, v) => setF({ ...f, [k]: v });
  const validUser = /^[a-zA-Z0-9]+$/.test(f.username);
  const valid = f.name && f.username && validUser;

  return (
    <div style={{ padding: '14px 14px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(' + opts.length + ', 1fr)', gap: 6 }}>
          {opts.map(o => {
            const on = f.role === o.value;
            const r = window.ROLES[o.value];
            return (
              <button key={o.value} onClick={() => set('role', o.value)} style={{
                background: on ? r.bg : T.surface,
                border: `1px solid ${on ? r.color : T.borderSoft}`,
                color: on ? r.color : T.text,
                borderRadius: 12, padding: '10px 8px', fontSize: 11.5, fontWeight: 600,
                cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: r.color }}/>
                <span>{o.label}</span>
              </button>
            );
          })}
        </div>
      </Field>

      
         set('name', v)} placeholder="Dr. Sofia Marquez"/>
      </Field>
      
         set('username', v)} placeholder="s.marquez" mono/>
      </Field>
      
         set('email', v)} placeholder="s.marquez@clev.health" leading={}/>
      </Field>
      
         set('phone', v)} placeholder="+1 555 0100" leading={}/>
      </Field>
      {scope === 'org' && (f.role === 'HOSP_OWNER' || f.role === 'HOSP_ADMIN') && (
        
           set('hospital', v)}
            options={HOSPITALS.map(h => ({ value: h.code, label: h.name + ' · ' + h.code }))}/>
        </Field>
      )}

      <div style={{
        padding: 12, background: T.surface, borderRadius: 12, border: `1px dashed ${T.border}`,
        fontSize: 11.5, color: T.textDim, lineHeight: 1.5,
      }}>
        Invite link is one-time use, valid 7 days. The new user sets their own password and configures 2FA on first sign-in.
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
         go('users')} full>Cancel</Btn>
         { toast('Invite sent to ' + (f.email || f.username), 'good'); go('users'); }} full>
          Send invitation
        </Btn>
      </div>
    </div>
  );
}

function UserDetailScreen({ userId, go, role, toast }) {
  const u = USERS.find(x => x.id === userId) || USERS[0];
  const [confirm, setConfirm] = React.useState(null); // 'deactivate' | 'delete'
  return (
    <div style={{ padding: '14px 14px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: T.text }}>{u.name}</div>
            <div style={{ fontSize: 12, color: T.textDim, fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>{u.email}</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 8, alignItems: 'center' }}>
              
              
            </div>
          </div>
        </div>
      </Card>

      
        {[
          { l: 'Hospital', v: u.hospital, i:  },
          { l: 'Username', v: u.email.split('@')[0], i: , mono: true },
          { l: 'Last sign-in', v: '2h ago · Pixel 8 · Cleveland, OH', i:  },
          { l: 'Created', v: '14 Feb 2026 by p.raghunathan', i:  },
        ].map((row, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
            borderTop: i ? `1px solid ${T.borderSoft}` : 'none',
          }}>
            <div style={{ color: T.textDim, width: 16 }}>{row.i}</div>
            <div style={{ fontSize: 12, color: T.textDim, width: 90 }}>{row.l}</div>
            <div style={{ fontSize: 13, color: T.text, flex: 1, textAlign: 'right', fontFamily: row.mono ? 'JetBrains Mono, monospace' : 'inherit' }}>{row.v}</div>
          </div>
        ))}
      </Card>

      <div style={{ display: 'flex', gap: 8 }}>
        }>Edit</Btn>
        }>Reset password</Btn>
      </div>

      }
      </Btn>

      {(role === 'ORG_OWNER' || role === 'HOSP_OWNER' || role === 'PLATFORM_ADMIN') && (
        } onClick={() => setConfirm('delete')}>
          Delete user
        </Btn>
      )}

       setConfirm(null)}
        onConfirm={() => { setConfirm(null); toast(u.name + ' deactivated', 'good'); go('users'); }}
        title={`${u.status === 'ACTIVE' ? 'Deactivate' : 'Reactivate'} ${u.name.split(' ')[0]}?`}
        body="They will be signed out of all sessions immediately and lose access until reactivated."
        confirmLabel={u.status === 'ACTIVE' ? 'Deactivate' : 'Reactivate'}/>
       setConfirm(null)}
        onConfirm={() => { setConfirm(null); toast(u.name + ' deleted', 'bad'); go('users'); }}
        title={`Delete ${u.name.split(' ')[0]}?`}
        body="This permanently removes the account, their audit trail is preserved. This action cannot be undone."
        confirmLabel="Delete" danger/>
    </div>
  );
}

function RolesScreen({ go, role }) {
  return (
    <div style={{ padding: '14px 14px 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      } onClick={() => go('role-edit', { roleId: 'new' })}>New role</Btn>
      }/>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {ROLES_LIST.map(r => (
           go('role-edit', { roleId: r.id })}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: `${r.color}22`, color: r.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{r.name}</div>
                  {r.system && <span style={{
                    fontSize: 9, color: T.textDim, padding: '2px 6px', borderRadius: 4,
                    background: T.surface2, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '.05em', fontWeight: 600,
                  }}>SYSTEM</span>}
                </div>
                <div style={{ fontSize: 11.5, color: T.textDim, marginTop: 4, fontFamily: 'JetBrains Mono, monospace' }}>
                  {r.permissions} permissions · {r.members} members
                </div>
              </div>
              
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function RoleEditScreen({ roleId, go, toast }) {
  const existing = ROLES_LIST.find(r => r.id === roleId);
  const isNew = roleId === 'new';
  const [name, setName] = React.useState(existing ? existing.name : '');
  const defaults = existing ? (ROLE_DEFAULT_PERMS[existing.id] || []) : [];
  const [selected, setSelected] = React.useState(new Set(defaults));

  const toggle = (p) => {
    const next = new Set(selected);
    next.has(p) ? next.delete(p) : next.add(p);
    setSelected(next);
  };
  const totalPerms = PERMISSION_GROUPS.reduce((s, g) => s + g.perms.length, 0);

  return (
    <div style={{ padding: '14px 14px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      
        
      </Field>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        <div style={{ fontSize: 11, color: T.textDim, fontFamily: 'JetBrains Mono, monospace' }}>
          <span style={{ color: T.accent, fontWeight: 600 }}>{selected.size}</span> / {totalPerms}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {PERMISSION_GROUPS.map(g => (
          
            <div style={{ fontSize: 12, fontWeight: 600, color: T.text, marginBottom: 8 }}>{g.name}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {g.perms.map(p => {
                const on = selected.has(p);
                return (
                  <button key={p} onClick={() => toggle(p)} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '5px 9px', borderRadius: 999,
                    background: on ? T.accentSoft : T.surface2,
                    color: on ? T.accent : T.textDim,
                    border: `1px solid ${on ? T.accent : 'transparent'}`,
                    fontSize: 11, fontFamily: 'JetBrains Mono, monospace',
                    cursor: 'pointer', fontWeight: 500,
                  }}>
                    {on ?  : }{p}
                  </button>
                );
              })}
            </div>
          </Card>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
         go('roles')} full>Cancel</Btn>
         { toast(`Role ${isNew ? 'created' : 'updated'}`, 'good'); go('roles'); }} full>
          {isNew ? 'Create role' : 'Save changes'}
        </Btn>
      </div>
    </div>
  );
}

function OrgSummaryScreen() {
  return (
    <div style={{ padding: '14px 14px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      
        
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 32, fontWeight: 700, color: T.text, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '-.02em' }}>
              99.97<span style={{ fontSize: 16, color: T.textDim }}>%</span>
            </div>
            <div style={{ fontSize: 11.5, color: T.textDim, marginTop: 2 }}>30-day uptime</div>
          </div>
          
        </div>
      </Card>

      <div>
        
        
          {[
            { l: 'New hospitals',    v: '+2',    sub: 'Akron General, Fairview',           i: , c: T.accent },
            { l: 'New users',        v: '+47',   sub: '12 clinical, 35 admin',             i: ,    c: '#2DD4BF' },
            { l: 'Devices deployed', v: '+183',  sub: 'iT-V4 (114), iT-IP (52), other 17', i: ,    c: '#22D3EE' },
            { l: 'Vitals events',    v: '4.2B',  sub: '↑ 12% vs last month',               i: ,    c: '#F472B6' },
            { l: 'Audit events',     v: '12,841',sub: '0 high-risk events flagged',        i: ,   c: '#A78BFA' },
          ].map((row, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '14px',
              borderTop: i ? `1px solid ${T.borderSoft}` : 'none',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 9,
                background: `${row.c}22`, color: row.c,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{row.i}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: T.text, fontWeight: 500 }}>{row.l}</div>
                <div style={{ fontSize: 11, color: T.textFaint, marginTop: 2 }}>{row.sub}</div>
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.text, fontFamily: 'JetBrains Mono, monospace' }}>{row.v}</div>
            </div>
          ))}
        </Card>
      </div>

      }>Export PDF summary</Btn>
    </div>
  );
}

Object.assign(window, {
  OrgDashboard, HospitalsScreen, HospitalDetailScreen, CreateHospitalScreen,
  UsersScreen, CreateUserScreen, UserDetailScreen,
  RolesScreen, RoleEditScreen, OrgSummaryScreen,
});
