import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'

const Sidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  const firstLinkRef = useRef(null)

  // Close on Escape, trap focus to first link when opening, and prevent body scroll
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    if (isOpen) {
      document.addEventListener('keydown', onKey)
      document.body.style.overflow = 'hidden'
      // focus the first link in the sidebar for accessibility
      setTimeout(() => firstLinkRef.current?.focus(), 50)
    } else {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKey)
    }

    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKey)
    }
  }, [isOpen])

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-gray-800 text-white p-2 rounded-md shadow-lg hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          aria-label="Toggle sidebar"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Sidebar overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={
          `fixed left-0 top-0 bottom-0 z-50 w-4/5 sm:w-64 bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out overflow-y-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`
        }
        role={isOpen ? 'dialog' : 'navigation'}
        aria-modal={isOpen}
        aria-hidden={!isOpen && window.innerWidth < 1024}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-4 bg-gray-900">
            <Link to="/dashboard" className="text-white text-xl font-bold hover:text-indigo-100 transition duration-200">
              Budget Buddy
            </Link>
            {/* Close button for mobile */}
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden text-gray-100 p-2 rounded-md hover:bg-gray-700 focus:outline-none"
              aria-label="Close sidebar"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {/* <div className="text-white text-sm mb-4 px-3 py-2 bg-indigo-700 rounded-md">
              Welcome, {user.username || 'User'}!
            </div> */}

            {/* Navigation items can be added here later */}
            <div className="space-y-6">
              <Link
                to="/dashboard"
                ref={firstLinkRef}
                className={`flex items-center px-3 py-2 text-white hover:bg-gray-700 rounded-md transition duration-200 ${location.pathname === '/dashboard' ? 'bg-gray-700' : ''}`}
                onClick={() => { if (window.innerWidth < 1024) setIsOpen(false) }}
              >
                <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                </svg>
                Dashboard
              </Link>
              <Link
                to="/add-income"
                className={`flex items-center px-3 py-2 text-white hover:bg-gray-700 rounded-md transition duration-200 ${location.pathname === '/add-income' ? 'bg-gray-700' : ''}`}
                onClick={() => { if (window.innerWidth < 1024) setIsOpen(false) }}
              >
                <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Income
              </Link>
              <Link
                to="/add-expenses"
                className={`flex items-center px-3 py-2 text-white hover:bg-gray-700 rounded-md transition duration-200 ${location.pathname === '/add-expenses' ? 'bg-gray-700' : ''}`}
                onClick={() => { if (window.innerWidth < 1024) setIsOpen(false) }}
              >
                <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m0 0l-8-4m8 4v10M4 7v10l8 4V11m8-4v10M4 17l8-4" />
                </svg>
                Add Expenses
              </Link>
              <Link
                to="/records"
                className={`flex items-center px-3 py-2 text-white hover:bg-gray-700 rounded-md transition duration-200 ${location.pathname === '/records' ? 'bg-gray-700' : ''}`}
                onClick={() => { if (window.innerWidth < 1024) setIsOpen(false) }}
              >
                <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Records
              </Link>
              <Link
                to="/profile"
                className={`flex items-center px-3 py-2 text-white hover:bg-gray-700 rounded-md transition duration-200 ${location.pathname === '/profile' ? 'bg-gray-700' : ''}`}
                onClick={() => { if (window.innerWidth < 1024) setIsOpen(false) }}
              >
                <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile
              </Link>
            </div>
          </nav>

          {/* Footer with logout */}
          <div className="p-4 border-t border-gray-600">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-3 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-md text-sm font-medium transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
            <div className="text-center text-gray-400 text-xs mt-3">
              Made with ❤️ by Nayan Nikhare
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar