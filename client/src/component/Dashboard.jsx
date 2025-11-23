import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../layout/Navbar.jsx'

const Dashboard = () => {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/')
      return
    }
  }, [navigate])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                <div className="bg-indigo-50 p-4 sm:p-6 rounded-lg border border-indigo-100">
                  <h3 className="text-sm sm:text-base lg:text-lg font-medium text-indigo-900 mb-2">Total Expenses</h3>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-indigo-600">$0.00</p>
                </div>
                <div className="bg-green-50 p-4 sm:p-6 rounded-lg border border-green-100">
                  <h3 className="text-sm sm:text-base lg:text-lg font-medium text-green-900 mb-2">This Month</h3>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">$0.00</p>
                </div>
                <div className="bg-blue-50 p-4 sm:p-6 rounded-lg border border-blue-100">
                  <h3 className="text-sm sm:text-base lg:text-lg font-medium text-blue-900 mb-2">Budget Left</h3>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">$0.00</p>
                </div>
              </div>

              {/* Additional responsive content area */}
              <div className="mt-6 sm:mt-8">
                <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Quick Actions</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 text-sm sm:text-base">
                      Add Expense
                    </button>
                    <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 text-sm sm:text-base">
                      View Reports
                    </button>
                  </div>
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