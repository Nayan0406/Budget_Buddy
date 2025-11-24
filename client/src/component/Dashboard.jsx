import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../layout/Sidebar.jsx'

const Dashboard = () => {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

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
  const [incomes, setIncomes] = useState([])
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
  const chartData = generateChartData(selectedYear, selectedMonth, incomes)

  // Format number as INR string with rupee symbol
  const formatINR = (value) => {
    try {
      return value.toLocaleString('en-IN', { maximumFractionDigits: 0 })
    } catch (e) {
      return value
    }
  }

  // Fetch incomes and calculate totals
  const fetchIncomes = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/income', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setIncomes(data)

        // Calculate total income (all time)
        const total = data.reduce((sum, income) => sum + income.amount, 0)
        setTotalIncome(total)

        // Calculate for current selections
        calculateIncomes(data, selectedYear, selectedMonth)
      }
    } catch (error) {
      console.error('Error fetching incomes:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate incomes for selected year and month
  const calculateIncomes = (incomesData, year, month) => {
    // Year income: total for selected year
    const yearTotal = incomesData
      .filter(income => new Date(income.date).getFullYear() === year)
      .reduce((sum, income) => sum + income.amount, 0)
    setYearIncome(yearTotal)

    // Month income: for selected month or current month if "All"
    let monthTotal = 0
    if (month === 'All') {
      const now = new Date()
      monthTotal = incomesData
        .filter(income => {
          const incomeDate = new Date(income.date)
          return incomeDate.getMonth() === now.getMonth() &&
                 incomeDate.getFullYear() === now.getFullYear()
        })
        .reduce((sum, income) => sum + income.amount, 0)
    } else {
      const monthIndex = months.indexOf(month) - 1
      monthTotal = incomesData
        .filter(income => {
          const incomeDate = new Date(income.date)
          return incomeDate.getFullYear() === year && incomeDate.getMonth() === monthIndex
        })
        .reduce((sum, income) => sum + income.amount, 0)
    }
    setMonthIncome(monthTotal)
  }

  // Responsive SVG bar chart component (measures container width)
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
    const barWidth = Math.max(18, (width - padding * 2) / data.length)
    const monthsShort = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    const fontSmall = Math.max(9, Math.round(width / 72))

    return (
      <div ref={containerRef} className="w-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-56">
          {/* y grid lines */}
          {[0, .25, .5, .75, 1].map((t, idx) => {
            const y = padding + (1 - t) * (height - padding * 2)
            const val = Math.round(max * t)
            return (
              <g key={idx}>
                <line x1={padding} x2={width - padding} y1={y} y2={y} stroke="#eef2ff" strokeWidth={1} />
                <text x={6} y={y + 4} fontSize={fontSmall} fill="#94a3b8">{formatINR(val)}</text>
              </g>
            )
          })}

          {/* bars */}
          {data.map((d, i) => {
            const x = padding + i * barWidth + 6
            const h = (d / max) * (height - padding * 2)
            const y = padding + (height - padding * 2 - h)
            return (
              <g key={i}>
                <rect x={x} y={y} width={Math.max(8, barWidth - 12)} height={h} rx={6} fill="#6366f1" opacity={0.95} />
                <text x={x + Math.max(4, (barWidth - 12) / 2)} y={height - padding + (fontSmall + 6)} fontSize={fontSmall} fill="#334155" textAnchor="middle">{monthsShort[i]}</text>
              </g>
            )
          })}
        </svg>
        <div className="text-xs text-gray-500 mt-2">Values shown in <span className="font-medium">₹</span></div>
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

    // Fetch incomes
    fetchIncomes()
  }, [navigate])

  // Recalculate incomes when filters change
  useEffect(() => {
    if (incomes.length > 0) {
      calculateIncomes(incomes, selectedYear, selectedMonth)
    }
  }, [selectedYear, selectedMonth, incomes])

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:ml-64">
        <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          <div className="py-4 sm:py-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6 lg:p-8">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
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

                  <div className="text-sm text-gray-600">Showing: <span className="font-medium">{selectedMonth} {selectedYear}</span></div>
                </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                    <div className="bg-indigo-50 p-4 sm:p-6 rounded-lg border border-indigo-100">
                      <h3 className="text-sm sm:text-base lg:text-lg font-medium text-indigo-900 mb-2">Total Income</h3>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-indigo-600">
                        {loading ? '...' : `₹${formatINR(yearIncome)}`}
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 sm:p-6 rounded-lg border border-green-100">
                        <h3 className="text-sm sm:text-base lg:text-lg font-medium text-green-900 mb-2">
                          This Month
                        </h3>
                        <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">
                          {loading ? '...' : `₹${formatINR(monthIncome)}`}
                        </p>
                      </div>
                    <div className="bg-blue-50 p-4 sm:p-6 rounded-lg border border-blue-100">
                      <h3 className="text-sm sm:text-base lg:text-lg font-medium text-blue-900 mb-2">Budget Left</h3>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">₹0.00</p>
                    </div>
                  </div>

                  {/* Income chart */}
                  <div className="mt-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">
                      Income Overview — {selectedMonth === 'All' ? selectedYear : `${selectedMonth} ${selectedYear}`}
                    </h2>
                    <IncomeChart data={chartData} />
                  </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard