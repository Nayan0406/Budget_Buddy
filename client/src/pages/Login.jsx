import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Modal from '../component/Modal'

const Login = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })

  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  })

  // Forgot password states
  const [showForgotForm, setShowForgotForm] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotPassword, setForgotPassword] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)

  const [showPassword, setShowPassword] = useState(false)

  const closeModal = () => {
    setModal({ ...modal, isOpen: false })
  }

  const handleForgotSubmit = async (e) => {
    e.preventDefault()
    if (forgotPassword.length < 6) {
      setModal({
        isOpen: true,
        title: 'Weak Password',
        message: 'Password must be at least 6 characters.',
        type: 'error'
      })
      return
    }

    try {
      setForgotLoading(true)
      const API_BASE = import.meta.env.VITE_API_BASE || 'https://budget-buddy-backend-five.vercel.app/api'
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, newPassword: forgotPassword })
      })

      if (res.ok) {
        setModal({
          isOpen: true,
          title: 'Password Changed Successfully! 🔐',
          message: 'Your password has been updated. You can now log in with your new password.',
          type: 'success'
        })
        setShowForgotForm(false)
        setForgotEmail('')
        setForgotPassword('')
      } else {
        const data = await res.json().catch(() => ({}))
        setModal({
          isOpen: true,
          title: 'Failed',
          message: data.message || 'Could not change password.',
          type: 'error'
        })
      }
    } catch (err) {
      console.error('Forgot password error', err)
      setModal({ isOpen: true, title: 'Network Error', message: 'Unable to reach server.', type: 'error' })
    } finally {
      setForgotLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || 'https://budget-buddy-backend-five.vercel.app/api'
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        // Store token in localStorage
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        setModal({
          isOpen: true,
          title: 'Welcome back! 🎉',
          message: 'Great to see you again! You\'re now logged in and ready to manage your budget.',
          type: 'success'
        })
        // Redirect to dashboard after showing modal
        setTimeout(() => {
          navigate('/dashboard')
        }, 2000)
      } else {
        setModal({
          isOpen: true,
          title: 'Login Failed',
          message: data.message || 'Invalid credentials. Please try again.',
          type: 'error'
        })
      }
    } catch (error) {
      console.error('Login error:', error)
      setModal({
        isOpen: true,
        title: 'Network Error',
        message: 'Unable to connect to the server. Please check your internet connection and try again.',
        type: 'error'
      })
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 py-6 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-indigo-600 mb-2">
          Budget Buddy
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 px-2">
          Your Personal Expenses Tracker
        </p>
      </div>
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-6 sm:p-8">
        <div>
          <h2 className="text-center text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Sign in to your account
          </h2>
          <p className="text-center text-sm text-gray-600 px-2">
            Welcome back! Please enter your details
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="mt-1 block w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-base sm:text-sm"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="block w-full px-3 py-3 sm:py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-base sm:text-sm"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 sm:py-2 px-4 border border-transparent rounded-md shadow-sm text-base sm:text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
            >
              Sign In
            </button>
          </div>
          <div className="mt-2 text-right">
            <button type="button" className="text-sm text-indigo-600 hover:text-indigo-500" onClick={() => setShowForgotForm(true)}>Forgot password?</button>
          </div>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500 transition duration-150 ease-in-out">
              Go Register
            </Link>
          </p>
        </div>
      </div>
      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />

      {/* Forgot Password Modal */}
      {showForgotForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black opacity-40 z-40" onClick={() => setShowForgotForm(false)} />
          <div className="bg-white rounded-lg shadow-lg z-50 w-full max-w-md mx-auto p-6">
            <button onClick={() => setShowForgotForm(false)} aria-label="Close" className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 z-10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Forgot Password</h3>
            <p className="text-sm text-gray-600 mb-4">Enter your registered email and new password to change your password.</p>
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={forgotPassword}
                  onChange={(e) => setForgotPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowForgotForm(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                <button type="submit" disabled={forgotLoading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">{forgotLoading ? 'Changing...' : 'Change Password'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Login