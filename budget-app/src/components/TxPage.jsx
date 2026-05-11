import { useState, useMemo } from 'react'
import { getCategoryMeta, fmt, fmtDate } from './categories'
import { TxItem } from './Home'

const FILTERS = ['All','Income','Expenses']

export default function TxPage({ transactions, onAdd, onEdit, onDelete }) {
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')

  const list = useMemo(() => {
    let l = [...transactions]
    if (filter === 'Income')   l = l.filter(t=>t.type==='income')
    if (filter === 'Expenses') l = l.filter(t=>t.type==='expense')
    if (search.trim()) {
      const q = search.toLowerCase()
      l = l.filter(t => t.note?.toLowerCase().includes(q) || getCategoryMeta(t.category,t.type).label.toLowerCase().includes(q))
    }
    return l
  }, [transactions, filter, search])

  const totals = useMemo(()=>({
    income:  list.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0),
    expense: list.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0),
  }), [list])

  return (
    <div className="screen">
      <div className="page-header-bar">
        <h1>Transactions</h1>
        <p>{list.length} transaction{list.length!==1?'s':''}</p>
      </div>

      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input
          placeholder="Search transactions…"
          value={search}
          onChange={e=>setSearch(e.target.value)}
        />
        {search && <button onClick={()=>setSearch('')} style={{background:'none',border:'none',color:'var(--muted)',fontSize:16,cursor:'pointer'}}>✕</button>}
      </div>

      <div className="filter-chips">
        {FILTERS.map(f => (
          <button key={f} className={`chip ${filter===f?'active':'inactive'}`} onClick={()=>setFilter(f)}>{f}</button>
        ))}
      </div>

      {list.length > 0 && (
        <div style={{ display:'flex', gap:12, padding:'12px 16px 0', fontSize:13 }}>
          <span style={{ color:'var(--green)', fontWeight:700 }}>+{fmt(totals.income)}</span>
          <span style={{ color:'var(--red)',   fontWeight:700 }}>-{fmt(totals.expense)}</span>
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        {list.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">🔍</div>
            <p>No transactions found.</p>
          </div>
        ) : (
          <div className="tx-card">
            {list.map(tx => <TxItem key={tx.id} tx={tx} onEdit={onEdit} onDelete={onDelete} />)}
          </div>
        )}
      </div>
    </div>
  )
}
