import React from 'react'

const Modal = ({ isOpen, onClose, title, message, type = 'info' }) => {
  if (!isOpen) return null

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
          buttonColor: 'bg-green-600 hover:bg-green-700',
          icon: '✓'
        }
      case 'error':
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          buttonColor: 'bg-red-600 hover:bg-red-700',
          icon: '✕'
        }
      case 'warning':
        return {
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
          buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
          icon: '⚠'
        }
      default:
        return {
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          buttonColor: 'bg-blue-600 hover:bg-blue-700',
          icon: 'ℹ'
        }
    }
  }

  const styles = getTypeStyles()

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className={`relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg ${styles.borderColor}`}>
          <div className={`px-4 pb-4 pt-5 sm:p-6 sm:pb-4 ${styles.bgColor}`}>
            <div className="sm:flex sm:items-start">
              <div className={`mx-auto shrink-0 flex h-12 w-12 items-center justify-center rounded-full ${styles.bgColor} sm:mx-0 sm:h-10 sm:w-10`}>
                <span className={`text-xl ${styles.textColor}`}>{styles.icon}</span>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                <h3 className={`text-lg font-semibold leading-6 ${styles.textColor}`}>
                  {title}
                </h3>
                <div className="mt-2">
                  <p className={`text-sm ${styles.textColor}`}>
                    {message}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              className={`inline-flex w-full justify-center rounded-md px-3 py-3 sm:py-2 text-base sm:text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto ${styles.buttonColor} hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              onClick={onClose}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Modal