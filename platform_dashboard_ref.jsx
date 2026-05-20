// PLATFORM_ADMIN screens: Dashboard, Organisations list, Org Detail, Create Org Owner.

function PlatformDashboard({ go }) {
  return (
    <div style={{ padding: '14px 14px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Greeting */}
      <div>
        <div style={{ fontSize: 11, color: T.textDim, letterSpacing: '.08em', fontWeight: 600 }}>FRI, 16 MAY</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: T.text, letterSpacing: '-.01em', marginTop: 2 }}>
          Good morning, Marcus
        </div>
        <div style={{ fontSize: 12.5, color: T.textDim, marginTop: 4 }}>
          Platform health is <span style={{ color: T.good, fontWeight: 600 }}>nominal</span> · 0 incidents
        </div>
      </div>

      {/* Stat grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        }    label="Organisations" value="57"    delta={4}  spark={SPARKS.orgs}      sparkColor="#A78BFA" accent="rgba(167,139,250,.14)"/>
        } label="Hospitals"     value="231"   delta={5}  spark={SPARKS.hospitals} sparkColor="#3B82F6"/>
        }    label="Users"         value="4,118" delta={3}  spark={SPARKS.users}     sparkColor="#2DD4BF" accent="rgba(45,212,191,.14)"/>
        }    label="Active devices" value="5,031" delta={1}  spark={SPARKS.active}   sparkColor="#22D3EE" accent="rgba(34,211,238,.14)"/>
      </div>

      </Card>

      {/* Quick actions */}
      <div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
           go('orgs')} padding={12}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: 'rgba(167,139,250,.14)',
                color: '#A78BFA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: T.text }}>Organisations</div>
              <div style={{ fontSize: 11.5, color: T.textDim }}>Browse, search, audit</div>
            </div>
          </Card>
           go('create-org')} padding={12}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: T.accentSoft,
                color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: T.text }}>New Organisation</div>
              <div style={{ fontSize: 11.5, color: T.textDim }}>Onboard a tenant</div>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent activity */}
      <div>
        
        
          {[
            { icon: , color: T.good,   text: 'Cleveland Clinic onboarded',          time: '2h ago', meta: 'cleveland-clinic' },
            { icon: , color: T.accent, text: 'Akron General hospital created',     time: '4h ago', meta: 'CLV-AKR' },
            { icon: , color: T.warn,  text: 'Gateway GW-CLV-005 flagged offline', time: '8h ago', meta: '12d uptime lost' },
            { icon: ,  color: '#A78BFA', text: 'Org owner created for Aurora Health', time: '1d ago', meta: 'p.raghunathan' },
          ].map((a, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
              borderTop: i ? `1px solid ${T.borderSoft}` : 'none',
            }}>
              <div style={{
                width: 26, height: 26, borderRadius: 8, background: `${a.color}22`,
                color: a.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>{a.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: T.text, fontWeight: 500 }}>{a.text}</div>
                <div style={{ fontSize: 11, color: T.textFaint, fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>{a.meta}</div>
              </div>
              <div style={{ fontSize: 11, color: T.textFaint, fontFamily: 'JetBrains Mono, monospace' }}>{a.time}</div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

function OrganisationsScreen({ go }) {
  const [q, setQ] = React.useState('');
  const filtered = ORGS.filter(o => o.display.toLowerCase().includes(q.toLowerCase()));
  return (
    <div style={{ padding: '14px 14px 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      } style={{ width: 28, height: 28, color: T.textDim }}/>}/>
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
        All · {ORGS.length}</Chip>
        Active · {ORGS.filter(o=>o.status==='ACTIVE').length}</Chip>
        Pending · {ORGS.filter(o=>o.status==='PENDING').length}</Chip>
        Health Systems</Chip>
      </div>

      

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(o => (
           go('org-detail', { orgId: o.id })} padding={14}>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: `linear-gradient(135deg, ${T.accent}, #6366F1)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: 16, letterSpacing: '-.01em',
                flexShrink: 0,
              }}>{o.display.split(/[\s'.]/).filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase()}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: T.text, flex: 1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{o.display}</div>
                  
                </div>
                <div style={{ fontSize: 11.5, color: T.textDim, fontFamily: 'JetBrains Mono, monospace' }}>{o.name}</div>
                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  {[
                    { i: , v: o.hospitals, l: 'hosp' },
                    { i: ,    v: o.users,     l: 'users' },
                    { i: ,    v: o.devices,   l: 'devices' },
                  ].map((m, k) => (
                    <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 4, color: T.textDim, fontSize: 11.5, fontFamily: 'JetBrains Mono, monospace' }}>
                      {m.i}<span style={{ color: T.text, fontWeight: 600 }}>{m.v.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function OrgDetailScreen({ orgId, go }) {
  const org = ORGS.find(o => o.id === orgId) || ORGS[0];
  return (
    <div style={{ padding: '14px 14px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: `linear-gradient(135deg, ${T.accent}, #6366F1)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 20,
          }}>{org.display.split(/[\s'.]/).filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase()}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: T.text }}>{org.display}</div>
              
            </div>
            <div style={{ fontSize: 11.5, color: T.textDim, fontFamily: 'JetBrains Mono, monospace', marginTop: 4 }}>{org.name}</div>
            <div style={{ fontSize: 12, color: T.textDim, marginTop: 6 }}>{org.type} · {org.locale}</div>
          </div>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {[
          { l: 'Hospitals', v: org.hospitals, c: T.accent },
          { l: 'Users',     v: org.users.toLocaleString(), c: '#2DD4BF' },
          { l: 'Devices',   v: org.devices.toLocaleString(), c: '#22D3EE' },
        ].map((s, i) => (
          <div key={i} style={{
            background: T.surface, border: `1px solid ${T.borderSoft}`,
            borderRadius: 12, padding: '12px 10px',
          }}>
            <div style={{ fontSize: 10.5, color: T.textDim, letterSpacing: '.05em' }}>{s.l.toUpperCase()}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: T.text, marginTop: 4, fontFamily: 'JetBrains Mono, monospace' }}>{s.v}</div>
          </div>
        ))}
      </div>

      <div>
        
        
          {USERS.filter(u => u.role === 'ORG_OWNER').concat(USERS.filter(u => u.role === 'ORG_ADMIN')).slice(0, 3).map((u, i) => (
            <div key={u.id} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
              borderTop: i ? `1px solid ${T.borderSoft}` : 'none',
            }}>
              
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 500, color: T.text }}>{u.name}</div>
                <div style={{ fontSize: 11, color: T.textFaint, fontFamily: 'JetBrains Mono, monospace' }}>{u.email}</div>
              </div>
              
            </div>
          ))}
        </Card>
      </div>

      <div>
        
        
          {HOSPITALS.slice(0, 4).map((h, i) => (
            <div key={h.id} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
              borderTop: i ? `1px solid ${T.borderSoft}` : 'none',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 9,
                background: T.surface2, color: T.accent,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: T.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{h.name}</div>
                <div style={{ fontSize: 11, color: T.textFaint, fontFamily: 'JetBrains Mono, monospace' }}>{h.code} · {h.beds} beds</div>
              </div>
              
            </div>
          ))}
        </Card>
      </div>

      } onClick={() => go('create-org-owner', { orgId })}>
        Create Org Owner for this organisation
      </Btn>
    </div>
  );
}

function CreateOrgScreen({ go, toast }) {
  const [f, setF] = React.useState({
    orgName: '', orgType: '', businessName: '', contact: '', email: '',
    address: '', locale: 'en-US',
  });
  const set = (k, v) => setF({ ...f, [k]: v });
  const valid = f.orgName && /^[a-z0-9-]{1,16}$/.test(f.orgName) && f.businessName;

  return (
    <div style={{ padding: '14px 14px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{
        padding: 14, background: T.accentSoft, borderRadius: 12,
        display: 'flex', gap: 10, alignItems: 'flex-start',
      }}>
        
        <div style={{ fontSize: 12.5, color: T.text, lineHeight: 1.5 }}>
          Onboarding a new tenant. An Org Owner can be invited in the next step once the organisation is provisioned.
        </div>
      </div>

      
      
         set('orgName', v)} placeholder="e.g. cleveland-clinic" mono/>
      </Field>
      
         set('businessName', v)} placeholder="e.g. Cleveland Clinic Foundation"/>
      </Field>
      
         set('orgType', v)} placeholder="Select type…"
          options={[
            { value: 'health-system', label: 'Health System' },
            { value: 'hospital-group', label: 'Hospital Group' },
            { value: 'regional', label: 'Regional Provider' },
            { value: 'research', label: 'Research / Academic' },
          ]}/>
      </Field>

      
      
         set('contact', v)} placeholder="Full name" leading={}/>
      </Field>
      
         set('email', v)} placeholder="contact@hospital.org" leading={}/>
      </Field>
      
         set('address', v)} placeholder="Street, city, state" leading={}/>
      </Field>
      
         set('locale', v)}
          options={[
            { value: 'en-US', label: 'English (US)' },
            { value: 'en-CA', label: 'English (Canada)' },
            { value: 'en-GB', label: 'English (UK)' },
            { value: 'ja-JP', label: 'Japanese' },
            { value: 'es-MX', label: 'Spanish (MX)' },
          ]}/>
      </Field>

      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
         go('orgs')} full>Cancel</Btn>
         { toast('Organisation created · ' + (f.orgName || 'new-org'), 'good'); go('orgs'); }} full>
          Create organisation
        </Btn>
      </div>
    </div>
  );
}

