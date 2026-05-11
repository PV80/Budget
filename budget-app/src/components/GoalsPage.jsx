import { useState, useMemo } from 'react'
import { EXPENSE_CATEGORIES, getCategoryMeta, fmt } from './categories'

const now = new Date()
const currentMonth = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`

function GoalForm({ onSave, onClose, initial }) {
  const [category, setCategory] = useState(initial?.category || 'food')
  const [limit, setLimit] = useState(initial ? String(initial.limit) : '')

  function submit(e) {
    e.preventDefault()
    const l = parseFloat(limit)
    if (!l || l <= 0) return
    onSave({ category, limit: l })
  }

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-sheet">
        <div className="sheet-handle" />
        <div className="sheet-title">{initial ? 'Edit Goal' : 'Add Budget Goal'}</div>
        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Category</label>
            <div className="cat-grid">
              {EXPENSE_CATEGORIES.map(c => (
                <button key={c.value} type="button"
                  className={`cat-pick-btn ${category===c.value?'active':''}`}
                  onClick={()=>setCategory(c.value)}
                  style={category===c.value ? { borderColor: c.color, background: c.color+'22', color: c.color } : {}}
                >
                  <span className="ci">{c.icon}</span>
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Monthly Limit</label>
            <div className="amount-wrap">
              <span className="amt-prefix">$</span>
              <input className="form-input" type="number" min="1" step="1"
                placeholder="0" value={limit} onChange={e=>setLimit(e.target.value)} required autoFocus />
            </div>
          </div>
          <button type="submit" className="submit-btn">
            {initial ? '✓ Save Changes' : '+ Add Goal'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function GoalsPage({ goals, transactions, onAdd, onUpdate, onDelete }) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing]   = useState(null)

  const spending = useMemo(() => {
    const map = {}
    transactions
      .filter(t=>t.type==='expense'&&t.date.startsWith(currentMonth))
      .forEach(t=>{ map[t.category]=(map[t.category]||0)+t.amount })
    return map
  }, [transactions])

  function handleSave(data) {
    if (editing) { onUpdate(editing.id, data); setEditing(null) }
    else onAdd(data)
    setShowForm(false)
  }

  function openEdit(g) { setEditing(g); setShowForm(true) }
  function closeForm()  { setShowForm(false); setEditing(null) }

  const totalSpent  = goals.reduce((s,g) => s + (spending[g.category]||0), 0)
  const totalBudget = goals.reduce((s,g) => s + g.limit, 0)

  return (
    <div className="screen">
      <div className="goals-header-bar">
        <h1>Budget Goals</h1>
        <p>Monthly spending limits by category</p>
        {totalBudget > 0 && (
          <div style={{ display:'flex', gap:16, marginTop:12 }}>
            <div style={{ color:'rgba(255,255,255,0.75)', fontSize:13 }}>
              <span style={{ color:'#fff', fontWeight:700 }}>{fmt(totalSpent)}</span> spent
            </div>
            <div style={{ color:'rgba(255,255,255,0.75)', fontSize:13 }}>
              of <span style={{ color:'#fff', fontWeight:700 }}>{fmt(totalBudget)}</span> budget
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: 16 }}>
        {goals.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">🎯</div>
            <p>No goals yet.<br/>Set limits to track your spending.</p>
          </div>
        ) : (
          goals.map(goal => {
            const meta  = getCategoryMeta(goal.category, 'expense')
            const spent = spending[goal.category] || 0
            const pct   = Math.min((spent / goal.limit) * 100, 100)
            const status= pct >= 100 ? 'danger' : pct >= 75 ? 'warning' : 'safe'
            const left  = goal.limit - spent

            return (
              <div key={goal.id} className="goal-card">
                <div className="goal-card-header">
                  <div className="goal-card-title">
                    <div className="goal-card-icon" style={{ background: meta.color+'22' }}>{meta.icon}</div>
                    {meta.label}
                  </div>
                  <div className="goal-card-actions">
                    <button className="icon-btn" onClick={()=>openEdit(goal)}>✏️</button>
                    <button className="icon-btn" onClick={()=>onDelete(goal.id)}>🗑️</button>
                  </div>
                </div>

                <div className="goal-amounts-row">
                  <div>
                    <div className="goal-spent-big">{fmt(spent)}</div>
                    <div className="goal-limit-sm">of {fmt(goal.limit)}</div>
                  </div>
                  <div style={{ fontSize:22, fontWeight:800, color: status==='danger'?'var(--red)':status==='warning'?'var(--yellow)':'var(--green)' }}>
                    {Math.round(pct)}%
                  </div>
                </div>

                <div className="progress-bg">
                  <div className={`progress-fill ${status}`} style={{ width:`${pct}%` }} />
                </div>

                <div className="goal-footer">
                  <span>This month</span>
                  <span className={status}>
                    {status==='danger'
                      ? `⚠️ Over by ${fmt(-left)}`
                      : status==='warning'
                      ? `⚡ ${fmt(left)} left`
                      : `✅ ${fmt(left)} remaining`}
                  </span>
                </div>
              </div>
            )
          })
        )}

        <button className="add-goal-btn" onClick={()=>setShowForm(true)}>
          <span style={{ fontSize:18 }}>+</span> Add Budget Goal
        </button>
      </div>

      {showForm && <GoalForm onSave={handleSave} onClose={closeForm} initial={editing} />}
    </div>
  )
}
