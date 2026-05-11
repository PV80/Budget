import { useState, useEffect, useMemo } from 'react'

const STORAGE_KEY_TX = 'budget_transactions'
const STORAGE_KEY_GOALS = 'budget_goals'

function makeSeedDate(daysAgo) {
  const d = new Date(); d.setDate(d.getDate() - daysAgo)
  return d.toISOString().slice(0, 10)
}

const SEED_TX = [
  { id: 's1', type:'income',  amount:3500,  category:'salary',        date:makeSeedDate(10), note:'Monthly salary' },
  { id: 's2', type:'expense', amount:1200,  category:'housing',       date:makeSeedDate(9),  note:'Rent' },
  { id: 's3', type:'expense', amount:85.4,  category:'food',          date:makeSeedDate(8),  note:'Grocery run' },
  { id: 's4', type:'expense', amount:45,    category:'transport',     date:makeSeedDate(7),  note:'Gas' },
  { id: 's5', type:'income',  amount:600,   category:'freelance',     date:makeSeedDate(6),  note:'Design project' },
  { id: 's6', type:'expense', amount:14.99, category:'entertainment',  date:makeSeedDate(5),  note:'Netflix' },
  { id: 's7', type:'expense', amount:52,    category:'health',        date:makeSeedDate(4),  note:'Pharmacy' },
  { id: 's8', type:'expense', amount:120,   category:'shopping',      date:makeSeedDate(3),  note:'Clothes' },
  { id: 's9', type:'expense', amount:60,    category:'food',          date:makeSeedDate(2),  note:'Restaurant dinner' },
  { id:'s10', type:'expense', amount:110,   category:'utilities',     date:makeSeedDate(1),  note:'Electric bill' },
]

const SEED_GOALS = [
  { id: 'g1', category:'food',          limit:400  },
  { id: 'g2', category:'housing',       limit:1300 },
  { id: 'g3', category:'transport',     limit:150  },
  { id: 'g4', category:'entertainment', limit:80   },
  { id: 'g5', category:'shopping',      limit:200  },
]

function load(key, fallback) {
  try {
    const v = localStorage.getItem(key)
    return v ? JSON.parse(v) : fallback
  } catch {
    return fallback
  }
}

export function useBudget() {
  const [transactions, setTransactions] = useState(() => load(STORAGE_KEY_TX, SEED_TX))
  const [goals, setGoals] = useState(() => load(STORAGE_KEY_GOALS, SEED_GOALS))

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TX, JSON.stringify(transactions))
  }, [transactions])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_GOALS, JSON.stringify(goals))
  }, [goals])

  function addTransaction(tx) {
    setTransactions(prev => [{ ...tx, id: crypto.randomUUID() }, ...prev])
  }

  function updateTransaction(id, tx) {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...tx } : t))
  }

  function deleteTransaction(id) {
    setTransactions(prev => prev.filter(t => t.id !== id))
  }

  function addGoal(goal) {
    setGoals(prev => [...prev, { ...goal, id: crypto.randomUUID() }])
  }

  function updateGoal(id, goal) {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...goal } : g))
  }

  function deleteGoal(id) {
    setGoals(prev => prev.filter(g => g.id !== id))
  }

  const totals = useMemo(() => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0)
    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0)
    return { income, expense, balance: income - expense }
  }, [transactions])

  return {
    transactions,
    goals,
    totals,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addGoal,
    updateGoal,
    deleteGoal,
  }
}
