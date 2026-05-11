import { useState, useMemo } from 'react'
import { getCategoryMeta, fmt, fmtDate, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from './categories'
import { TxRow } from './Dashboard'

const ALL_CATS = [
  ...EXPENSE_CATEGORIES.map(c => ({ ...c, type: 'expense' })),
  ...INCOME_CATEGORIES.map(c => ({ ...c, type: 'income', value: `income_${c.value}` })),
]

export default function Transactions({ transactions, onAdd, onEdit, onDelete }) {
  const [typeFilter, setTypeFilter] = useState('all')
  const [catFilter, setCatFilter]   = useState('all')
  const [monthFilter, setMonthFilter] = useState('')
  const [search, setSearch]         = useState('')
  const [sort, setSort]             = useState('date_desc')

  const filtered = useMemo(() => {
    let list = [...transactions]

    if (typeFilter !== 'all') list = list.filter(t => t.type === typeFilter)
    if (catFilter  !== 'all') list = list.filter(t => t.category === catFilter)
    if (monthFilter) list = list.filter(t => t.date.startsWith(monthFilter))
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(t =>
        t.note?.toLowerCase().includes(q) ||
        getCategoryMeta(t.category, t.type).label.toLowerCase().includes(q)
      )
    }

    if (sort === 'date_desc') list.sort((a, b) => b.date.localeCompare(a.date))
    if (sort === 'date_asc')  list.sort((a, b) => a.date.localeCompare(b.date))
    if (sort === 'amount_desc') list.sort((a, b) => b.amount - a.amount)
    if (sort === 'amount_asc')  list.sort((a, b) => a.amount - b.amount)

    return list
  }, [transactions, typeFilter, catFilter, monthFilter, search, sort])

  const totals = useMemo(() => ({
    income:  filtered.filter(t => t.type === 'income').reduce((s,t)=>s+t.amount, 0),
    expense: filtered.filter(t => t.type === 'expense').reduce((s,t)=>s+t.amount, 0),
  }), [filtered])

  function clearFilters() {
    setTypeFilter('all'); setCatFilter('all'); setMonthFilter(''); setSearch('')
  }

  const hasFilters = typeFilter !== 'all' || catFilter !== 'all' || monthFilter || search

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Transactions</h1>
          <p>{filtered.length} transaction{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={onAdd}>+ Add Transaction</button>
      </div>

      <div className="filters">
        <input
          className="filter-input"
          type="text"
          placeholder="🔍 Search…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="filter-select" value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setCatFilter('all') }}>
          <option value="all">All types</option>
          <option value="expense">Expenses</option>
          <option value="income">Income</option>
        </select>
        <select className="filter-select" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          <option value="all">All categories</option>
          {(typeFilter === 'income' ? INCOME_CATEGORIES : typeFilter === 'expense' ? EXPENSE_CATEGORIES : [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES]).map(c => (
            <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
          ))}
        </select>
        <input
          className="filter-input"
          type="month"
          value={monthFilter}
          onChange={e => setMonthFilter(e.target.value)}
          style={{ width: 150 }}
        />
        <select className="filter-select" value={sort} onChange={e => setSort(e.target.value)}>
          <option value="date_desc">Newest first</option>
          <option value="date_asc">Oldest first</option>
          <option value="amount_desc">Highest amount</option>
          <option value="amount_asc">Lowest amount</option>
        </select>
        {hasFilters && (
          <button className="filter-clear" onClick={clearFilters}>Clear filters</button>
        )}
      </div>

      {filtered.length > 0 && (
        <div style={{ display:'flex', gap:12, marginBottom:16 }}>
          <span style={{ fontSize:13, color:'#10b981', fontWeight:600 }}>
            + {fmt(totals.income)} income
          </span>
          <span style={{ fontSize:13, color:'#ef4444', fontWeight:600 }}>
            - {fmt(totals.expense)} expenses
          </span>
          <span style={{ fontSize:13, color: totals.income-totals.expense >= 0 ? '#4f46e5' : '#ef4444', fontWeight:600 }}>
            = {fmt(totals.income - totals.expense)} net
          </span>
        </div>
      )}

      <div className="card">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">{hasFilters ? '🔍' : '📭'}</div>
            <p>{hasFilters ? 'No transactions match your filters.' : 'No transactions yet. Add your first one!'}</p>
          </div>
        ) : (
          <div className="tx-scroll tx-list">
            {filtered.map(tx => (
              <TxRow key={tx.id} tx={tx} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
