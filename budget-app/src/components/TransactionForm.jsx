import { useState, useEffect } from 'react'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from './categories'

const today = () => new Date().toISOString().slice(0, 10)

const empty = { type: 'expense', amount: '', category: 'food', date: today(), note: '' }

export default function TransactionForm({ onSave, onClose, initial }) {
  const [form, setForm] = useState(initial ? { ...initial, amount: String(initial.amount) } : empty)

  useEffect(() => {
    if (initial) setForm({ ...initial, amount: String(initial.amount) })
    else setForm({ ...empty, date: today() })
  }, [initial])

  const cats = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  function set(field, val) {
    setForm(prev => {
      const next = { ...prev, [field]: val }
      if (field === 'type') {
        next.category = val === 'income' ? 'salary' : 'food'
      }
      return next
    })
  }

  function submit(e) {
    e.preventDefault()
    const amount = parseFloat(form.amount)
    if (!amount || amount <= 0) return
    onSave({ ...form, amount })
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>{initial ? 'Edit Transaction' : 'Add Transaction'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={submit}>
          <div className="form-group">
            <label>Type</label>
            <div className="type-toggle">
              <button type="button"
                className={`type-btn expense ${form.type === 'expense' ? 'active' : ''}`}
                onClick={() => set('type', 'expense')}>
                💸 Expense
              </button>
              <button type="button"
                className={`type-btn income ${form.type === 'income' ? 'active' : ''}`}
                onClick={() => set('type', 'income')}>
                💰 Income
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Amount</label>
            <input
              className="form-control"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={form.amount}
              onChange={e => set('amount', e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select className="form-control" value={form.category} onChange={e => set('category', e.target.value)}>
              {cats.map(c => (
                <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Date</label>
            <input
              className="form-control"
              type="date"
              value={form.date}
              onChange={e => set('date', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Note <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optional)</span></label>
            <input
              className="form-control"
              type="text"
              placeholder="e.g. Grocery run, Netflix subscription…"
              value={form.note}
              onChange={e => set('note', e.target.value)}
              maxLength={80}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              {initial ? '✓ Save changes' : '+ Add transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
