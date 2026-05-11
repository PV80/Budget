export const EXPENSE_CATEGORIES = [
  { value: 'housing',       label: 'Housing',       icon: '🏠', color: '#6366f1' },
  { value: 'food',          label: 'Food',           icon: '🍔', color: '#f59e0b' },
  { value: 'transport',     label: 'Transport',      icon: '🚗', color: '#3b82f6' },
  { value: 'entertainment', label: 'Entertainment',  icon: '🎮', color: '#a855f7' },
  { value: 'health',        label: 'Health',         icon: '❤️', color: '#ef4444' },
  { value: 'shopping',      label: 'Shopping',       icon: '🛍️', color: '#ec4899' },
  { value: 'education',     label: 'Education',      icon: '📚', color: '#0ea5e9' },
  { value: 'utilities',     label: 'Utilities',      icon: '💡', color: '#f97316' },
  { value: 'other',         label: 'Other',          icon: '📦', color: '#6b7280' },
]

export const INCOME_CATEGORIES = [
  { value: 'salary',     label: 'Salary',     icon: '💼', color: '#10b981' },
  { value: 'freelance',  label: 'Freelance',  icon: '💻', color: '#06b6d4' },
  { value: 'investment', label: 'Investment', icon: '📈', color: '#8b5cf6' },
  { value: 'gift',       label: 'Gift',       icon: '🎁', color: '#f43f5e' },
  { value: 'other',      label: 'Other',      icon: '💰', color: '#84cc16' },
]

export function getCategoryMeta(value, type) {
  const list = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
  return list.find(c => c.value === value) || { icon: '💸', color: '#6b7280', label: value }
}

export function fmt(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(amount)
}

export function fmtDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
