import { useMemo, useState } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts'
import { getCategoryMeta, fmt, fmtDate } from './categories'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function Dashboard({ transactions, totals, onAdd, onEdit, onDelete }) {
  const now = new Date()
  const [viewMonth, setViewMonth] = useState(now.getMonth())
  const [viewYear, setViewYear] = useState(now.getFullYear())

  const monthLabel = `${MONTHS[viewMonth]} ${viewYear}`

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const monthTx = useMemo(() =>
    transactions.filter(t => {
      const d = new Date(t.date + 'T00:00:00')
      return d.getMonth() === viewMonth && d.getFullYear() === viewYear
    }),
    [transactions, viewMonth, viewYear]
  )

  const monthTotals = useMemo(() => {
    const income = monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const expense = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    return { income, expense, balance: income - expense }
  }, [monthTx])

  // Pie: expenses by category this month
  const pieData = useMemo(() => {
    const map = {}
    monthTx.filter(t => t.type === 'expense').forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount
    })
    return Object.entries(map)
      .map(([cat, value]) => ({ cat, value, ...getCategoryMeta(cat, 'expense') }))
      .sort((a, b) => b.value - a.value)
  }, [monthTx])

  // Bar: last 6 months income vs expense
  const barData = useMemo(() => {
    const result = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(viewYear, viewMonth - i, 1)
      const m = d.getMonth()
      const y = d.getFullYear()
      const txs = transactions.filter(t => {
        const td = new Date(t.date + 'T00:00:00')
        return td.getMonth() === m && td.getFullYear() === y
      })
      result.push({
        name: MONTHS[m],
        Income: txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        Expenses: txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      })
    }
    return result
  }, [transactions, viewMonth, viewYear])

  const recentTx = transactions.slice(0, 5)

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Your financial overview</p>
        </div>
        <button className="btn btn-primary" onClick={onAdd}>+ Add Transaction</button>
      </div>

      <div className="month-nav">
        <button onClick={prevMonth}>‹</button>
        <span>{monthLabel}</span>
        <button onClick={nextMonth}>›</button>
      </div>

      <div className="summary-grid">
        <div className="summary-card">
          <div className="summary-icon income">💰</div>
          <div>
            <div className="summary-label">Income</div>
            <div className="summary-amount income">{fmt(monthTotals.income)}</div>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon expense">💸</div>
          <div>
            <div className="summary-label">Expenses</div>
            <div className="summary-amount expense">{fmt(monthTotals.expense)}</div>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon balance">⚖️</div>
          <div>
            <div className="summary-label">Net Balance</div>
            <div className={`summary-amount ${monthTotals.balance >= 0 ? 'balance' : 'negative'}`}>
              {fmt(monthTotals.balance)}
            </div>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Spending by Category</h3>
          {pieData.length === 0 ? (
            <div className="chart-empty">No expenses this month</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={70}>
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="cat-legend">
                {pieData.map(d => {
                  const pct = monthTotals.expense > 0 ? (d.value / monthTotals.expense) * 100 : 0
                  return (
                    <div key={d.cat} className="cat-legend-item">
                      <div className="cat-dot" style={{ background: d.color }} />
                      <span style={{ flex: 1 }}>{d.icon} {d.label}</span>
                      <div className="cat-legend-bar">
                        <div className="cat-legend-fill" style={{ width: `${pct}%`, background: d.color }} />
                      </div>
                      <span className="cat-legend-amount">{fmt(d.value)}</span>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        <div className="chart-card">
          <h3>Income vs Expenses (6 months)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={barData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`} />
              <Tooltip formatter={(v) => fmt(v)} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Income"   fill="#10b981" radius={[4,4,0,0]} />
              <Bar dataKey="Expenses" fill="#ef4444" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="recent-card">
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <h3 style={{ fontSize:14, fontWeight:600, color:'#1e1b4b' }}>Recent Transactions</h3>
        </div>
        {recentTx.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <p>No transactions yet. Add your first one!</p>
          </div>
        ) : (
          <div className="tx-list">
            {recentTx.map(tx => <TxRow key={tx.id} tx={tx} onEdit={onEdit} onDelete={onDelete} />)}
          </div>
        )}
      </div>
    </div>
  )
}

export function TxRow({ tx, onEdit, onDelete }) {
  const meta = getCategoryMeta(tx.category, tx.type)
  return (
    <div className="tx-item">
      <div className="tx-cat-icon" style={{ background: meta.color + '22' }}>
        {meta.icon}
      </div>
      <div className="tx-info">
        <div className="tx-name">{tx.note || meta.label}</div>
        <div className="tx-meta">{meta.label} · {fmtDate(tx.date)}</div>
      </div>
      <div className={`tx-amount ${tx.type}`}>
        {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
      </div>
      <div className="tx-actions">
        <button className="btn-icon edit" onClick={() => onEdit(tx)} title="Edit">✏️</button>
        <button className="btn-icon del"  onClick={() => onDelete(tx.id)} title="Delete">🗑️</button>
      </div>
    </div>
  )
}
