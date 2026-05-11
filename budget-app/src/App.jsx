import { useState } from 'react'
import './App.css'
import { useBudget } from './hooks/useBudget'
import Dashboard from './components/Dashboard'
import Transactions from './components/Transactions'
import BudgetGoals from './components/BudgetGoals'
import TransactionForm from './components/TransactionForm'

const NAV = [
  { id: 'dashboard',    label: 'Dashboard',    icon: '📊' },
  { id: 'transactions', label: 'Transactions', icon: '📋' },
  { id: 'goals',        label: 'Goals',        icon: '🎯' },
]

export default function App() {
  const [page, setPage] = useState('dashboard')
  const [showForm, setShowForm] = useState(false)
  const [editTx, setEditTx] = useState(null)

  const {
    transactions, goals, totals,
    addTransaction, updateTransaction, deleteTransaction,
    addGoal, updateGoal, deleteGoal,
  } = useBudget()

  function openAdd() { setEditTx(null); setShowForm(true) }
  function openEdit(tx) { setEditTx(tx); setShowForm(true) }
  function closeForm() { setShowForm(false); setEditTx(null) }

  function handleSave(data) {
    if (editTx) updateTransaction(editTx.id, data)
    else addTransaction(data)
    closeForm()
  }

  function handleDelete(id) {
    if (confirm('Delete this transaction?')) deleteTransaction(id)
  }

  const { fmt } = { fmt: (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n) }

  return (
    <div className="app">
      {/* ── Desktop sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h2>💳 BudgetApp</h2>
          <p>Personal Finance Tracker</p>
        </div>
        <nav className="sidebar-nav">
          {NAV.map(n => (
            <button
              key={n.id}
              className={`nav-btn ${page === n.id ? 'active' : ''}`}
              onClick={() => setPage(n.id)}
            >
              <span className="icon">{n.icon}</span>
              <span>{n.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-balance">
          <div className="sidebar-balance-label">All-time balance</div>
          <div className={`sidebar-balance-amount ${totals.balance >= 0 ? 'positive' : 'negative'}`}>
            {fmt(totals.balance)}
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="main">
        {/* Mobile header */}
        <div className="mobile-header">
          <span className="mobile-header-title">
            {NAV.find(n => n.id === page)?.icon} {NAV.find(n => n.id === page)?.label}
          </span>
          <button className="mobile-add-btn" onClick={openAdd}>+</button>
        </div>

        {page === 'dashboard' && (
          <Dashboard
            transactions={transactions}
            totals={totals}
            onAdd={openAdd}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        )}
        {page === 'transactions' && (
          <Transactions
            transactions={transactions}
            onAdd={openAdd}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        )}
        {page === 'goals' && (
          <BudgetGoals
            goals={goals}
            transactions={transactions}
            onAdd={addGoal}
            onUpdate={updateGoal}
            onDelete={deleteGoal}
          />
        )}
      </main>

      {/* ── Mobile bottom nav ── */}
      <nav className="bottom-nav">
        {NAV.map(n => (
          <button
            key={n.id}
            className={`bottom-nav-btn ${page === n.id ? 'active' : ''}`}
            onClick={() => setPage(n.id)}
          >
            <span className="bottom-nav-icon">{n.icon}</span>
            <span className="bottom-nav-label">{n.label}</span>
          </button>
        ))}
      </nav>

      {showForm && (
        <TransactionForm
          onSave={handleSave}
          onClose={closeForm}
          initial={editTx}
        />
      )}
    </div>
  )
}
