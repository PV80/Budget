import { useMemo, useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { getCategoryMeta, fmt, fmtDate } from './categories'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning,'
  if (h < 18) return 'Good afternoon,'
  return 'Good evening,'
}

export default function Home({ transactions, goals, onAdd, onEdit, onDelete, userName }) {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth())
  const [year,  setYear]  = useState(now.getFullYear())

  function prevMonth() { if (month === 0) { setMonth(11); setYear(y=>y-1) } else setMonth(m=>m-1) }
  function nextMonth() { if (month === 11) { setMonth(0); setYear(y=>y+1) } else setMonth(m=>m+1) }

  const monthTx = useMemo(() =>
    transactions.filter(t => {
      const d = new Date(t.date + 'T00:00:00')
      return d.getMonth() === month && d.getFullYear() === year
    }), [transactions, month, year])

  const income  = monthTx.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0)
  const expense = monthTx.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0)
  const balance = transactions.reduce((s,t)=> t.type==='income' ? s+t.amount : s-t.amount, 0)

  // Budget goal for this month
  const totalBudget = goals.reduce((s,g)=>s+g.limit, 0)
  const pct = totalBudget > 0 ? Math.min(Math.round((expense/totalBudget)*100), 100) : 0
  const onTrack = totalBudget === 0 || expense <= totalBudget

  const donutData = [
    { value: pct,     color: onTrack ? '#12c98e' : '#ff5b5b' },
    { value: 100-pct, color: '#eaecf5' },
  ]

  // Spending by category
  const catSpend = useMemo(() => {
    const map = {}
    monthTx.filter(t=>t.type==='expense').forEach(t => { map[t.category] = (map[t.category]||0) + t.amount })
    return Object.entries(map)
      .map(([cat, amt]) => ({ cat, amt, meta: getCategoryMeta(cat,'expense') }))
      .sort((a,b)=>b.amt-a.amt)
  }, [monthTx])

  const recent = transactions.slice(0, 5)

  const lastMonthExpense = useMemo(() => {
    const pm = month===0?11:month-1, py = month===0?year-1:year
    return transactions
      .filter(t=>{ const d=new Date(t.date+'T00:00:00'); return d.getMonth()===pm&&d.getFullYear()===py&&t.type==='expense' })
      .reduce((s,t)=>s+t.amount,0)
  }, [transactions, month, year])

  const changeAmt = expense - lastMonthExpense
  const changePct = lastMonthExpense>0 ? ((Math.abs(changeAmt)/lastMonthExpense)*100).toFixed(1) : null

  return (
    <div className="screen">
      {/* Header */}
      <div className="home-header">
        <div className="header-top">
          <div>
            <div className="greeting">{greeting()}</div>
            <div className="greeting-name">{userName} 👋</div>
          </div>
          <button className="header-bell">🔔</button>
        </div>

        <div className="balance-card">
          <div className="balance-wallet">💳</div>
          <div className="balance-label">💜 Total Balance</div>
          <div className="balance-amount">{fmt(balance)}</div>
          {changePct && (
            <div className={`balance-change ${changeAmt <= 0 ? 'pos' : 'neg'}`}>
              {changeAmt <= 0 ? '▲' : '▼'} ${Math.abs(changeAmt).toFixed(2)} ({changePct}%) vs last month
            </div>
          )}
          <div className="balance-actions">
            <button className="balance-btn" onClick={() => onAdd('income')}>
              <span>+</span> Add Income
            </button>
            <button className="balance-btn" onClick={() => onAdd('expense')}>
              <span>→</span> Transfer
            </button>
          </div>
        </div>
      </div>

      {/* Income / Expense strip */}
      <div className="summary-strip" style={{ marginTop: 16 }}>
        <div className="strip-card">
          <div className="strip-label">Income</div>
          <div className="strip-amount income">{fmt(income)}</div>
        </div>
        <div className="strip-card">
          <div className="strip-label">Expenses</div>
          <div className="strip-amount expense">{fmt(expense)}</div>
        </div>
      </div>

      {/* Budget Overview */}
      <div className="section-header">
        <div className="section-title">Budget Overview</div>
        <div className="month-row">
          <button className="month-arrow" onClick={prevMonth}>‹</button>
          <span className="month-label">{MONTHS[month]} {year}</span>
          <button className="month-arrow" onClick={nextMonth}>›</button>
        </div>
      </div>

      <div className="budget-card">
        <div className="budget-donut">
          <ResponsiveContainer width={110} height={110}>
            <PieChart>
              <Pie data={donutData} dataKey="value" cx="50%" cy="50%" innerRadius={38} outerRadius={52} startAngle={90} endAngle={-270} strokeWidth={0}>
                {donutData.map((d,i) => <Cell key={i} fill={d.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="donut-center">
            <div className="donut-pct">{pct}%</div>
            <div className="donut-lbl">used</div>
          </div>
        </div>

        <div className="budget-stats">
          <div className="budget-stat">
            <div className="b-dot" style={{ background: onTrack?'#12c98e':'#ff5b5b' }} />
            <span className="b-label">Spent</span>
            <span className="b-value">{fmt(expense)}</span>
          </div>
          <div className="budget-stat">
            <div className="b-dot" style={{ background: '#eaecf5' }} />
            <span className="b-label">Budget</span>
            <span className="b-value">{totalBudget > 0 ? fmt(totalBudget) : '—'}</span>
          </div>
          <div className={`budget-track ${onTrack?'':'over'}`}>
            {totalBudget === 0
              ? '💡 Set budget goals!'
              : onTrack
              ? `✅ You're on track!`
              : `⚠️ Over by ${fmt(expense - totalBudget)}`}
          </div>
        </div>
      </div>

      {/* Spending by Category */}
      {catSpend.length > 0 && (
        <>
          <div className="section-header">
            <div className="section-title">Spending by Category</div>
          </div>
          <div className="cat-scroll">
            {catSpend.map(({ cat, amt, meta }) => {
              const pctCat = expense > 0 ? Math.round((amt/expense)*100) : 0
              return (
                <div className="cat-tile" key={cat}>
                  <div className="cat-tile-icon" style={{ background: meta.color+'22' }}>{meta.icon}</div>
                  <div className="cat-tile-name">{meta.label}</div>
                  <div className="cat-tile-amt">{fmt(amt)}</div>
                  <div className="cat-tile-pct">{pctCat}%</div>
                  <div className="cat-tile-bar">
                    <div className="cat-tile-fill" style={{ width:`${pctCat}%`, background: meta.color }} />
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Recent Transactions */}
      <div className="section-header" style={{ marginTop: 8 }}>
        <div className="section-title">Recent Transactions</div>
      </div>

      {recent.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📭</div>
          <p>No transactions yet.<br/>Tap + to add your first one.</p>
        </div>
      ) : (
        <div className="tx-card">
          {recent.map(tx => <TxItem key={tx.id} tx={tx} onEdit={onEdit} onDelete={onDelete} />)}
        </div>
      )}
    </div>
  )
}

export function TxItem({ tx, onEdit, onDelete }) {
  const meta = getCategoryMeta(tx.category, tx.type)
  return (
    <div className="tx-item">
      <div className="tx-logo" style={{ background: meta.color+'22' }}>{meta.icon}</div>
      <div className="tx-body">
        <div className="tx-name">{tx.note || meta.label}</div>
        <div className="tx-date">{fmtDate(tx.date)}</div>
      </div>
      <div className="tx-right">
        <div className={`tx-amt ${tx.type}`}>
          {tx.type==='income'?'+':'-'}{fmt(tx.amount)}
        </div>
      </div>
      <div className="tx-actions">
        <button className="icon-btn" onClick={()=>onEdit(tx)}>✏️</button>
        <button className="icon-btn" onClick={()=>onDelete(tx.id)}>🗑️</button>
      </div>
    </div>
  )
}
