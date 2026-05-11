import { useState } from 'react'
import './App.css'
import { useBudget } from './hooks/useBudget'
import Home from './components/Home'
import TxPage from './components/TxPage'
import GoalsPage from './components/GoalsPage'
import ProfilePage from './components/ProfilePage'
import AddSheet from './components/AddSheet'

function loadName() {
  try { return localStorage.getItem('budget_username') || 'Alex' } catch { return 'Alex' }
}

export default function App() {
  const [tab, setTab]           = useState('home')
  const [userName, setUserName] = useState(loadName)
  const [sheet, setSheet]       = useState(null)   // null | { defaultType } | tx-object (edit)

  const {
    transactions, goals, totals,
    addTransaction, updateTransaction, deleteTransaction,
    addGoal, updateGoal, deleteGoal,
  } = useBudget()

  function openAdd(defaultType = 'expense') { setSheet({ defaultType }) }
  function openEdit(tx) { setSheet(tx) }
  function closeSheet() { setSheet(null) }

  function handleSave(data) {
    if (sheet?.id) updateTransaction(sheet.id, data)
    else addTransaction(data)
    closeSheet()
  }

  function handleDelete(id) {
    if (confirm('Delete this transaction?')) deleteTransaction(id)
  }

  function handleNameChange(name) {
    setUserName(name)
    try { localStorage.setItem('budget_username', name) } catch {}
  }

  const isEdit    = sheet && sheet.id
  const sheetOpen = sheet !== null

  return (
    <div className="app">
      <main className="main">
        {tab === 'home' && (
          <Home
            transactions={transactions}
            goals={goals}
            onAdd={openAdd}
            onEdit={openEdit}
            onDelete={handleDelete}
            userName={userName}
          />
        )}
        {tab === 'transactions' && (
          <TxPage
            transactions={transactions}
            onAdd={openAdd}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        )}
        {tab === 'goals' && (
          <GoalsPage
            goals={goals}
            transactions={transactions}
            onAdd={addGoal}
            onUpdate={updateGoal}
            onDelete={deleteGoal}
          />
        )}
        {tab === 'profile' && (
          <ProfilePage
            userName={userName}
            onNameChange={handleNameChange}
            totals={totals}
          />
        )}
      </main>

      {/* Bottom nav */}
      <nav className="bottom-nav">
        <button className={`nav-item ${tab==='home'?'active':''}`} onClick={()=>setTab('home')}>
          <span className="nav-icon">🏠</span>
          <span className="nav-label">Home</span>
        </button>
        <button className={`nav-item ${tab==='transactions'?'active':''}`} onClick={()=>setTab('transactions')}>
          <span className="nav-icon">📋</span>
          <span className="nav-label">Transactions</span>
        </button>

        {/* Center FAB */}
        <button className="nav-fab" onClick={()=>openAdd('expense')}>
          <span style={{ fontSize:28, lineHeight:1 }}>+</span>
        </button>

        <button className={`nav-item ${tab==='goals'?'active':''}`} onClick={()=>setTab('goals')}>
          <span className="nav-icon">🎯</span>
          <span className="nav-label">Goals</span>
        </button>
        <button className={`nav-item ${tab==='profile'?'active':''}`} onClick={()=>setTab('profile')}>
          <span className="nav-icon">👤</span>
          <span className="nav-label">Profile</span>
        </button>
      </nav>

      {sheetOpen && (
        <AddSheet
          onSave={handleSave}
          onClose={closeSheet}
          initial={isEdit ? sheet : null}
          defaultType={!isEdit ? (sheet.defaultType || 'expense') : undefined}
        />
      )}
    </div>
  )
}
