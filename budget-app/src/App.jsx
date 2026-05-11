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
  { id: 'goals',        label: 'Budget Goals', icon: '🎯' },
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

  return (
    <div className="app">
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
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: 12, color: '#818cf8' }}>
          <div style={{ marginBottom: 4 }}>All-time balance</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: totals.balance >= 0 ? '#a5f3d0' : '#fca5a5' }}>
            {totals.balance >= 0 ? '' : ''}{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totals.balance)}
          </div>
        </div>
      </aside>

      <main className="main">
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
