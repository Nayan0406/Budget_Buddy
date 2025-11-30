import React, { useEffect, useState, useRef } from 'react'
import Sidebar from '../layout/Sidebar.jsx'

const Borrowing = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentForm, setPaymentForm] = useState({ id: '', amount: '' })
  const [showDueDateModal, setShowDueDateModal] = useState(false)
  const [dueDateForm, setDueDateForm] = useState({ id: '', dueDate: '' })
  const [quickOpen, setQuickOpen] = useState(false)
  const [quick, setQuick] = useState({ name: '', contact: '', amount: '', dueDate: '', notes: '' })
  const [filter, setFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const tableContainerRef = useRef(null)
  const [form, setForm] = useState({
    type: 'borrowed', // 'borrowed' = user owes, 'lent' = others owe user
    name: '',
    contact: '',
    amount: '',
    dueDate: '',
    notes: '',
    reminderEnabled: false,
    reminderDays: 3
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setError('Please log in to view and manage your borrowings.')
      setLoading(false)
      return
    }
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      setLoading(true)
      setError('')
      const token = localStorage.getItem('token')
      const API_BASE = import.meta.env.VITE_API_BASE || '/api'
      const res = await fetch(`${API_BASE}/borrowings`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      if (!res.ok) {
        if (res.status === 401) {
          setError('Please log in to view your borrowings.')
        } else {
          setError('Failed to load borrowings. Please try again.')
        }
        setItems([])
        setLoading(false)
        return
      }
      const data = await res.json()
      setItems(data)
    } catch (err) {
      console.error('Error fetching borrowings', err)
      setError('Network error. Please check your connection.')
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  const formatAmount = (amt) => {
    if (amt == null) return '-'
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amt)
  }

  const formatDate = (d) => {
    if (!d) return '-'
    return new Date(d).toLocaleDateString('en-IN')
  }

  const isOverdue = (item) => {
    return item.dueDate && new Date(item.dueDate) < new Date() && item.status !== 'paid'
  }

  const getOverdueDays = (item) => {
    if (!item.dueDate || item.status === 'paid') return 0
    const dueDate = new Date(item.dueDate)
    const today = new Date()
    const diffTime = today - dueDate
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const getOverdueSeverity = (item) => {
    const days = getOverdueDays(item)
    if (days <= 0) return 'normal'
    if (days <= 7) return 'mild'
    if (days <= 30) return 'moderate'
    return 'severe'
  }

  const summary = {
    owedByMe: items.filter(i => i.type === 'borrowed').reduce((s, it) => s + (it.remaining ?? it.amount ?? 0), 0),
    owedToMe: items.filter(i => i.type === 'lent').reduce((s, it) => s + (it.remaining ?? it.amount ?? 0), 0),
    total: items.length,
    overdueCount: items.filter(i => isOverdue(i)).length,
    overdueAmount: items.filter(i => isOverdue(i)).reduce((s, it) => s + (it.remaining ?? it.amount ?? 0), 0)
  }

  const filteredItems = items.filter(item => {
    switch (filter) {
      case 'owed-by-me':
        return item.type === 'borrowed'
      case 'owed-to-me':
        return item.type === 'lent'
      case 'overdue':
        return item.dueDate && new Date(item.dueDate) < new Date() && item.status !== 'paid'
      default:
        return true
    }
  })

  // Pagination
  const PAGE_SIZE = 6
  useEffect(() => {
    // reset to first page when filter or items change
    setCurrentPage(1)
  }, [filter, items])

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE))
  const paginatedItems = filteredItems.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  // smooth scroll table into view on page change
  useEffect(() => {
    if (tableContainerRef.current) {
      try {
        tableContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } catch (e) {
        // fallback
        tableContainerRef.current.scrollTop = 0
      }
    }
  }, [currentPage])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleQuickChange = (e) => {
    const { name, value } = e.target
    setQuick(prev => ({ ...prev, [name]: value }))
  }

  const handlePaymentChange = (e) => {
    const { name, value } = e.target
    setPaymentForm(prev => ({ ...prev, [name]: value }))
  }

  const handleDueDateChange = (e) => {
    const { name, value } = e.target
    setDueDateForm(prev => ({ ...prev, [name]: value }))
  }

  const handleQuickSubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      const token = localStorage.getItem('token')
      const API_BASE = import.meta.env.VITE_API_BASE || '/api'
      const payload = {
        type: 'borrowed',
        counterparty: { name: quick.name, contact: quick.contact },
        amount: Number(quick.amount),
        dueDate: quick.dueDate || null,
        notes: quick.notes,
        reminder: { enabled: false, daysBefore: 0 }
      }
      const res = await fetch(`${API_BASE}/borrowings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Failed to create')
      const created = await res.json()
      await fetchItems() // Refresh the list to show the new item
      setQuick({ name: '', contact: '', amount: '', dueDate: '', notes: '' })
      setQuickOpen(false)
      setError('')
    } catch (err) {
      console.error(err)
      alert('Error creating record. Check console.')
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      const token = localStorage.getItem('token')
      const API_BASE = import.meta.env.VITE_API_BASE || '/api'
      const payload = {
        type: form.type,
        counterparty: { name: form.name, contact: form.contact },
        amount: Number(form.amount),
        dueDate: form.dueDate || null,
        notes: form.notes,
        reminder: { enabled: form.reminderEnabled, daysBefore: form.reminderDays }
      }
      const res = await fetch(`${API_BASE}/borrowings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Failed to create')
      const created = await res.json()
      await fetchItems() // Refresh the list
      setForm({
        type: 'borrowed',
        name: '',
        contact: '',
        amount: '',
        dueDate: '',
        notes: '',
        reminderEnabled: false,
        reminderDays: 3
      })
      setShowForm(false)
      setError('')
    } catch (err) {
      console.error(err)
      alert('Error creating record. Check console.')
    } finally {
      setSaving(false)
    }
  }

  const updateStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token')
      const API_BASE = import.meta.env.VITE_API_BASE || '/api'
      const res = await fetch(`${API_BASE}/borrowings/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status: newStatus })
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        console.error('Status update failed:', {
          status: res.status,
          statusText: res.statusText,
          error: errorData
        })
        throw new Error(`Failed to update status: ${res.status} ${res.statusText}`)
      }
      await fetchItems() // Refresh the list
    } catch (err) {
      console.error('Error updating status', err)
      alert(`Error updating status: ${err.message}`)
    }
  }

  const addPayment = async (id, paymentAmount) => {
    try {
      const token = localStorage.getItem('token')
      const API_BASE = import.meta.env.VITE_API_BASE || '/api'
      const res = await fetch(`${API_BASE}/borrowings/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ payment: Number(paymentAmount) })
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        console.error('Payment add failed:', {
          status: res.status,
          statusText: res.statusText,
          error: errorData
        })
        throw new Error(`Failed to add payment: ${res.status} ${res.statusText}`)
      }
      await fetchItems() // Refresh the list
      setShowPaymentModal(false)
      setPaymentForm({ id: '', amount: '' })
    } catch (err) {
      console.error('Error adding payment', err)
      alert(`Error adding payment: ${err.message}`)
    }
  }

  const updateDueDate = async (id, newDueDate) => {
    try {
      const token = localStorage.getItem('token')
      const API_BASE = import.meta.env.VITE_API_BASE || '/api'
      const res = await fetch(`${API_BASE}/borrowings/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ dueDate: newDueDate || null })
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        console.error('Due date update failed:', {
          status: res.status,
          statusText: res.statusText,
          error: errorData
        })
        throw new Error(`Failed to update due date: ${res.status} ${res.statusText}`)
      }
      await fetchItems() // Refresh the list
      setShowDueDateModal(false)
      setDueDateForm({ id: '', dueDate: '' })
    } catch (err) {
      console.error('Error updating due date', err)
      alert(`Error updating due date: ${err.message}`)
    }
  }

  return (
    <>
      <Sidebar />
      <div className="min-h-screen bg-gray-50 lg:ml-64">
        <div className="py-4 sm:py-6 px-3 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="bg-indigo-100 text-indigo-600 rounded-full p-1 sm:p-3 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8v8m0-8V4" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Borrowings</h2>
                <p className="text-xs sm:text-sm text-gray-600">Track money you borrowed and lent.</p>
              </div>
            </div>

          {/* Overdue Alerts */}
          {items.filter(it => isOverdue(it)).length > 0 && (
            <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-red-800 mb-1">
                    {items.filter(it => isOverdue(it)).length} Overdue Payment{items.filter(it => isOverdue(it)).length > 1 ? 's' : ''}
                  </h3>
                  <p className="text-sm text-red-700 mb-2">
                    You have payments that are past their due date. Consider contacting the parties involved.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {items.filter(it => isOverdue(it)).slice(0, 3).map((it, idx) => (
                      <span key={it._id || idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                        {it.counterparty?.name || 'Unknown'} - ₹{formatAmount(it.remaining ?? it.amount)}
                      </span>
                    ))}
                    {items.filter(it => isOverdue(it)).length > 3 && (
                      <span className="text-xs text-red-600 font-medium">
                        +{items.filter(it => isOverdue(it)).length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Filter + Add */}
          <div className="mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1">
                <button key="all" onClick={() => setFilter('all')} className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}>All</button>
                <button key="owed-by-me" onClick={() => setFilter('owed-by-me')} className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'owed-by-me' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}>Owed By Me</button>
                <button key="owed-to-me" onClick={() => setFilter('owed-to-me')} className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'owed-to-me' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}>Owed To Me</button>
                <button key="overdue" onClick={() => setFilter('overdue')} className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'overdue' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}>Overdue</button>
              </div>

              <div className="mt-2 sm:mt-0 sm:ml-4">
                <button
                  onClick={() => setShowForm(true)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="hidden sm:inline">Add Borrowing</span>
                  <span className="sm:hidden">Add</span>
                </button>
              </div>
            </div>
          </div>
          </div>

          {quickOpen && (
            <div className="mb-4 bg-white shadow rounded-lg p-4">
              <form onSubmit={handleQuickSubmit} className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
                <div className="sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    name="name"
                    value={quick.name}
                    onChange={handleQuickChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-sm"
                    required
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                  <input
                    name="contact"
                    value={quick.contact}
                    onChange={handleQuickChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-sm"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <input
                    name="amount"
                    type="number"
                    step="0.01"
                    value={quick.amount}
                    onChange={handleQuickChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-sm"
                    required
                  />
                </div>
                <div className="sm:col-span-2 flex gap-2">
                  <button type="button" onClick={() => { setQuick({ name: '', contact: '', amount: '', dueDate: '', notes: '' }); setQuickOpen(false); }} className="flex-1 px-3 py-2 border rounded-lg text-sm">Cancel</button>
                  <button type="submit" disabled={saving} className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm">{saving ? 'Saving...' : 'Save'}</button>
                </div>
              </form>
            </div>
          )}

          {/* Add modal */}
          {showForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black opacity-40 z-40" onClick={() => setShowForm(false)} />
              <div className="bg-white rounded-lg shadow-lg z-50 w-full max-w-lg max-h-[90vh] overflow-auto relative mx-auto">
                <button onClick={() => setShowForm(false)} aria-label="Close" className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 z-10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2 pr-8">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 sm:h-6 w-5 sm:w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add New Borrowing
                  </h3>
                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  {/* Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Type</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, type: 'borrowed' }))}
                        className={`p-4 border-2 rounded-lg text-center transition-all ${
                          form.type === 'borrowed'
                            ? 'border-red-500 bg-red-50 text-red-700'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                        <div className="font-medium">I Borrowed</div>
                        <div className="text-xs opacity-75">Money I owe</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, type: 'lent' }))}
                        className={`p-4 border-2 rounded-lg text-center transition-all ${
                          form.type === 'lent'
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                        <div className="font-medium">I Lent</div>
                        <div className="text-xs opacity-75">Money owed to me</div>
                      </button>
                    </div>
                  </div>

                  {/* Person Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        placeholder="Enter person's name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Contact</label>
                      <input
                        name="contact"
                        value={form.contact}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        placeholder="Phone or email"
                      />
                    </div>
                  </div>

                  {/* Amount and Due Date */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Amount *</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                        <input
                          name="amount"
                          type="number"
                          step="0.01"
                          min="0"
                          value={form.amount}
                          onChange={handleChange}
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                          placeholder="0.00"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                      <input
                        name="dueDate"
                        type="date"
                        value={form.dueDate}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                    <textarea
                      name="notes"
                      value={form.notes}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
                      rows={3}
                      placeholder="Add any additional details..."
                    />
                  </div>

                  {/* Reminder Settings */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-700">Reminder</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="reminderEnabled"
                          checked={form.reminderEnabled}
                          onChange={handleChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                    {form.reminderEnabled && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Remind me</span>
                        <input
                          name="reminderDays"
                          type="number"
                          min="0"
                          max="30"
                          value={form.reminderDays}
                          onChange={handleChange}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <span className="text-sm text-gray-600">days before due date</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-4 sm:px-6 py-2 sm:py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium order-2 sm:order-1"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-4 sm:px-6 py-2 sm:py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2 order-1 sm:order-2"
                    >
                      {saving ? (
                        <>
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Save Borrowing
                        </>
                      )}
                    </button>
                  </div>
                </form>
                </div>
              </div>
            </div>
          )}

          {/* Payment modal */}
          {showPaymentModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black opacity-40 z-40" onClick={() => setShowPaymentModal(false)} />
              <div className="bg-white rounded-lg shadow-lg z-50 w-full max-w-md max-h-[90vh] overflow-auto relative mx-auto">
                <button onClick={() => setShowPaymentModal(false)} aria-label="Close" className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 z-10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2 pr-8">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 sm:h-6 w-5 sm:w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8v8m0-8V4" />
                    </svg>
                    Add Payment
                  </h3>
                  <form onSubmit={(e) => { e.preventDefault(); addPayment(paymentForm.id, paymentForm.amount); }} className="space-y-4 sm:space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Payment Amount *</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                        <input
                          name="amount"
                          type="number"
                          step="0.01"
                          min="0"
                          value={paymentForm.amount}
                          onChange={handlePaymentChange}
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                          placeholder="0.00"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => setShowPaymentModal(false)}
                        className="px-4 sm:px-6 py-2 sm:py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium order-2 sm:order-1"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 sm:px-6 py-2 sm:py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2 order-1 sm:order-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Add Payment
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Due Date modal */}
          {showDueDateModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black opacity-40 z-40" onClick={() => setShowDueDateModal(false)} />
              <div className="bg-white rounded-lg shadow-lg z-50 w-full max-w-md max-h-[90vh] overflow-auto relative mx-auto">
                <button onClick={() => setShowDueDateModal(false)} aria-label="Close" className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 z-10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2 pr-8">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 sm:h-6 w-5 sm:w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Update Due Date
                  </h3>
                  <form onSubmit={(e) => { e.preventDefault(); updateDueDate(dueDateForm.id, dueDateForm.dueDate); }} className="space-y-4 sm:space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">New Due Date</label>
                      <input
                        name="dueDate"
                        type="date"
                        value={dueDateForm.dueDate}
                        onChange={handleDueDateChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                      />
                      <p className="text-xs text-gray-500 mt-1">Leave empty to remove due date</p>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => setShowDueDateModal(false)}
                        className="px-4 sm:px-6 py-2 sm:py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium order-2 sm:order-1"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 sm:px-6 py-2 sm:py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2 order-1 sm:order-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Update Due Date
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="bg-white overflow-hidden shadow rounded-lg p-6 sm:p-8 text-center mx-2 sm:mx-0">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-sm sm:text-base text-gray-600">Loading borrowings...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6 text-center mx-2 sm:mx-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-12 sm:w-12 text-red-400 mx-auto mb-3 sm:mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 className="text-base sm:text-lg font-medium text-red-800 mb-2">Unable to Load Data</h3>
              <p className="text-red-600 mb-3 sm:mb-4 text-sm sm:text-base">{error}</p>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                {error.includes('log in') && (
                  <button
                    onClick={() => window.location.href = '/login'}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base"
                  >
                    Log In
                  </button>
                )}
                <button
                  onClick={fetchItems}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="bg-white overflow-hidden shadow rounded-lg p-6 sm:p-8 text-center mx-2 sm:mx-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8v8m0-8V4" />
              </svg>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                {filter === 'all' ? 'No borrowings yet' : 
                 filter === 'owed-by-me' ? 'No money owed by you' :
                 filter === 'owed-to-me' ? 'No money owed to you' :
                 'No overdue borrowings'}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4">
                {filter === 'all' ? 'Create a record to start tracking money borrowed or lent.' :
                 filter === 'owed-by-me' ? 'You don\'t owe money to anyone.' :
                 filter === 'owed-to-me' ? 'No one owes you money.' :
                 'No borrowings are overdue.'}
              </p>
              {filter === 'all' && (
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Your First Borrowing
                </button>
              )}
            </div>
          ) : (
            <div ref={tableContainerRef} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                <div className="inline-block min-w-full align-middle">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16 sm:w-20">Type</th>
                        <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20 sm:min-w-32">Person</th>
                        <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-20 sm:w-24">Amount</th>
                        <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-20 sm:w-24 hidden sm:table-cell">Remaining</th>
                        <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20 sm:w-24 hidden md:table-cell">Due</th>
                        <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16 sm:w-20">Status</th>
                        <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20 sm:w-24">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedItems.map((it, index) => {
                        const overdue = isOverdue(it)
                        const overdueSeverity = getOverdueSeverity(it)
                        const overdueDays = getOverdueDays(it)
                        return (
                        <tr key={it._id || it.id || index} className={`hover:bg-gray-50 ${overdue ? 'bg-red-50 border-l-4 border-l-red-500' : ''}`}>
                          <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex px-1.5 py-0.5 text-xs font-medium rounded-full ${
                                it.type === 'borrowed' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                              }`}>
                                {it.type === 'borrowed' ? 'Borrowed' : 'Lent'}
                              </span>
                              {overdue && (
                                <span className={`inline-flex px-1.5 py-0.5 text-xs font-medium rounded-full ${
                                  overdueSeverity === 'mild' ? 'bg-yellow-100 text-yellow-800' :
                                  overdueSeverity === 'moderate' ? 'bg-orange-100 text-orange-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {overdueDays}d overdue
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-4 whitespace-nowrap">
                            <div className="font-medium text-xs sm:text-sm">{it.counterparty?.name || '-'}</div>
                            <div className="text-xs text-gray-400 truncate max-w-24 sm:max-w-none">{it.counterparty?.contact || ''}</div>
                          </td>
                          <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900 text-right">{formatAmount(it.amount)}</td>
                          <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 text-right hidden sm:table-cell">{formatAmount(it.remaining ?? it.amount)}</td>
                          <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden md:table-cell">{formatDate(it.dueDate)}</td>
                          <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                            <span className={`inline-flex px-1.5 py-0.5 text-xs font-medium rounded-full ${
                              it.status === 'paid' ? 'bg-green-100 text-green-800' :
                              it.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {it.status}
                            </span>
                          </td>
                          <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-4 whitespace-nowrap text-center text-xs sm:text-sm">
                            <div className="flex justify-center gap-2">
                              <button 
                                className="text-blue-600 hover:underline text-xs sm:text-sm font-medium" 
                                onClick={() => { setPaymentForm({ id: it._id || it.id, amount: '' }); setShowPaymentModal(true); }}
                              >
                                Add Payment
                              </button>
                              <button 
                                className="text-purple-600 hover:underline text-xs sm:text-sm font-medium" 
                                onClick={() => { setDueDateForm({ id: it._id || it.id, dueDate: it.dueDate || '' }); setShowDueDateModal(true); }}
                              >
                                Update Due Date
                              </button>
                              {it.status !== 'paid' ? (
                                <button 
                                  className="text-green-600 hover:underline text-xs sm:text-sm font-medium" 
                                  onClick={() => updateStatus(it._id || it.id, 'paid')}
                                >
                                  Mark Paid
                                </button>
                              ) : (
                                <button 
                                  className="text-yellow-600 hover:underline text-xs sm:text-sm font-medium" 
                                  onClick={() => updateStatus(it._id || it.id, 'pending')}
                                >
                                  Mark Pending
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                          )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
                {/* Pagination controls */}
                {filteredItems.length > PAGE_SIZE && (
                  <div className="px-4 sm:px-0 sm:pr-4 py-3 bg-white border-t border-gray-100 flex items-center justify-between">
                    <div className="text-sm text-gray-600 sm:pl-4">Showing {(currentPage - 1) * PAGE_SIZE + 1} - {Math.min(currentPage * PAGE_SIZE, filteredItems.length)} of {filteredItems.length}</div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 rounded-md border bg-white text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:opacity-50"
                        aria-label="Previous page"
                      >
                        ‹
                      </button>

                      <div className="sm:hidden text-sm text-gray-700 px-2">Page {currentPage} of {totalPages}</div>

                      <div className="hidden sm:flex items-center gap-1">
                        {Array.from({ length: totalPages }).map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setCurrentPage(i + 1)}
                            aria-current={currentPage === i + 1 ? 'page' : undefined}
                            className={`px-2 py-1 rounded-md text-sm ${currentPage === i + 1 ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border'}`}>
                            {i + 1}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 rounded-md border bg-white text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:opacity-50"
                        aria-label="Next page"
                      >
                        ›
                      </button>
                    </div>
                  </div>
                )}
            </div>
          )}

          {/* Summary */}
          {items.length > 0 && (
            <div className="mt-4 sm:mt-6 bg-white overflow-hidden shadow rounded-lg p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Summary</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-2">
                <div key="owed-by-me" className="text-center p-3 sm:p-0 bg-gray-50 sm:bg-transparent rounded-lg sm:rounded-none">
                  <p className="text-xl sm:text-2xl font-bold text-indigo-600">{formatAmount(summary.owedByMe)}</p>
                  <p className="text-sm text-gray-600">Owed By Me</p>
                </div>
                <div key="owed-to-me" className="text-center p-3 sm:p-0 bg-gray-50 sm:bg-transparent rounded-lg sm:rounded-none">
                  <p className="text-xl sm:text-2xl font-bold text-indigo-600">{formatAmount(summary.owedToMe)}</p>
                  <p className="text-sm text-gray-600">Owed To Me</p>
                </div>
                <div key="overdue" className="text-center p-3 sm:p-0 bg-gray-50 sm:bg-transparent rounded-lg sm:rounded-none">
                  <p className="text-xl sm:text-2xl font-bold text-red-600">{formatAmount(summary.overdueAmount)}</p>
                  <p className="text-sm text-gray-600">Overdue ({summary.overdueCount})</p>
                </div>
                <div key="total" className="text-center p-3 sm:p-0 bg-gray-50 sm:bg-transparent rounded-lg sm:rounded-none">
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{summary.total}</p>
                  <p className="text-sm text-gray-600">Total Records</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Borrowing