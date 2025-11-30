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
          buttonColor: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )
        }
      case 'error':
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          buttonColor: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )
        }
      case 'warning':
        return {
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
          buttonColor: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          )
        }
      default:
        return {
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          buttonColor: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        }
    }
  }

  const styles = getTypeStyles()

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto animate-fade-in">
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 backdrop-blur-sm transition-opacity animate-fade-in" onClick={onClose}></div>

        <div className={`relative transform overflow-hidden rounded-xl bg-white text-left shadow-2xl transition-all duration-300 ease-out sm:my-8 sm:w-full sm:max-w-lg border-2 ${styles.borderColor} animate-scale-in`}>
          <div className={`px-6 pb-6 pt-6 sm:p-8 sm:pb-6 ${styles.bgColor}`}>
            <div className="sm:flex sm:items-start">
              <div className={`mx-auto shrink-0 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-lg border-4 ${styles.borderColor} sm:mx-0 sm:h-12 sm:w-12`}>
                <div className={`${styles.textColor}`}>
                  {styles.icon}
                </div>
              </div>
              <div className="mt-4 text-center sm:mt-0 sm:ml-5 sm:text-left flex-1">
                <h3 className={`text-xl font-bold leading-7 ${styles.textColor} mb-2`}>
                  {title}
                </h3>
                <div className="mt-1">
                  <p className={`text-base leading-relaxed ${styles.textColor} opacity-90`}>
                    {message}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-4 sm:flex sm:flex-row-reverse sm:px-8 border-t border-gray-200">
            <button
              type="button"
              className={`inline-flex w-full justify-center rounded-lg px-4 py-3 text-base font-semibold text-white shadow-md transition-all duration-200 sm:ml-3 sm:w-auto hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${styles.buttonColor} transform hover:scale-105`}
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