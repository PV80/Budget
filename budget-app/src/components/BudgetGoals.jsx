import { useState, useMemo } from 'react'
import { EXPENSE_CATEGORIES, getCategoryMeta, fmt } from './categories'

const now = new Date()

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
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>{initial ? 'Edit Budget Goal' : 'Add Budget Goal'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={submit}>
          <div className="form-group">
            <label>Category</label>
            <select className="form-control" value={category} onChange={e => setCategory(e.target.value)}>
              {EXPENSE_CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Monthly Limit</label>
            <input
              className="form-control"
              type="number"
              min="1"
              step="1"
              placeholder="e.g. 500"
              value={limit}
              onChange={e => setLimit(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              {initial ? '✓ Save' : '+ Add Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function BudgetGoals({ goals, transactions, onAdd, onUpdate, onDelete }) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)

  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const monthlySpending = useMemo(() => {
    const map = {}
    transactions
      .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth))
      .forEach(t => { map[t.category] = (map[t.category] || 0) + t.amount })
    return map
  }, [transactions, currentMonth])

  function handleSave(data) {
    if (editing) { onUpdate(editing.id, data); setEditing(null) }
    else onAdd(data)
    setShowForm(false)
  }

  function openEdit(goal) { setEditing(goal); setShowForm(true) }
  function closeForm() { setShowForm(false); setEditing(null) }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Budget Goals</h1>
          <p>Monthly spending limits per category</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Add Goal</button>
      </div>

      <div className="goals-grid">
        {goals.map(goal => {
          const meta = getCategoryMeta(goal.category, 'expense')
          const spent = monthlySpending[goal.category] || 0
          const pct = Math.min((spent / goal.limit) * 100, 100)
          const status = pct >= 100 ? 'danger' : pct >= 75 ? 'warning' : 'safe'
          const remaining = goal.limit - spent

          return (
            <div key={goal.id} className="goal-card">
              <div className="goal-header">
                <div className="goal-title">
                  <span>{meta.icon}</span>
                  <span>{meta.label}</span>
                </div>
                <div className="goal-actions">
                  <button className="btn-icon edit" onClick={() => openEdit(goal)} title="Edit">✏️</button>
                  <button className="btn-icon del"  onClick={() => onDelete(goal.id)} title="Delete">🗑️</button>
                </div>
              </div>

              <div className="goal-amounts">
                <span className="goal-spent">{fmt(spent)}</span>
                <span className="goal-limit">of {fmt(goal.limit)}</span>
              </div>

              <div className="progress-bar-bg">
                <div className={`progress-bar-fill ${status}`} style={{ width: `${pct}%` }} />
              </div>

              <div className={`goal-status ${status}`}>
                {status === 'danger'
                  ? `⚠️ Over budget by ${fmt(spent - goal.limit)}`
                  : status === 'warning'
                  ? `⚡ ${fmt(remaining)} left (${Math.round(pct)}% used)`
                  : `✓ ${fmt(remaining)} remaining`}
              </div>
            </div>
          )
        })}

        <button className="add-goal-card" onClick={() => setShowForm(true)}>
          <span style={{ fontSize: 20 }}>+</span>
          <span>Add a budget goal</span>
        </button>
      </div>

      {goals.length === 0 && (
        <div className="empty-state" style={{ marginTop: 24 }}>
          <div className="empty-icon">🎯</div>
          <p>No goals yet. Set spending limits to stay on track!</p>
        </div>
      )}

      {showForm && (
        <GoalForm
          onSave={handleSave}
          onClose={closeForm}
          initial={editing}
        />
      )}
    </div>
  )
}
