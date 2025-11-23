import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const Navbar = () => {
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  return (
    <nav className="bg-indigo-600 shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 sm:h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="text-white text-lg sm:text-xl font-bold hover:text-indigo-100 transition duration-200">
              Budget Buddy
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
            {/* <span className="text-white text-xs sm:text-sm lg:text-base">
              Welcome, {user.username || 'User'}
            </span> */}
            <button
              onClick={handleLogout}
              className="bg-indigo-700 hover:bg-indigo-800 text-white px-2 py-1 sm:px-3 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-gray-200 focus:outline-none focus:text-gray-200 p-1"
              aria-label="Toggle menu"
            >
              <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute left-0 right-0 top-full bg-indigo-600 border-t border-indigo-500 shadow-lg">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {/* <div className="text-white text-sm px-3 py-2 border-b border-indigo-500">
                Welcome, {user.username || 'User'}
              </div> */}
              <button
                onClick={handleLogout}
                className="w-full text-left text-white hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar