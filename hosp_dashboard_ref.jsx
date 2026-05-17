// HOSP_OWNER / HOSP_ADMIN screens: Dashboard, Wards/Beds, Devices/Gateways, Shifts/Nurses.
// Plus shared Settings screen.

function HospDashboard({ go, role }) {
  return (
    <div style={{ padding: '14px 14px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <div style={{ fontSize: 11, color: T.textDim, letterSpacing: '.08em', fontWeight: 600 }}>FRI, 16 MAY · CLEVELAND MAIN</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: T.text, letterSpacing: '-.01em', marginTop: 2 }}>
          {role === 'HOSP_OWNER' ? 'Good morning, Dr. Bhatt' : 'Good morning, Tomás'}
        </div>
        <div style={{ fontSize: 12.5, color: T.textDim, marginTop: 4 }}>
          <span style={{ color: T.good, fontWeight: 600 }}>4 wards</span> at full staff · 1 device alert
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        }    label="Active users" value="184" delta={1} spark={[170,172,175,178,180,181,182,183,184,184]} sparkColor="#2DD4BF" accent="rgba(45,212,191,.14)"/>
        }      label="Beds in use"  value="111/124" delta={2} spark={[98,102,105,108,110,109,111,112,111,111]} sparkColor={T.accent}/>
        }    label="Devices"      value="642" delta={0} spark={[640,640,641,641,642,642,642,642,642,642]} sparkColor="#22D3EE" accent="rgba(34,211,238,.14)"/>
        } label="On shift"  value="38"  delta={0} spark={[36,36,37,37,38,38,38,38,38,38]} sparkColor="#A78BFA" accent="rgba(167,139,250,.14)"/>
      </div>

      {/* Patient vitals telemetry */}
      
        ● 16 BEDS</span>
        }/>
        <div style={{ display: 'flex', gap: 14, marginTop: 4 }}>
          {[
            { l: 'AVG HR',  v: 78,  u: 'bpm',  c: '#F472B6', ok: true },
            { l: 'AVG SpO\u2082', v: 97, u: '%',    c: '#22D3EE', ok: true },
            { l: 'ALERTS',  v: 1,   u: 'act.', c: T.warn,    ok: false },
          ].map((m, i) => (
            <div key={i} style={{ flex: 1 }}>
              <div style={{ fontSize: 10.5, color: T.textDim, letterSpacing: '.05em' }}>{m.l}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: m.ok ? T.text : T.warn, fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>
                {m.v}<span style={{ fontSize: 10, color: T.textDim, fontWeight: 500, marginLeft: 2 }}>{m.u}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 10, height: 36, display: 'flex', alignItems: 'center' }}>
          
        </div>
      </Card>

      {/* Today's shift */}
      <div>
         go('shifts')} style={{ background:'transparent', border:'none', color:T.accent, fontSize:11.5, fontWeight:600, padding:0, cursor:'pointer' }}>View →</button>
        }/>
        
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { l: 'Day',     t: '07:00 – 15:00', n: 6, c: '#22D3EE' },
              { l: 'Evening', t: '15:00 – 23:00', n: 5, c: '#A78BFA' },
              { l: 'Night',   t: '23:00 – 07:00', n: 4, c: '#60A5FA' },
            ].map((s, i) => (
              <div key={i} style={{ flex: 1, padding: 10, borderRadius: 10,
                background: `${s.c}14`, border: `1px solid ${s.c}40` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.c }}/>
                  <span style={{ fontSize: 10.5, color: s.c, fontWeight: 600, letterSpacing: '.04em' }}>{s.l.toUpperCase()}</span>
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: T.text, fontFamily: 'JetBrains Mono, monospace', marginTop: 6 }}>{s.n}</div>
                <div style={{ fontSize: 10, color: T.textDim, marginTop: 2 }}>nurses</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent device alerts */}
      <div>
        
        
          {DEVICES.filter(d => d.status === 'WARN' || d.status === 'OFFLINE').slice(0, 3).map((d, i) => (
            <div key={d.id} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
              borderTop: i ? `1px solid ${T.borderSoft}` : 'none',
            }}>
              <div style={{ width: 30, height: 30, borderRadius: 8,
                background: d.status === 'OFFLINE' ? T.badSoft : 'rgba(245,158,11,.14)',
                color: d.status === 'OFFLINE' ? T.bad : T.warn,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: T.text, fontFamily: 'JetBrains Mono, monospace' }}>{d.id}</div>
                <div style={{ fontSize: 11, color: T.textFaint, marginTop: 2 }}>
                  {d.type} · {d.ward}-{d.bed} {d.battery < 30 ? `· battery ${d.battery}%` : ''}
                </div>
              </div>
              
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

// Animated SVG pulse wave for the live vitals widget.
function PulseWave({ color = '#F472B6' }) {
  return (
    <svg viewBox="0 0 384 32" width="100%" height="32" preserveAspectRatio="none">
      <defs>
        <linearGradient id="pwFade" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor={color} stopOpacity="0"/>
          <stop offset="15%" stopColor={color} stopOpacity="1"/>
          <stop offset="85%" stopColor={color} stopOpacity="1"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d="M0 16 L40 16 L48 16 L52 8 L56 24 L60 4 L64 28 L68 16 L120 16 L128 16 L132 10 L136 22 L140 16 L200 16 L208 16 L212 6 L216 26 L220 2 L224 30 L228 16 L300 16 L308 16 L312 10 L316 22 L320 16 L384 16"
        fill="none" stroke="url(#pwFade)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function WardsScreen({ go }) {
  return (
    <div style={{ padding: '14px 14px 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      

      

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {WARDS.map(w => {
          const occ = (w.occupied/w.beds)*100;
          return (
             go('ward-detail', { wardId: w.id })}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: 'linear-gradient(135deg, #06B6D4, #22D3EE)',
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 600, color: T.text, flex: 1 }}>{w.name}</div>
                    
                  </div>
                  <div style={{ fontSize: 11.5, color: T.textDim, fontFamily: 'JetBrains Mono, monospace' }}>{w.code}</div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
                    <div style={{ flex: 1, height: 6, background: T.surface2, borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${occ}%`, height: '100%',
                        background: occ > 90 ? T.bad : occ > 75 ? T.warn : T.good }}/>
                    </div>
                    <div style={{ fontSize: 11, color: T.text, fontFamily: 'JetBrains Mono, monospace', minWidth: 50, textAlign: 'right' }}>
                      {w.occupied}/{w.beds}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: T.textDim }}>
                    <span> {w.beds} beds</span>
                    <span> {w.devices} dev</span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function WardDetailScreen({ wardId, go }) {
  const w = WARDS.find(x => x.id === wardId) || WARDS[0];
  return (
    <div style={{ padding: '14px 14px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: T.text }}>{w.name}</div>
            <div style={{ fontSize: 12, color: T.textDim, fontFamily: 'JetBrains Mono, monospace', marginTop: 4 }}>{w.code}</div>
          </div>
          }>Add bed</Btn>
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 14 }}>
          <div>
            <div style={{ fontSize: 10.5, color: T.textDim, letterSpacing: '.05em' }}>OCCUPIED</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: T.text, fontFamily: 'JetBrains Mono, monospace' }}>
              {w.occupied}<span style={{ fontSize: 13, color: T.textDim }}>/{w.beds}</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10.5, color: T.textDim, letterSpacing: '.05em' }}>DEVICES</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: T.text, fontFamily: 'JetBrains Mono, monospace' }}>{w.devices}</div>
          </div>
          <div>
            <div style={{ fontSize: 10.5, color: T.textDim, letterSpacing: '.05em' }}>UTIL.</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: T.good, fontFamily: 'JetBrains Mono, monospace' }}>{Math.round((w.occupied/w.beds)*100)}%</div>
          </div>
        </div>
      </Card>

      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {BEDS_IN_WARD.map(b => (
          
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: b.status === 'OCCUPIED' ? T.accentSoft : b.status === 'AVAILABLE' ? T.goodSoft : 'rgba(245,158,11,.14)',
                color: b.status === 'OCCUPIED' ? T.accent : b.status === 'AVAILABLE' ? T.good : T.warn,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text, fontFamily: 'JetBrains Mono, monospace' }}>{b.label}</div>
                  
                </div>
                {b.patient && <div style={{ fontSize: 11, color: T.textDim, marginTop: 2 }}>{b.patient}</div>}
                {b.device && <div style={{ fontSize: 10.5, color: T.textFaint, fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>{b.device}</div>}
              </div>
              {b.vitals && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace',
                    color: b.vitals.hr > 100 ? T.warn : T.text }}>
                    {b.vitals.hr} <span style={{ fontSize: 9, color: T.textDim }}>bpm</span>
                  </div>
                  <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace',
                    color: b.vitals.spo2 < 95 ? T.warn : T.textDim, marginTop: 2 }}>
                    {b.vitals.spo2}<span style={{ fontSize: 9 }}>%</span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function CreateWardScreen({ go, toast }) {
  const [f, setF] = React.useState({ code: '', name: '', beds: '12' });
  const set = (k, v) => setF({ ...f, [k]: v });
  const valid = f.code && f.name && parseInt(f.beds) > 0;
  return (
    <div style={{ padding: '14px 14px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      
         set('code', v.toUpperCase())} placeholder="ICU-3W" mono/>
      </Field>
      
         set('name', v)} placeholder="ICU — 3 West"/>
      </Field>
      
         set('beds', v.replace(/\D/g, ''))} mono/>
      </Field>
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
         go('wards')} full>Cancel</Btn>
         { toast('Ward ' + f.code + ' created with ' + f.beds + ' beds', 'good'); go('wards'); }} full>
          Create ward
        </Btn>
      </div>
    </div>
  );
}

function DevicesScreen({ go }) {
  const [tab, setTab] = React.useState('devices');
  return (
    <div style={{ padding: '14px 14px 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Tab switcher */}
      <div style={{ display: 'flex', background: T.surface, borderRadius: 12, padding: 4, gap: 4 }}>
        {[
          { id: 'devices',  label: 'Devices',  c: DEVICES.length },
          { id: 'gateways', label: 'Gateways', c: GATEWAYS.length },
        ].map(t => {
          const on = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, padding: '8px 10px', borderRadius: 9, border: 'none',
              background: on ? T.surface2 : 'transparent',
              color: on ? T.text : T.textDim,
              fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6,
            }}>{t.label} <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, opacity: .7 }}>{t.c}</span></button>
          );
        })}
      </div>

      

      {tab === 'devices' && (
        <>
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
            All · {DEVICES.length}</Chip>
            Online · {DEVICES.filter(d=>d.status==='ONLINE').length}</Chip>
            Warn · {DEVICES.filter(d=>d.status==='WARN').length}</Chip>
            Offline · {DEVICES.filter(d=>d.status==='OFFLINE').length}</Chip>
            Low battery</Chip>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {DEVICES.map(d => (
               go('device-detail', { devId: d.id })}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: T.surface2, color: T.accent,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {d.type.includes('Vitals') ?  :
                     d.type.includes('Infusion') ?  :
                     d.type.includes('SpO') ?  :
                     }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: T.text, fontFamily: 'JetBrains Mono, monospace' }}>{d.id}</div>
                      
                    </div>
                    <div style={{ fontSize: 11, color: T.textDim, marginTop: 2 }}>{d.type}</div>
                    <div style={{ fontSize: 10.5, color: T.textFaint, fontFamily: 'JetBrains Mono, monospace', marginTop: 4, display: 'flex', gap: 10 }}>
                      <span>{d.ward}-{d.bed}</span>
                      {d.patient && <span>{d.patient}</span>}
                      <span>fw {d.firmware}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                    = 3 ? T.good : T.warn}/>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10.5, fontFamily: 'JetBrains Mono, monospace',
                      color: d.battery > 30 ? T.textDim : T.warn }}>
                      {d.battery}%
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {tab === 'gateways' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {GATEWAYS.map(g => (
            
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: T.surface2, color: '#A78BFA',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: T.text, fontFamily: 'JetBrains Mono, monospace' }}>{g.id}</div>
                    
                  </div>
                  <div style={{ fontSize: 11, color: T.textDim, marginTop: 2 }}>{g.location}</div>
                  <div style={{ fontSize: 10.5, color: T.textFaint, fontFamily: 'JetBrains Mono, monospace', marginTop: 4, display: 'flex', gap: 10 }}>
                    <span> {g.devices} dev</span>
                    <span> {g.uptime}</span>
                  </div>
                </div>
                = 3 ? T.good : g.signal >= 1 ? T.warn : T.bad}/>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function DeviceDetailScreen({ devId, go, toast }) {
  const d = DEVICES.find(x => x.id === devId) || DEVICES[0];
  const [confirm, setConfirm] = React.useState(false);
  return (
    <div style={{ padding: '14px 14px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: 'linear-gradient(135deg, #3B82F6, #06B6D4)',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: T.text, fontFamily: 'JetBrains Mono, monospace' }}>{d.id}</div>
            <div style={{ fontSize: 12, color: T.textDim, marginTop: 4 }}>{d.type}</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              
              <span style={{ fontSize: 10, color: T.textDim, fontFamily: 'JetBrains Mono, monospace', padding: '2px 6px', background: T.surface2, borderRadius: 4, fontWeight: 600, letterSpacing: '.05em' }}>FW {d.firmware}</span>
            </div>
          </div>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div style={{
          background: T.surface, border: `1px solid ${T.borderSoft}`,
          borderRadius: 12, padding: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: T.textDim, fontSize: 10.5, letterSpacing: '.05em' }}>
            BATTERY
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: d.battery > 30 ? T.text : T.warn, fontFamily: 'JetBrains Mono, monospace', marginTop: 4 }}>
            {d.battery}<span style={{ fontSize: 12, color: T.textDim }}>%</span>
          </div>
          <div style={{ marginTop: 8, height: 4, background: T.surface2, borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ width: `${d.battery}%`, height: '100%', background: d.battery > 30 ? T.good : T.warn }}/>
          </div>
        </div>
        <div style={{
          background: T.surface, border: `1px solid ${T.borderSoft}`,
          borderRadius: 12, padding: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: T.textDim, fontSize: 10.5, letterSpacing: '.05em' }}>
            SIGNAL
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: T.text, fontFamily: 'JetBrains Mono, monospace', marginTop: 4 }}>
            {d.signal}<span style={{ fontSize: 12, color: T.textDim }}>/5</span>
          </div>
          <div style={{ marginTop: 6 }}>
            
          </div>
        </div>
      </div>

      
        {[
          { l: 'Assigned ward', v: d.ward, i:  },
          { l: 'Bed',           v: d.bed, i: , mono: true },
          { l: 'Patient',       v: d.patient || 'Unassigned', i: , mono: !!d.patient },
          { l: 'Last seen',     v: '14 sec ago', i:  },
          { l: 'Gateway',       v: 'GW-CLV-001', i: , mono: true },
        ].map((row, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
            borderTop: i ? `1px solid ${T.borderSoft}` : 'none',
          }}>
            <div style={{ color: T.textDim }}>{row.i}</div>
            <div style={{ fontSize: 12, color: T.textDim, flex: 1 }}>{row.l}</div>
            <div style={{ fontSize: 13, color: T.text, fontFamily: row.mono ? 'JetBrains Mono, monospace' : 'inherit' }}>{row.v}</div>
          </div>
        ))}
      </Card>

      <div style={{ display: 'flex', gap: 8 }}>
        }>Reassign</Btn>
        }>Update firmware</Btn>
      </div>
      } onClick={() => setConfirm(true)}>
        Remove device
      </Btn>
       setConfirm(false)}
        onConfirm={() => { setConfirm(false); toast('Device removed', 'good'); go('devices'); }}
        title={`Remove ${d.id}?`}
        body="Telemetry from this device will stop streaming. Historical data is retained."
        confirmLabel="Remove" danger/>
    </div>
  );
}

function CreateDeviceScreen({ go, toast }) {
  const [f, setF] = React.useState({ id: '', type: 'vitals', ward: 'ICU-3W', bed: '' });
  const set = (k, v) => setF({ ...f, [k]: v });
  const valid = f.id && /^iT-[A-Z0-9]{2,4}-\d{4,6}$/.test(f.id);
  return (
    <div style={{ padding: '14px 14px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      
         set('id', v.toUpperCase())} placeholder="iT-V4-00150" mono error={f.id && !valid}/>
      </Field>
      
         set('type', v)} options={[
          { value: 'vitals', label: 'Vitals Monitor v4' },
          { value: 'pump',   label: 'Infusion Pump v2' },
          { value: 'spo2',   label: 'SpO₂ Sensor' },
          { value: 'vent',   label: 'Ventilator Link' },
        ]}/>
      </Field>
      
         set('ward', v)}
          options={WARDS.map(w => ({ value: w.code, label: w.name }))}/>
      </Field>
      
         set('bed', v)} placeholder="01" mono/>
      </Field>
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
         go('devices')} full>Cancel</Btn>
         { toast('Device ' + f.id + ' enrolled', 'good'); go('devices'); }} full>
          Enroll device
        </Btn>
      </div>
    </div>
  );
}

function ShiftsScreen({ role, go }) {
  const [sel, setSel] = React.useState(2);
  return (
    <div style={{ padding: '14px 14px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
          {SHIFTS.map((d, i) => {
            const on = i === sel;
            return (
              <button key={i} onClick={() => setSel(i)} style={{
                flexShrink: 0, padding: '8px 12px', borderRadius: 10,
                background: on ? T.accentSoft : T.surface,
                border: `1px solid ${on ? T.accent : T.borderSoft}`,
                color: on ? T.accent : T.text, cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                minWidth: 46, fontFamily: 'inherit',
              }}>
                <div style={{ fontSize: 10, fontWeight: 600, opacity: .7, letterSpacing: '.05em' }}>{d.day.toUpperCase()}</div>
                <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>{d.date}</div>
              </button>
            );
          })}
        </div>
      </div>

      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {SHIFTS[sel].shifts.map((s, i) => (
          
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: `${s.color}22`, color: s.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {s.band === 'Day' ?  :
                 s.band === 'Eve' ?  :
                 }
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>
                  {s.band === 'Day' ? 'Day shift' : s.band === 'Eve' ? 'Evening shift' : 'Night shift'}
                </div>
                <div style={{ fontSize: 11.5, color: T.textDim, marginTop: 2, fontFamily: 'JetBrains Mono, monospace' }}>
                  {s.band === 'Day' ? '07:00 – 15:00' : s.band === 'Eve' ? '15:00 – 23:00' : '23:00 – 07:00'}
                </div>
                <div style={{ display: 'flex', marginTop: 8, gap: -8 }}>
                  {Array.from({ length: Math.min(s.nurses, 5) }).map((_, k) => (
                    <div key={k} style={{
                      width: 24, height: 24, borderRadius: 7,
                      background: `linear-gradient(135deg, ${s.color}, ${s.color}aa)`,
                      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 9, fontWeight: 600,
                      marginLeft: k > 0 ? -6 : 0,
                      border: `2px solid ${T.surface}`,
                    }}>{['JK','LM','NP','SW','RT'][k]}</div>
                  ))}
                  {s.nurses > 5 && (
                    <div style={{
                      width: 24, height: 24, borderRadius: 7, background: T.surface2,
                      color: T.textDim, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 9, fontWeight: 600, marginLeft: -6, border: `2px solid ${T.surface}`,
                    }}>+{s.nurses - 5}</div>
                  )}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: T.text, fontFamily: 'JetBrains Mono, monospace' }}>{s.nurses}</div>
                <div style={{ fontSize: 10, color: T.textDim }}>nurses</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      
      
        {USERS.filter(u => u.role === 'NURSE' || u.role === 'DOCTOR').slice(0, 4).map((u, i) => (
          <div key={u.id} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
            borderTop: i ? `1px solid ${T.borderSoft}` : 'none',
          }}>
            
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: T.text }}>{u.name}</div>
              <div style={{ fontSize: 11, color: T.textFaint, fontFamily: 'JetBrains Mono, monospace' }}>ICU-3W · Day shift</div>
            </div>
            
          </div>
        ))}
      </Card>
    </div>
  );
}

function SettingsScreen({ role, onLogout, toast }) {
  const r = window.ROLES[role];
  const [confirm, setConfirm] = React.useState(false);
  return (
    <div style={{ padding: '14px 14px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: T.text }}>Priya Raghunathan</div>
            <div style={{ fontSize: 11, color: T.textFaint, fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>priya.r@clev.health</div>
            <div style={{ marginTop: 6 }}></div>
          </div>
        </div>
      </Card>

      
      
        {[
          { l: 'Change password',   i: , action: () => toast('Password reset email sent', 'good') },
          { l: 'Two-factor auth',   i: , sub: 'Enabled · SMS', action: () => {} },
          { l: 'Session devices',   i: , sub: '3 active', action: () => {} },
          { l: 'Notifications',     i: , action: () => {} },
        ].map((row, i) => (
          <button key={i} onClick={row.action} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '14px',
            borderTop: i ? `1px solid ${T.borderSoft}` : 'none',
            background: 'transparent', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left',
            fontFamily: 'inherit',
          }}>
            <div style={{ color: T.accent }}>{row.i}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, color: T.text }}>{row.l}</div>
              {row.sub && <div style={{ fontSize: 11, color: T.textFaint, marginTop: 2 }}>{row.sub}</div>}
            </div>
            
          </button>
        ))}
      </Card>

      
      
        {[
          { l: 'Theme', sub: 'Dark', i:  },
          { l: 'Language', sub: 'English (US)', i:  },
        ].map((row, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '14px',
            borderTop: i ? `1px solid ${T.borderSoft}` : 'none',
          }}>
            <div style={{ color: T.accent }}>{row.i}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, color: T.text }}>{row.l}</div>
            </div>
            <div style={{ fontSize: 12, color: T.textDim }}>{row.sub}</div>
            
          </div>
        ))}
      </Card>

      } onClick={() => setConfirm(true)}>
        Log out
      </Btn>

      <div style={{ textAlign: 'center', fontSize: 11, color: T.textFaint, fontFamily: 'JetBrains Mono, monospace', marginTop: 8 }}>
        iTouch Admin · v3.4.2 · build 28491<br/>
        © 2026 iOrbit Technologies
      </div>

       setConfirm(false)}
        onConfirm={() => { setConfirm(false); onLogout(); }}
        title="Log out?" body="JWT and refresh tokens will be cleared from this device."
        confirmLabel="Log out" danger/>
    </div>
  );
}

Object.assign(window, {
  HospDashboard, PulseWave, WardsScreen, WardDetailScreen, CreateWardScreen,
  DevicesScreen, DeviceDetailScreen, CreateDeviceScreen, ShiftsScreen, SettingsScreen,
});