function CreateOrgOwnerScreen({ go, toast, presetOrgId }) {
  const [f, setF] = React.useState({
    org: presetOrgId || 'cleveland', username: '', email: '', name: '', phone: '',
  });
  const set = (k, v) => setF({ ...f, [k]: v });
  const validUser = /^[a-zA-Z0-9]+$/.test(f.username);
  const valid = f.username && validUser && f.name;

  return (
    <div style={{ padding: '14px 14px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12,
        background: 'rgba(129,140,248,.1)', borderRadius: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(129,140,248,.2)',
          color: '#818CF8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Org Owner</div>
          <div style={{ fontSize: 11, color: T.textDim }}>Full control over one organisation</div>
        </div>
      </div>

      
         set('org', v)}
          options={ORGS.map(o => ({ value: o.id, label: o.display }))}/>
      </Field>
      
         set('name', v)} placeholder="Dr. Anika Bhatt"/>
      </Field>
      
         set('username', v)} placeholder="a.bhatt" mono/>
      </Field>
      
         set('email', v)} placeholder="a.bhatt@hospital.org" leading={}/>
      </Field>
      
         set('phone', v)} placeholder="+1 555 0100" leading={}/>
      </Field>

      <div style={{
        padding: 12, background: T.surface, borderRadius: 12, border: `1px dashed ${T.border}`,
        fontSize: 11.5, color: T.textDim, lineHeight: 1.5,
      }}>
        A one-time invitation link will be emailed. The Org Owner sets their own password on first sign-in.
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
         go('orgs')} full>Cancel</Btn>
         { toast('Invitation sent to ' + (f.email || f.username), 'good'); go('orgs'); }} full>
          Send invitation
        </Btn>
      </div>
    </div>
  );
}

Object.assign(window, {
  PlatformDashboard, OrganisationsScreen, OrgDetailScreen,
  CreateOrgScreen, CreateOrgOwnerScreen,
});
