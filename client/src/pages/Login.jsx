import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Modal from '../component/Modal'

const Login = () => {
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

  const closeModal = () => {
    setModal({ ...modal, isOpen: false })
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
      const response = await fetch('http://localhost:5000/api/auth/login', {
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
          title: 'Login Successful!',
          message: 'Welcome back to Budget Buddy!',
          type: 'success'
        })
        // You can redirect to dashboard here
        // window.location.href = '/dashboard'
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
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-base sm:text-sm"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />
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
    </div>
  )
}

export default Login