import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../layout/Sidebar.jsx'

const Dashboard = () => {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  // Utility function to format currency in INR
  const formatINR = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`
  }

  // Filters for Udhar (debt) view
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 6 }).map((_, i) => currentYear - i)
  const months = [
    'All',
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [selectedMonth, setSelectedMonth] = useState('All')
  const [udharAmount, setUdharAmount] = useState(0)

  // Income data
  const [totalIncome, setTotalIncome] = useState(0)
  const [yearIncome, setYearIncome] = useState(0)
  const [monthIncome, setMonthIncome] = useState(0)
  const [budgetLeft, setBudgetLeft] = useState(0)
  const [incomes, setIncomes] = useState([])
  const [expenses, setExpenses] = useState([])
  const [borrowings, setBorrowings] = useState([])
  const [loading, setLoading] = useState(true)

  // Placeholder: compute udhar amount based on selected filters
  useEffect(() => {
    // TODO: replace this with real API call that returns user's udhar/debt for the selected period
    // For now it's a stub that returns 0.00
    const computeUdhar = () => {
      // Example: fetch(`/api/udhar?year=${selectedYear}&month=${selectedMonth}`)
      //   .then(res => res.json()).then(data => setUdharAmount(data.amount))
      setUdharAmount(0)
    }

    computeUdhar()
  }, [selectedYear, selectedMonth])

  // Generate monthly income data for the chart from actual incomes
  const generateChartData = (year, month, incomesData) => {
    if (month === 'All') {
      const monthlyData = Array(12).fill(0)
      incomesData.forEach(income => {
        const date = new Date(income.date)
        if (date.getFullYear() === year) {
          const monthIndex = date.getMonth()
          monthlyData[monthIndex] += income.amount
        }
      })
      return monthlyData
    } else {
      // For specific month, show data for all months but highlight the selected one
      // For now, just return all months data
      const monthlyData = Array(12).fill(0)
      incomesData.forEach(income => {
        const date = new Date(income.date)
        if (date.getFullYear() === year) {
          const monthIndex = date.getMonth()
          monthlyData[monthIndex] += income.amount
        }
      })
      return monthlyData
    }
  }
  // Generate expense category data for pie chart
  const generateExpenseCategories = (expensesData, year, month) => {
    const filteredExpenses = expensesData.filter(expense => {
      const expenseDate = new Date(expense.date)
      if (month === 'All') {
        return expenseDate.getFullYear() === year
      } else {
        const monthIndex = months.indexOf(month) - 1
        return expenseDate.getFullYear() === year && expenseDate.getMonth() === monthIndex
      }
    })

    const categoryTotals = {}
    filteredExpenses.forEach(expense => {
      const category = expense.category || 'Other'
      categoryTotals[category] = (categoryTotals[category] || 0) + expense.amount
    })

    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
  }

  const expenseCategories = generateExpenseCategories(expenses, selectedYear, selectedMonth)

  // Get upcoming borrowing reminders
  const getUpcomingReminders = (borrowingsData) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Reset time to start of day

    console.log('Today:', today.toISOString().split('T')[0])
    console.log('Total borrowings:', borrowingsData.length)

    const filtered = borrowingsData.filter(borrowing => {
      console.log('Checking borrowing:', borrowing._id, {
        reminderEnabled: borrowing.reminder?.enabled,
        status: borrowing.status,
        dueDate: borrowing.dueDate,
        reminderDays: borrowing.reminder?.daysBefore,
        type: borrowing.type,
        counterparty: borrowing.counterparty
      })

      if (!borrowing.reminder?.enabled) {
        console.log('Filtered out: reminder not enabled')
        return false
      }

      if (borrowing.status === 'paid') {
        console.log('Filtered out: status is paid')
        return false
      }

      if (!borrowing.dueDate) {
        console.log('Filtered out: no due date')
        return false
      }

      const dueDate = new Date(borrowing.dueDate)
      dueDate.setHours(0, 0, 0, 0)

      const reminderDate = new Date(dueDate)
      reminderDate.setDate(dueDate.getDate() - (borrowing.reminder?.daysBefore || 3))

      const isWithinPeriod = today >= reminderDate && today <= dueDate

      console.log('Date check:', {
        dueDate: dueDate.toISOString().split('T')[0],
        reminderDate: reminderDate.toISOString().split('T')[0],
        today: today.toISOString().split('T')[0],
        isWithinPeriod
      })

      return isWithinPeriod
    }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))

    console.log('Filtered reminders:', filtered.length)
    return filtered
  }

  const upcomingReminders = getUpcomingReminders(borrowings)

  // Fetch incomes and expenses and calculate totals
  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token')
      const API_BASE = import.meta.env.VITE_API_BASE || '/api'

      // Fetch incomes
      const incomeResponse = await fetch(`${API_BASE}/income`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      // Fetch expenses
      const expenseResponse = await fetch(`${API_BASE}/expenses`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      // Fetch borrowings
      const borrowingResponse = await fetch(`${API_BASE}/borrowings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      let incomeData = []
      let expenseData = []
      let borrowingData = []

      if (incomeResponse.ok) {
        incomeData = await incomeResponse.json()
        setIncomes(incomeData)

        // Calculate total income (all time)
        const total = incomeData.reduce((sum, income) => sum + income.amount, 0)
        setTotalIncome(total)
      }

      if (expenseResponse.ok) {
        expenseData = await expenseResponse.json()
        setExpenses(expenseData)
      }

      if (borrowingResponse.ok) {
        borrowingData = await borrowingResponse.json()
        setBorrowings(borrowingData)
      }

      // Calculate for current selections
      calculateAmounts(incomeData, expenseData, selectedYear, selectedMonth)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate amounts for selected year and month
  const calculateAmounts = (incomesData, expensesData, year, month) => {
    // Year income: total for selected year
    const yearTotal = incomesData
      .filter(income => new Date(income.date).getFullYear() === year)
      .reduce((sum, income) => sum + income.amount, 0)
    setYearIncome(yearTotal)

    // Month income and budget left: income - expense for selected month or current month if "All"
    let monthIncomeTotal = 0
    let monthExpenseTotal = 0
    if (month === 'All') {
      const now = new Date()
      monthIncomeTotal = incomesData
        .filter(income => {
          const incomeDate = new Date(income.date)
          return incomeDate.getMonth() === now.getMonth() &&
                 incomeDate.getFullYear() === now.getFullYear()
        })
        .reduce((sum, income) => sum + income.amount, 0)
      monthExpenseTotal = expensesData
        .filter(expense => {
          const expenseDate = new Date(expense.date)
          return expenseDate.getMonth() === now.getMonth() &&
                 expenseDate.getFullYear() === now.getFullYear()
        })
        .reduce((sum, expense) => sum + expense.amount, 0)
    } else {
      const monthIndex = months.indexOf(month) - 1
      monthIncomeTotal = incomesData
        .filter(income => {
          const incomeDate = new Date(income.date)
          return incomeDate.getFullYear() === year && incomeDate.getMonth() === monthIndex
        })
        .reduce((sum, income) => sum + income.amount, 0)
      monthExpenseTotal = expensesData
        .filter(expense => {
          const expenseDate = new Date(expense.date)
          return expenseDate.getFullYear() === year && expenseDate.getMonth() === monthIndex
        })
        .reduce((sum, expense) => sum + expense.amount, 0)
    }
    setMonthIncome(monthIncomeTotal)
    setBudgetLeft(monthIncomeTotal - monthExpenseTotal)
  }

  // Responsive SVG line chart component (measures container width)
  const IncomeChart = ({ data = [] }) => {
    const containerRef = React.useRef(null)
    const [cw, setCw] = React.useState(600)

    React.useEffect(() => {
      const el = containerRef.current
      if (!el) return
      const update = () => setCw(Math.max(320, Math.floor(el.clientWidth)))
      update()

      if (typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(() => update())
        ro.observe(el)
        return () => ro.disconnect()
      }

      window.addEventListener('resize', update)
      return () => window.removeEventListener('resize', update)
    }, [])

    const width = cw
    const height = 220
    const padding = 30
    const max = Math.max(...data, 1)
    const monthsShort = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    const fontSmall = Math.max(9, Math.round(width / 72))

    // Generate smooth curved path for the line
    const generateSmoothPath = (data) => {
      if (data.length < 2) return ''

      const points = data.map((d, i) => ({
        x: padding + i * ((width - padding * 2) / (data.length - 1)),
        y: padding + (height - padding * 2) * (1 - d / max)
      }))

      let path = `M ${points[0].x} ${points[0].y}`

      for (let i = 0; i < points.length - 1; i++) {
        const current = points[i]
        const next = points[i + 1]
        const controlX1 = current.x + (next.x - current.x) * 0.5
        const controlY1 = current.y
        const controlX2 = next.x - (next.x - current.x) * 0.5
        const controlY2 = next.y

        path += ` C ${controlX1} ${controlY1} ${controlX2} ${controlY2} ${next.x} ${next.y}`
      }

      return path
    }

    // Generate area fill path
    const generateAreaPath = (data) => {
      const linePath = generateSmoothPath(data)
      if (!linePath) return ''

      const points = data.map((d, i) => ({
        x: padding + i * ((width - padding * 2) / (data.length - 1)),
        y: padding + (height - padding * 2) * (1 - d / max)
      }))

      const bottomY = height - padding
      return `${linePath} L ${points[points.length - 1].x} ${bottomY} L ${points[0].x} ${bottomY} Z`
    }

    const linePath = generateSmoothPath(data)
    const areaPath = generateAreaPath(data)

    return (
      <div ref={containerRef} className="w-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-56">
          <defs>
            {/* Gradient for area fill */}
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.05" />
            </linearGradient>

            {/* Gradient for line */}
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>

            {/* Drop shadow filter */}
            <filter id="dropshadow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
              <feOffset dx="1" dy="1" result="offset" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.3"/>
              </feComponentTransfer>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* y grid lines */}
          {[0, .25, .5, .75, 1].map((t, idx) => {
            const y = padding + (1 - t) * (height - padding * 2)
            const val = Math.round(max * t)
            return (
              <g key={idx}>
                <line x1={padding} x2={width - padding} y1={y} y2={y} stroke="#f1f5f9" strokeWidth={1} />
                <text x={6} y={y + 4} fontSize={fontSmall} fill="#64748b" fontWeight="500">{formatINR(val)}</text>
              </g>
            )
          })}

          {/* area fill */}
          <path d={areaPath} fill="url(#areaGradient)" />

          {/* line */}
          <path
            d={linePath}
            stroke="url(#lineGradient)"
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#dropshadow)"
          />

          {/* data points */}
          {data.map((d, i) => {
            const x = padding + i * ((width - padding * 2) / (data.length - 1))
            const y = padding + (height - padding * 2) * (1 - d / max)
            return (
              <g key={i}>
                <circle
                  cx={x}
                  cy={y}
                  r={5}
                  fill="#ffffff"
                  stroke="url(#lineGradient)"
                  strokeWidth={3}
                  filter="url(#dropshadow)"
                />
                <circle
                  cx={x}
                  cy={y}
                  r={2}
                  fill="url(#lineGradient)"
                />
              </g>
            )
          })}

          {/* x-axis labels */}
          {data.map((d, i) => {
            const x = padding + i * ((width - padding * 2) / (data.length - 1))
            return (
              <text key={i} x={x} y={height - padding + (fontSmall + 6)} fontSize={fontSmall} fill="#475569" textAnchor="middle" fontWeight="500">{monthsShort[i]}</text>
            )
          })}
        </svg>
        <div className="text-xs text-gray-500 mt-2 text-center">Values shown in <span className="font-medium">₹</span></div>
      </div>
    )
  }

  // Responsive SVG pie chart component for expense categories
  const ExpensePieChart = ({ data = [] }) => {
    const containerRef = React.useRef(null)
    const [cw, setCw] = React.useState(600)

    React.useEffect(() => {
      const el = containerRef.current
      if (!el) return
      const update = () => setCw(Math.max(320, Math.floor(el.clientWidth)))
      update()

      if (typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(() => update())
        ro.observe(el)
        return () => ro.disconnect()
      }

      window.addEventListener('resize', update)
      return () => window.removeEventListener('resize', update)
    }, [])

    if (data.length === 0) {
      return (
        <div ref={containerRef} className="w-full flex items-center justify-center h-64">
          <p className="text-gray-500 text-sm">No expense data available</p>
        </div>
      )
    }

    const width = Math.min(cw, 400)
    const height = 300
    const radius = Math.min(width, height) / 2 - 40
    const centerX = width / 2
    const centerY = height / 2

    const total = data.reduce((sum, item) => sum + item.amount, 0)
    const colors = [
      '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
      '#3b82f6', '#ef4444', '#84cc16', '#f97316', '#06b6d4'
    ]

    let currentAngle = -Math.PI / 2 // Start from top

    const slices = data.map((item, index) => {
      const percentage = item.amount / total
      const angle = percentage * 2 * Math.PI
      const startAngle = currentAngle
      const endAngle = currentAngle + angle

      // Calculate path for pie slice
      const x1 = centerX + radius * Math.cos(startAngle)
      const y1 = centerY + radius * Math.sin(startAngle)
      const x2 = centerX + radius * Math.cos(endAngle)
      const y2 = centerY + radius * Math.sin(endAngle)

      const largeArcFlag = angle > Math.PI ? 1 : 0

      const pathData = [
        `M ${centerX} ${centerY}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ')

      // Calculate label position
      const labelAngle = startAngle + angle / 2
      const labelRadius = radius * 0.7
      const labelX = centerX + labelRadius * Math.cos(labelAngle)
      const labelY = centerY + labelRadius * Math.sin(labelAngle)

      currentAngle = endAngle

      return {
        ...item,
        pathData,
        color: colors[index % colors.length],
        percentage,
        labelX,
        labelY,
        labelAngle
      }
    })

    return (
      <div ref={containerRef} className="w-full">
        <div className="flex flex-col items-center gap-4">
          <div className="w-full max-w-lg mx-auto">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
              <defs>
                {/* Drop shadow filter */}
                <filter id="pieShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
                  <feOffset dx="1" dy="1" result="offset" />
                  <feComponentTransfer>
                    <feFuncA type="linear" slope="0.3"/>
                  </feComponentTransfer>
                  <feMerge>
                    <feMergeNode/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {/* Pie slices */}
              {slices.map((slice, index) => (
                <path
                  key={index}
                  d={slice.pathData}
                  fill={slice.color}
                  stroke="#ffffff"
                  strokeWidth="2"
                  filter="url(#pieShadow)"
                />
              ))}

              {/* Labels for larger slices */}
              {slices.filter(slice => slice.percentage > 0.05).map((slice, index) => (
                <text
                  key={`label-${index}`}
                  x={slice.labelX}
                  y={slice.labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="12"
                  fontWeight="600"
                  fill="#ffffff"
                  style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}
                >
                  {Math.round(slice.percentage * 100)}%
                </text>
              ))}
            </svg>
          </div>

          {/* Legend */}
          <div className="w-full">
            <h4 className="text-center text-sm font-semibold text-gray-900 mb-2">Expense Categories</h4>

            <div className="flex gap-3 overflow-x-auto px-2 sm:flex-wrap sm:justify-center">
              {slices.map((slice, index) => (
                <div key={index} className="shrink-0 flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: slice.color }}
                  ></div>
                  <span className="text-xs text-gray-700 font-medium">{slice.category}</span>
                  <span className="text-xs font-semibold text-gray-900">{formatINR(slice.amount)}</span>
                  <span className="text-xs text-gray-500">({Math.round(slice.percentage * 100)}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/')
      return
    }

    // Fetch data
    fetchData()
  }, [navigate])

  // Recalculate amounts when filters change
  useEffect(() => {
    if (incomes.length >= 0 && expenses.length >= 0) {
      calculateAmounts(incomes, expenses, selectedYear, selectedMonth)
    }
  }, [selectedYear, selectedMonth, incomes, expenses])

  const chartData = generateChartData(selectedYear, selectedMonth, incomes)

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:ml-64 lg:pt-0">
        <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          <div className="py-4 sm:py-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6 lg:p-8">
                <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                  Welcome to Budget Buddy, {user.username || 'User'}!
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                  Start managing your expenses and take control of your finances.
                </p>

                  {/* Placeholder for future dashboard content */}
                <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500 mb-1">Year</span>
                      <div className="relative">
                        <select
                          value={selectedYear}
                          onChange={(e) => setSelectedYear(Number(e.target.value))}
                          className="appearance-none bg-white border border-gray-200 px-4 py-2 pr-8 rounded-lg shadow-sm min-w-[110px] focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        >
                          {years.map((y) => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                        <svg className="pointer-events-none absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                          <path d="M6 8l4 4 4-4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500 mb-1">Month</span>
                      <div className="relative">
                        <select
                          value={selectedMonth}
                          onChange={(e) => setSelectedMonth(e.target.value)}
                          className="appearance-none bg-white border border-gray-200 px-4 py-2 pr-8 rounded-lg shadow-sm min-w-[140px] focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        >
                          {months.map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                        <svg className="pointer-events-none absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                          <path d="M6 8l4 4 4-4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs sm:text-sm text-gray-600">Showing: <span className="font-medium">{selectedMonth} {selectedYear}</span></div>
                </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                    <div className="bg-indigo-50 p-3 sm:p-4 lg:p-6 rounded-lg border border-indigo-100">
                      <h3 className="text-sm sm:text-base lg:text-lg font-medium text-indigo-900 mb-2">Total Income</h3>
                      <p className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-indigo-600">
                        {loading ? '...' : formatINR(yearIncome)}
                      </p>
                    </div>
                    <div className="bg-green-50 p-3 sm:p-4 lg:p-6 rounded-lg border border-green-100">
                      <h3 className="text-sm sm:text-base lg:text-lg font-medium text-green-900 mb-2">
                        This Month
                      </h3>
                        <p className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-green-600">
                          {loading ? '...' : formatINR(monthIncome)}
                        </p>
                      </div>
                    <div className="bg-blue-50 p-3 sm:p-4 lg:p-6 rounded-lg border border-blue-100">
                      <h3 className="text-sm sm:text-base lg:text-lg font-medium text-blue-900 mb-2">Budget Left</h3>
                      <p className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-blue-600">
                        {loading ? '...' : formatINR(budgetLeft)}
                      </p>
                    </div>
                  </div>

                  {/* Income chart */}
                  <div className="mt-6">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">
                      Income Overview — {selectedMonth === 'All' ? selectedYear : `${selectedMonth} ${selectedYear}`}
                    </h2>
                    <IncomeChart data={chartData} />
                  </div>

                  {/* Expense Categories Pie Chart */}
                  <div className="mt-8">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">
                      Expense Categories — {selectedMonth === 'All' ? selectedYear : `${selectedMonth} ${selectedYear}`}
                    </h2>
                    <ExpensePieChart data={expenseCategories} />
                  </div>

                  {/* Upcoming Borrowing Reminders */}
                  {upcomingReminders.length > 0 && (
                    <div className="mt-6">
                      <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        Upcoming Reminders ({upcomingReminders.length})
                      </h2>
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <div className="space-y-3">
                          {upcomingReminders.map((reminder) => {
                            const dueDate = new Date(reminder.dueDate)
                            const today = new Date()
                            today.setHours(0, 0, 0, 0)
                            const daysLeft = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24))

                            return (
                              <div key={reminder._id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-100">
                                <div className="flex items-center gap-3">
                                  <div className={`w-3 h-3 rounded-full ${daysLeft <= 0 ? 'bg-red-500' : daysLeft <= 1 ? 'bg-orange-500' : 'bg-yellow-500'}`}></div>
                                  <div>
                                    <div className="font-medium text-sm text-gray-900">
                                      {reminder.counterparty?.name || 'Unknown'}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {reminder.type === 'borrowed' ? 'You owe' : 'Owes you'} • {formatINR(reminder.remaining ?? reminder.amount)}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-medium text-gray-900">
                                    {daysLeft <= 0 ? 'Due today' : daysLeft === 1 ? 'Due tomorrow' : `Due in ${daysLeft} days`}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {dueDate.toLocaleDateString('en-IN')}
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                        <div className="mt-3 text-center">
                          <button
                            onClick={() => navigate('/borrowings')}
                            className="text-sm text-orange-600 hover:text-orange-700 font-medium hover:underline"
                          >
                            View all borrowings →
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard