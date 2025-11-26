import React, { useState, useEffect } from 'react'
import Sidebar from '../layout/Sidebar.jsx'
import jsPDF from 'jspdf'

const Records = () => {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, this-month, last-month, etc.

  useEffect(() => {
    fetchExpenses()
  }, [filter])

  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem('token')
      const API_BASE = import.meta.env.VITE_API_BASE || '/api'
      const response = await fetch(`${API_BASE}/expenses`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setExpenses(data)
      }
    } catch (error) {
      console.error('Error fetching expenses:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  // Use a PDF-friendly amount formatter (avoid special currency glyph issues)
  const pdfFormatAmount = (amount) => {
    const formatted = new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)
    return `Rs ${formatted}`
  }

  const getCategoryColor = (category) => {
    const colors = {
      'Food & Dining': 'bg-orange-100 text-orange-800',
      'Transportation': 'bg-blue-100 text-blue-800',
      'Entertainment': 'bg-purple-100 text-purple-800',
      'Shopping': 'bg-pink-100 text-pink-800',
      'Bills & Utilities': 'bg-yellow-100 text-yellow-800',
      'Healthcare': 'bg-red-100 text-red-800',
      'Education': 'bg-green-100 text-green-800',
      'Other': 'bg-gray-100 text-gray-800'
    }
    return colors[category] || colors['Other']
  }

  const downloadRecords = () => {
    if (filteredExpenses.length === 0) return

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 20
    let yPosition = margin

    // Header bar (brand)
    doc.setFillColor(79, 70, 229) // indigo-600
    doc.rect(0, 0, pageWidth, 36, 'F')

    // Title and subtitle
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('Budget Buddy', margin, 20)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text('Expense Records Report', margin, 28)
    doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')} ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`, pageWidth - margin, 20, { align: 'right' })

    yPosition = 46

    // Filter info
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Filter Applied:', margin, yPosition)
    doc.setFont('helvetica', 'normal')
    const filterText = filter === 'all' ? 'All Time' : filter === 'this-month' ? 'This Month' : filter === 'last-month' ? 'Last Month' : 'This Year'
    doc.text(filterText, margin + 36, yPosition)
    yPosition += 10

    // Summary box
    const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    const avgAmount = filteredExpenses.length > 0 ? totalAmount / filteredExpenses.length : 0

    doc.setFillColor(249, 250, 251) // gray-50
    doc.roundedRect(margin - 4, yPosition - 6, pageWidth - 2 * margin + 8, 30, 3, 3, 'F')
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Summary', margin, yPosition + 8)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Total Expenses: ${pdfFormatAmount(totalAmount)}`, margin + 80, yPosition + 8)
    doc.text(`Total Records: ${filteredExpenses.length}`, margin + 80, yPosition + 16)
    doc.text(`Average per Expense: ${pdfFormatAmount(avgAmount)}`, margin + 80, yPosition + 24)

    yPosition += 42

    // Table header
    doc.setFillColor(79, 70, 229) // indigo-600
    const headerHeight = 12
    doc.rect(margin, yPosition, pageWidth - 2 * margin, headerHeight, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')

    // Column widths and positions (dynamic to fit page)
    const availableWidth = pageWidth - 2 * margin
    const colWidths = [
      Math.round(availableWidth * 0.12), // Date
      Math.round(availableWidth * 0.18), // Category
      Math.round(availableWidth * 0.34), // Item (largest)
      Math.round(availableWidth * 0.12), // Amount
      Math.round(availableWidth * 0.12), // Payment
      Math.round(availableWidth * 0.12)  // Attachments
    ]
    // Adjust any rounding difference to ensure total equals availableWidth
    const sumWidths = colWidths.reduce((s, w) => s + w, 0)
    const diff = Math.round(availableWidth - sumWidths)
    if (diff !== 0) colWidths[colWidths.length - 1] += diff

    const colPositions = [margin]
    for (let i = 1; i < colWidths.length; i++) colPositions.push(colPositions[i - 1] + colWidths[i - 1])

    const headers = ['Date', 'Category', 'Item', 'Amount', 'Payment', 'Attachments']
    headers.forEach((header, idx) => {
      doc.text(header, colPositions[idx] + 4, yPosition + 8)
    })

    yPosition += headerHeight + 6

    // Table rows
    doc.setTextColor(0, 0, 0)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    const lineHeight = 6
    let rowCount = 0

    const addHeaderOnNewPage = () => {
      // new page header
      doc.setFillColor(79, 70, 229)
      doc.rect(margin, margin, pageWidth - 2 * margin, headerHeight, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold')
      headers.forEach((header, idx) => {
        doc.text(header, colPositions[idx] + 4, margin + 8)
      })
      doc.setTextColor(0, 0, 0)
      doc.setFont('helvetica', 'normal')
    }

    filteredExpenses.forEach((expense) => {
      // estimate required height for wrapping item text
      const itemText = expense.item || 'N/A'
      const wrapped = doc.splitTextToSize(itemText, colWidths[2] - 6)
      const requiredHeight = Math.max(1, wrapped.length) * lineHeight

      if (yPosition + requiredHeight > pageHeight - 30) {
        doc.addPage()
        yPosition = margin + headerHeight + 8
        addHeaderOnNewPage()
      }

      // alternate row background
      if (rowCount % 2 === 0) {
        doc.setFillColor(249, 250, 251)
        doc.rect(margin, yPosition - 4, pageWidth - 2 * margin, requiredHeight + 4, 'F')
      }

      // values
      const values = [
        formatDate(expense.date),
        expense.category,
        wrapped,
        pdfFormatAmount(expense.amount),
        expense.paymentMode,
        expense.attachments && expense.attachments.length > 0 ? `${expense.attachments.length} files` : 'None'
      ]

      // draw cell values; handle wrapped item text (array)
      doc.text(values[0], colPositions[0] + 4, yPosition)
      doc.text(values[1], colPositions[1] + 4, yPosition)
      doc.text(values[2], colPositions[2] + 4, yPosition)
      // Right-align amount inside its column
      doc.text(values[3], colPositions[3] + colWidths[3] - 4, yPosition, { align: 'right' })
      // Payment mode (left aligned inside its column)
      doc.text(values[4], colPositions[4] + 4, yPosition)
      doc.text(values[5], colPositions[5] + 4, yPosition)

      yPosition += requiredHeight + 4
      rowCount++
    })

    // Footer with pages
    const totalPages = doc.internal.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(128, 128, 128)
      doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' })
      doc.text('Generated by Budget Buddy', margin, pageHeight - 10)
    }

    // Save
    doc.save(`expense-records-${filter}-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  const filteredExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date)
    const now = new Date()
    
    switch (filter) {
      case 'this-month':
        return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear()
      case 'last-month':
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1)
        return expenseDate.getMonth() === lastMonth.getMonth() && expenseDate.getFullYear() === lastMonth.getFullYear()
      case 'this-year':
        return expenseDate.getFullYear() === now.getFullYear()
      default:
        return true
    }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:ml-64 py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="bg-indigo-100 text-indigo-600 rounded-full p-2 sm:p-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Expense Records</h2>
              <p className="text-xs sm:text-sm text-gray-600">View and manage your expense history</p>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="mb-4 sm:mb-6 flex flex-wrap gap-2 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                All Time
              </button>
              <button
                onClick={() => setFilter('this-month')}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  filter === 'this-month' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                This Month
              </button>
              <button
                onClick={() => setFilter('last-month')}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  filter === 'last-month' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Last Month
              </button>
              <button
                onClick={() => setFilter('this-year')}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  filter === 'this-year' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                This Year
              </button>
            </div>
            <button
              onClick={downloadRecords}
              disabled={filteredExpenses.length === 0}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Download PDF
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="bg-white overflow-hidden shadow rounded-lg p-6 sm:p-8 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No expenses found</h3>
              <p className="text-sm sm:text-base text-gray-600">You haven't recorded any expenses yet.</p>
            </div>
          ) : (
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                <table className="min-w-max w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Mode
                      </th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Attachments
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredExpenses.map((expense) => (
                      <tr key={expense._id} className="hover:bg-gray-50">
                        <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(expense.date)}
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(expense.category)}`}>
                            {expense.category}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 text-sm text-gray-900 max-w-xs truncate">
                          {expense.item || 'N/A'}
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatAmount(expense.amount)}
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm text-gray-900">
                          {expense.paymentMode}
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm text-gray-900">
                          {expense.attachments && expense.attachments.length > 0 ? (
                            <div className="flex gap-1">
                              {expense.attachments.map((attachment, index) => (
                                <a
                                  key={index}
                                  href={attachment.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-xs"
                                >
                                  📎 {index + 1}
                                </a>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400">None</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Summary */}
          {filteredExpenses.length > 0 && (
            <div className="mt-6 bg-white overflow-hidden shadow rounded-lg p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Summary</h3>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-bold text-indigo-600">
                    {formatAmount(filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0))}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">Total Expenses</p>
                </div>
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {filteredExpenses.length}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">Total Records</p>
                </div>
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {formatAmount(filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0) / filteredExpenses.length)}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">Average per Expense</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Records