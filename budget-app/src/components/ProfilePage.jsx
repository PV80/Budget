import { useState } from 'react'
import { fmt } from './categories'

export default function ProfilePage({ userName, onNameChange, totals }) {
  const [editing, setEditing] = useState(false)
  const [draft,   setDraft]   = useState(userName)

  function save() {
    if (draft.trim()) { onNameChange(draft.trim()); setEditing(false) }
  }

  const rows = [
    { icon:'📊', bg:'#e8f4ff', title:'Total Income',   sub: fmt(totals.income),  arrow:false },
    { icon:'💸', bg:'#fff0f0', title:'Total Expenses',  sub: fmt(totals.expense), arrow:false },
    { icon:'💰', bg:'#f0fff9', title:'Net Balance',     sub: fmt(totals.balance), arrow:false },
  ]

  return (
    <div className="screen">
      <div className="profile-header">
        <div className="profile-avatar">👤</div>
        <div className="profile-name">{userName}</div>
        <div className="profile-sub">Personal Finance</div>
        {!editing
          ? <button className="edit-name-btn" onClick={()=>{ setDraft(userName); setEditing(true) }}>Edit name</button>
          : (
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <input
                value={draft}
                onChange={e=>setDraft(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&save()}
                style={{ padding:'6px 12px', borderRadius:20, border:'1.5px solid rgba(255,255,255,0.5)', background:'rgba(255,255,255,0.15)', color:'#fff', fontSize:14, outline:'none', width:140 }}
                autoFocus
              />
              <button onClick={save} style={{ background:'rgba(255,255,255,0.2)', border:'none', color:'#fff', padding:'6px 12px', borderRadius:20, cursor:'pointer', fontSize:13, fontWeight:600 }}>Save</button>
              <button onClick={()=>setEditing(false)} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.6)', padding:'6px', cursor:'pointer', fontSize:18 }}>✕</button>
            </div>
          )
        }
      </div>

      <div className="profile-card">
        {rows.map(r => (
          <div key={r.title} className="profile-row" style={{ cursor: r.arrow?'pointer':'default' }}>
            <div className="profile-row-icon" style={{ background: r.bg }}>{r.icon}</div>
            <div className="profile-row-text">
              <div className="profile-row-title">{r.title}</div>
              <div className="profile-row-sub">{r.sub}</div>
            </div>
            {r.arrow && <span className="profile-row-arrow">›</span>}
          </div>
        ))}
      </div>

      <div className="profile-card">
        <div className="profile-row">
          <div className="profile-row-icon" style={{ background:'#f3eeff' }}>🎨</div>
          <div className="profile-row-text">
            <div className="profile-row-title">About</div>
            <div className="profile-row-sub">BudgetApp v1.0 — Personal Finance</div>
          </div>
        </div>
      </div>
    </div>
  )
}
