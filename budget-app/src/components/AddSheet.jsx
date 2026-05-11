import { useState, useEffect } from 'react'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from './categories'

const today = () => new Date().toISOString().slice(0,10)

export default function AddSheet({ onSave, onClose, initial, defaultType }) {
  const [type,     setType]     = useState(initial?.type     || defaultType || 'expense')
  const [amount,   setAmount]   = useState(initial           ? String(initial.amount) : '')
  const [category, setCategory] = useState(initial?.category || (defaultType==='income' ? 'salary' : 'food'))
  const [date,     setDate]     = useState(initial?.date     || today())
  const [note,     setNote]     = useState(initial?.note     || '')

  useEffect(() => {
    if (initial) {
      setType(initial.type); setAmount(String(initial.amount))
      setCategory(initial.category); setDate(initial.date); setNote(initial.note||'')
    } else {
      setType(defaultType||'expense'); setAmount('')
      setCategory(defaultType==='income'?'salary':'food')
      setDate(today()); setNote('')
    }
  }, [initial, defaultType])

  const cats = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  function switchType(t) {
    setType(t)
    setCategory(t==='income' ? 'salary' : 'food')
  }

  function submit(e) {
    e.preventDefault()
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) return
    onSave({ type, amount: amt, category, date, note })
  }

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-sheet">
        <div className="sheet-handle" />
        <div className="sheet-title">{initial ? 'Edit Transaction' : 'Add Transaction'}</div>

        <form onSubmit={submit}>
          {/* Type toggle */}
          <div className="form-group">
            <div className="type-toggle">
              <button type="button" className={`type-btn expense ${type==='expense'?'active':''}`} onClick={()=>switchType('expense')}>
                💸 Expense
              </button>
              <button type="button" className={`type-btn income  ${type==='income' ?'active':''}`} onClick={()=>switchType('income')}>
                💰 Income
              </button>
            </div>
          </div>

          {/* Amount */}
          <div className="form-group">
            <label className="form-label">Amount</label>
            <div className="amount-wrap">
              <span className="amt-prefix">$</span>
              <input className="form-input" type="number" min="0.01" step="0.01"
                placeholder="0.00" value={amount}
                onChange={e=>setAmount(e.target.value)} required autoFocus />
            </div>
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="form-label">Category</label>
            <div className="cat-grid">
              {cats.map(c => (
                <button key={c.value} type="button"
                  className={`cat-pick-btn ${category===c.value?'active':''}`}
                  onClick={()=>setCategory(c.value)}
                  style={category===c.value ? { borderColor:c.color, background:c.color+'22', color:c.color } : {}}
                >
                  <span className="ci">{c.icon}</span>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div className="form-group">
            <label className="form-label">Date</label>
            <input className="form-input" type="date" value={date}
              onChange={e=>setDate(e.target.value)} required />
          </div>

          {/* Note */}
          <div className="form-group">
            <label className="form-label">Note <span style={{color:'var(--muted)',fontWeight:400,textTransform:'none'}}>(optional)</span></label>
            <input className="form-input" type="text" placeholder="e.g. Grocery run, Netflix…"
              value={note} onChange={e=>setNote(e.target.value)} maxLength={80} />
          </div>

          <button type="submit" className="submit-btn">
            {initial ? '✓ Save Changes' : `+ Add ${type==='income'?'Income':'Expense'}`}
          </button>
        </form>
      </div>
    </div>
  )
}
