// Patients, Device Types, Gateway-create, plus a generic Assignments hub.

// ── Drawer ──
function Drawer({ open, onClose, role, items, route, onPick, onLogout }) {
  if (!open) return null;
  const r = window.ROLES[role];
  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, background: 'rgba(0,0,0,.55)',
      zIndex: 50, display: 'flex', backdropFilter: 'blur(2px)',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: 286, height: '100%', background: T.surface2,
        borderRight: `1px solid ${T.border}`,
        display: 'flex', flexDirection: 'column',
        animation: 'drawerIn .22s cubic-bezier(.3,.7,.4,1)',
        overflowY: 'auto',
      }}>
        <div style={{ padding: '18px 18px 14px', borderBottom: `1px solid ${T.borderSoft}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src={window.__resources?.itouchLogo || "assets/itouch-logo.png"} alt="" width={32} height={32} style={{ borderRadius: 8 }}/>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>iTouch Tech Admin</div>
              <div style={{ fontSize: 10.5, color: T.textFaint, fontFamily: 'JetBrains Mono, monospace', marginTop: 1 }}>v3.4.2</div>
            </div>
          </div>
          <div style={{ marginTop: 14, padding: 10, background: r.bg, borderRadius: 10,
            display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: r.color }}/>
            <span style={{ fontSize: 11, color: r.color, fontWeight: 600, letterSpacing: '.04em', fontFamily: 'JetBrains Mono, monospace' }}>{r.short}</span>
            <span style={{ flex: 1 }}/>
            <span style={{ fontSize: 10, color: T.textDim }}>{role === 'PLATFORM_ADMIN' ? 'global' : role.startsWith('ORG') ? 'cleveland-clinic' : 'CLV-MAIN'}</span>
          </div>
        </div>

        <div style={{ padding: '10px 8px', flex: 1 }}>
          {items.map((sect, si) => (
            <div key={si} style={{ marginBottom: 8 }}>
              {sect.label && <div style={{
                fontSize: 10, fontWeight: 600, color: T.textFaint, letterSpacing: '.08em',
                padding: '10px 12px 6px', textTransform: 'uppercase',
              }}>{sect.label}</div>}
              {sect.entries.map(e => {
                const on = e.id === route;
                return (
                  <button key={e.id} onClick={() => { onPick(e.id); onClose(); }} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                    background: on ? T.accentSoft : 'transparent', border: 'none',
                    color: on ? T.accent : T.text, borderRadius: 10, cursor: 'pointer',
                    width: '100%', textAlign: 'left', fontFamily: 'inherit', fontSize: 13.5,
                    fontWeight: on ? 600 : 500, marginBottom: 2,
                  }}>
                    {React.cloneElement(e.icon, { size: 18, stroke: on ? 1.8 : 1.6 })}
                    <span style={{ flex: 1 }}>{e.label}</span>
                    {e.badge && (
                      <span style={{ fontSize: 10.5, padding: '2px 7px', borderRadius: 6,
                        background: T.surface, color: T.textDim,
                        fontFamily: 'JetBrains Mono, monospace' }}>{e.badge}</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div style={{ padding: '8px', borderTop: `1px solid ${T.borderSoft}`, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <button onClick={() => { onPick('settings'); onClose(); }} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
            background: 'transparent', border: 'none', color: T.text,
            borderRadius: 10, cursor: 'pointer', width: '100%', textAlign: 'left',
            fontFamily: 'inherit', fontSize: 13.5, fontWeight: 500,
          }}>
             Settings
          </button>
          <button onClick={() => { onLogout && onLogout(); onClose(); }} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
            background: 'transparent', border: 'none', color: T.bad,
            borderRadius: 10, cursor: 'pointer', width: '100%', textAlign: 'left',
            fontFamily: 'inherit', fontSize: 13.5, fontWeight: 600,
          }}>
             Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Patients ──
function PatientsScreen({ go }) {
  const [q, setQ] = React.useState('');
  const [tab, setTab] = React.useState('ADMITTED');
  let filtered = PATIENTS.filter(p => p.status === tab || tab === 'ALL');
  filtered = filtered.filter(p => (p.mrn + p.name).toLowerCase().includes(q.toLowerCase()));
  return (
    <div style={{ padding: '14px 14px 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      

      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
         setTab('ADMITTED')}>Admitted · {PATIENTS.filter(p=>p.status==='ADMITTED').length}</Chip>
         setTab('AWAITING_BED')}>Awaiting bed · {PATIENTS.filter(p=>p.status==='AWAITING_BED').length}</Chip>
         setTab('DISCHARGED')}>Discharged · {PATIENTS.filter(p=>p.status==='DISCHARGED').length}</Chip>
         setTab('ALL')}>All</Chip>
      </div>

      

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(p => {
          const doctor = USERS.find(u => u.id === p.doctor);
          const nurse  = USERS.find(u => u.id === p.nurse);
          const acuityColor = p.acuity === 'HIGH' ? T.bad : p.acuity === 'MED' ? T.warn : T.good;
          return (
             go('patient-detail', { patientId: p.id })}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: `${acuityColor}22`, color: acuityColor,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, fontWeight: 700, fontSize: 14,
                  fontFamily: 'JetBrains Mono, monospace',
                }}>{p.sex}{p.age}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: T.text, fontFamily: 'JetBrains Mono, monospace' }}>{p.mrn}</div>
                    <span style={{
                      fontSize: 9.5, padding: '2px 6px', borderRadius: 4,
                      background: `${acuityColor}22`, color: acuityColor,
                      fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, letterSpacing: '.05em',
                    }}>{p.acuity}</span>
                  </div>
                  <div style={{ fontSize: 12, color: T.text, marginTop: 4 }}>{p.condition}</div>
                  <div style={{ fontSize: 10.5, color: T.textFaint, fontFamily: 'JetBrains Mono, monospace', marginTop: 4, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {p.bed
                      ? <span> {p.bed}</span>
                      : <span style={{ color: T.warn }}> no bed</span>}
                    {doctor && <span> {doctor.initials}</span>}
                    {nurse && <span> {nurse.initials}</span>}
                    <span>adm {p.admitted}</span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
        {filtered.length === 0 && } title="No patients" hint="Admit a new patient to begin." action={} onClick={() => go('create-patient')}>Admit patient</Btn>}/>}
      </div>
    </div>
  );
}

function PatientDetailScreen({ patientId, go, toast }) {
  const p = PATIENTS.find(x => x.id === patientId) || PATIENTS[0];
  const doctor = USERS.find(u => u.id === p.doctor);
  const nurse  = USERS.find(u => u.id === p.nurse);
  const acuityColor = p.acuity === 'HIGH' ? T.bad : p.acuity === 'MED' ? T.warn : T.good;
  const [confirm, setConfirm] = React.useState(null);
  const device = DEVICES.find(d => d.patient === p.mrn.replace('CLV-', '#'));

  return (
    <div style={{ padding: '14px 14px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: `${acuityColor}22`, color: acuityColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 16, fontFamily: 'JetBrains Mono, monospace',
          }}>{p.sex}{p.age}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.text, fontFamily: 'JetBrains Mono, monospace' }}>{p.mrn}</div>
              <span style={{
                fontSize: 10, padding: '2px 7px', borderRadius: 5,
                background: `${acuityColor}22`, color: acuityColor,
                fontWeight: 600, letterSpacing: '.05em', fontFamily: 'JetBrains Mono, monospace',
              }}>{p.acuity} ACUITY</span>
            </div>
            <div style={{ fontSize: 13, color: T.text, marginTop: 6 }}>{p.condition}</div>
            <div style={{ fontSize: 11, color: T.textDim, fontFamily: 'JetBrains Mono, monospace', marginTop: 4 }}>
              {p.sex} · {p.age}y · adm {p.admitted}
            </div>
          </div>
        </div>
      </Card>

      
      
        {[
          { l: 'Bed',    v: p.bed || 'Unassigned', icon: ,
            cta: { label: p.bed ? 'Reassign' : 'Assign', to: 'assign-patient-bed', payload: { patientId: p.id } },
            mono: true, warn: !p.bed },
          { l: 'Doctor', v: doctor ? doctor.name : 'Unassigned', icon: ,
            cta: { label: doctor ? 'Change' : 'Assign', to: 'assign-doctor-patient', payload: { patientId: p.id } },
            warn: !doctor },
          { l: 'Nurse',  v: nurse ? nurse.name : 'Unassigned', icon: ,
            cta: { label: nurse ? 'Change' : 'Assign', to: 'assign-nurse-shift', payload: { patientId: p.id } },
            warn: !nurse },
          { l: 'Device', v: device ? device.id : 'Unassigned', icon: ,
            cta: { label: device ? 'Change' : 'Assign', to: 'assign-bed-device', payload: { patientId: p.id } },
            mono: true, warn: !device },
        ].map((row, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
            borderTop: i ? `1px solid ${T.borderSoft}` : 'none',
          }}>
            <div style={{ color: T.textDim }}>{row.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, color: T.textDim }}>{row.l}</div>
              <div style={{ fontSize: 13, color: row.warn ? T.warn : T.text, marginTop: 2, fontFamily: row.mono ? 'JetBrains Mono, monospace' : 'inherit', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{row.v}</div>
            </div>
            <button onClick={() => go(row.cta.to, row.cta.payload)} style={{
              fontSize: 11.5, fontWeight: 600, padding: '5px 10px',
              background: T.accentSoft, color: T.accent,
              border: 'none', borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit',
            }}>{row.cta.label}</button>
          </div>
        ))}
      </Card>

      
      <div style={{ display: 'flex', gap: 8 }}>
        }>Edit</Btn>
        }>Discharge</Btn>
      </div>
      } onClick={() => setConfirm(true)}>
        Remove patient record
      </Btn>

       setConfirm(false)}
        onConfirm={() => { setConfirm(false); toast(p.mrn + ' removed', 'good'); go('patients'); }}
        title={`Remove ${p.mrn}?`}
        body="The patient record will be archived. Telemetry history is retained for 7 years per policy."
        confirmLabel="Remove" danger/>
    </div>
  );
}

function CreatePatientScreen({ go, toast }) {
  const [f, setF] = React.useState({ mrn: '', age: '', sex: 'M', condition: '', acuity: 'MED', bed: '' });
  const set = (k, v) => setF({ ...f, [k]: v });
  const valid = f.mrn && /^[A-Z0-9-]{3,16}$/.test(f.mrn) && f.age && f.condition;
  return (
    <div style={{ padding: '14px 14px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      
         set('mrn', v.toUpperCase())} placeholder="CLV-05300" mono/>
      </Field>
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ flex: 1 }}>
          
             set('age', v.replace(/\D/g, ''))} mono placeholder="58"/>
          </Field>
        </div>
        <div style={{ flex: 1.4 }}>
          
             set('sex', v)} options={[
              { value: 'M', label: 'Male' }, { value: 'F', label: 'Female' }, { value: 'X', label: 'Other' },
            ]}/>
          </Field>
        </div>
      </div>
      
         set('condition', v)} placeholder="e.g. Post-CABG recovery"/>
      </Field>
      
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
          {[
            { value: 'LOW', color: T.good },
            { value: 'MED', color: T.warn },
            { value: 'HIGH', color: T.bad },
          ].map(o => {
            const on = f.acuity === o.value;
            return (
              <button key={o.value} onClick={() => set('acuity', o.value)} style={{
                padding: '10px', borderRadius: 10,
                background: on ? `${o.color}22` : T.surface,
                color: on ? o.color : T.text,
                border: `1px solid ${on ? o.color : T.borderSoft}`,
                fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '.05em',
              }}>{o.value}</button>
            );
          })}
        </div>
      </Field>
      
         set('bed', v)} placeholder="Awaiting bed"
          options={BEDS_IN_WARD.filter(b => b.status === 'AVAILABLE').map(b => ({ value: b.id, label: b.label }))}/>
      </Field>

      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
         go('patients')} full>Cancel</Btn>
         { toast('Patient ' + f.mrn + ' admitted', 'good'); go('patients'); }} full>
          Admit patient
        </Btn>
      </div>
    </div>
  );
}

// ── Device Types ──
function DeviceTypesScreen({ go }) {
  return (
    <div style={{ padding: '14px 14px 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      } onClick={() => go('create-device-type')}>New</Btn>
      }/>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {DEVICE_TYPES.map(dt => (
           go('device-type-detail', { typeId: dt.id })}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: dt.category === 'Network' ? 'rgba(167,139,250,.18)' : T.accentSoft,
                color: dt.category === 'Network' ? '#A78BFA' : T.accent,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {dt.category === 'Vitals' ?  :
                 dt.category === 'Infusion' ?  :
                 dt.category === 'Resp.' ?  :
                 dt.category === 'Cardiac' ?  :
                 dt.category === 'Network' ?  :
                 }
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: T.text, flex: 1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{dt.name}</div>
                  
                </div>
                <div style={{ fontSize: 11, color: T.textDim, fontFamily: 'JetBrains Mono, monospace', marginTop: 4 }}>
                  prefix <span style={{ color: T.text }}>{dt.prefix}</span> · {dt.manufacturer}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                  {dt.telemetry.map(t => (
                    <span key={t} style={{
                      fontSize: 10, padding: '2px 6px', borderRadius: 4,
                      background: T.surface2, color: T.textDim,
                      fontFamily: 'JetBrains Mono, monospace',
                    }}>{t}</span>
                  ))}
                  <span style={{ fontSize: 10.5, color: T.textFaint, fontFamily: 'JetBrains Mono, monospace', marginLeft: 'auto' }}>
                    {dt.units} units · fw {dt.firmware}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function DeviceTypeDetailScreen({ typeId, go, toast }) {
  const dt = DEVICE_TYPES.find(x => x.id === typeId) || DEVICE_TYPES[0];
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
            <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>{dt.name}</div>
            <div style={{ fontSize: 11.5, color: T.textDim, fontFamily: 'JetBrains Mono, monospace', marginTop: 4 }}>{dt.prefix}-NNNNN</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              
              <span style={{ fontSize: 10, color: T.textDim, fontFamily: 'JetBrains Mono, monospace', padding: '2px 6px', background: T.surface2, borderRadius: 4, fontWeight: 600, letterSpacing: '.05em' }}>FW {dt.firmware}</span>
            </div>
          </div>
        </div>
      </Card>

      
        {[
          { l: 'Manufacturer', v: dt.manufacturer },
          { l: 'Category',     v: dt.category },
          { l: 'Deployed',     v: dt.units + ' units', mono: true },
          { l: 'ID prefix',    v: dt.prefix, mono: true },
        ].map((row, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', padding: '12px 14px',
            borderTop: i ? `1px solid ${T.borderSoft}` : 'none',
          }}>
            <div style={{ fontSize: 12, color: T.textDim, flex: 1 }}>{row.l}</div>
            <div style={{ fontSize: 13, color: T.text, fontFamily: row.mono ? 'JetBrains Mono, monospace' : 'inherit' }}>{row.v}</div>
          </div>
        ))}
      </Card>

      
      
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {dt.telemetry.map(t => (
            <span key={t} style={{
              fontSize: 11, padding: '5px 10px', borderRadius: 999,
              background: T.accentSoft, color: T.accent,
              fontFamily: 'JetBrains Mono, monospace', fontWeight: 500,
            }}>{t}</span>
          ))}
        </div>
      </Card>

      <div style={{ display: 'flex', gap: 8 }}>
        }>Edit type</Btn>
        }>Push firmware</Btn>
      </div>
      } onClick={() => setConfirm(true)}>
        Delete device type
      </Btn>
       setConfirm(false)}
        onConfirm={() => { setConfirm(false); toast(dt.name + ' deleted', 'good'); go('device-types'); }}
        title={`Delete ${dt.name}?`}
        body={`${dt.units} deployed units will continue running but new units cannot be enrolled with this type.`}
        confirmLabel="Delete" danger/>
    </div>
  );
}

function CreateDeviceTypeScreen({ go, toast }) {
  const [f, setF] = React.useState({ name: '', prefix: '', manufacturer: '', category: 'Vitals', firmware: '', telemetry: [] });
  const set = (k, v) => setF({ ...f, [k]: v });
  const toggleTel = (t) => set('telemetry', f.telemetry.includes(t) ? f.telemetry.filter(x => x !== t) : [...f.telemetry, t]);
  const valid = f.name && /^[A-Za-z0-9-]{2,8}$/.test(f.prefix) && f.manufacturer;
  const allTel = ['HR','SpO₂','BP','Temp','RR','flow','volume','pressure','ECG','rssi','uptime','alarm'];
  return (
    <div style={{ padding: '14px 14px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      
         set('name', v)} placeholder="e.g. Vitals Monitor v5"/>
      </Field>
      
         set('prefix', v.toUpperCase())} placeholder="iT-V5" mono/>
      </Field>
      
         set('manufacturer', v)} placeholder="iTouch Devices"/>
      </Field>
      
         set('category', v)} options={[
          { value: 'Vitals', label: 'Vitals' }, { value: 'Infusion', label: 'Infusion' },
          { value: 'Resp.',  label: 'Respiratory' }, { value: 'Cardiac', label: 'Cardiac' },
          { value: 'Network', label: 'Network' }, { value: 'Other',   label: 'Other' },
        ]}/>
      </Field>
      
         set('firmware', v)} placeholder="1.0.0" mono/>
      </Field>
      
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {allTel.map(t => {
            const on = f.telemetry.includes(t);
            return (
              <button key={t} onClick={() => toggleTel(t)} style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '5px 10px', borderRadius: 999,
                background: on ? T.accentSoft : T.surface2,
                color: on ? T.accent : T.textDim,
                border: `1px solid ${on ? T.accent : 'transparent'}`,
                fontSize: 11, fontFamily: 'JetBrains Mono, monospace',
                cursor: 'pointer', fontWeight: 500,
              }}>{on ?  : }{t}</button>
            );
          })}
        </div>
      </Field>
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
         go('device-types')} full>Cancel</Btn>
         { toast(f.name + ' added type', 'good'); go('device-types'); }} full>
          Create device type
        </Btn>
      </div>
    </div>
  );
}

// ── Gateway create + detail ──
function CreateGatewayScreen({ go, toast }) {
  const [f, setF] = React.useState({ id: '', location: '', ward: 'ICU-3W' });
  const set = (k, v) => setF({ ...f, [k]: v });
  const valid = /^GW-[A-Z0-9]{3,8}-\d{2,4}$/.test(f.id) && f.location;
  return (
    <div style={{ padding: '14px 14px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      
         set('id', v.toUpperCase())} placeholder="GW-CLV-006" mono/>
      </Field>
      
         set('location', v)} leading={} placeholder="ICU 3W · Nurse station"/>
      </Field>
      
         set('ward', v)}
          options={WARDS.map(w => ({ value: w.code, label: w.name }))}/>
      </Field>
      
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(167,139,250,.18)',
            color: '#A78BFA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            </div>
          <div style={{ flex: 1, fontSize: 12, color: T.textDim, lineHeight: 1.45 }}>
            Power on the gateway and place it within 30 ft. Pairing completes automatically.
          </div>
        </div>
      </Card>
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
         go('devices')} full>Cancel</Btn>
         { toast('Gateway ' + f.id + ' enrolled', 'good'); go('devices'); }} full>
          Enroll gateway
        </Btn>
      </div>
    </div>
  );
}

Object.assign(window, {
  Drawer, PatientsScreen, PatientDetailScreen, CreatePatientScreen,
  DeviceTypesScreen, DeviceTypeDetailScreen, CreateDeviceTypeScreen,
  CreateGatewayScreen,
});
