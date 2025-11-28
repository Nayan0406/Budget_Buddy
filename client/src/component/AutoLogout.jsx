import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

// AutoLogout: logs out user after a period of inactivity
// Default timeout set to 10 minutes for now (10 * 60 * 1000 ms)
const AutoLogout = ({ timeout = 10 * 60 * 1000 }) => {
  const navigate = useNavigate()
  const timerRef = useRef(null)
  const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll']

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return // only run when logged in

    const logout = () => {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // optional: notify user
      try {
        // small non-blocking alert; you can replace with app toast if available
        // eslint-disable-next-line no-alert
        alert('You have been logged out due to 10 minutes of inactivity.')
      } catch (e) {}
      navigate('/')
    }

    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(logout, timeout)
    }

    // attach listeners
    events.forEach((ev) => window.addEventListener(ev, resetTimer))
    // also reset on visibility change (user returned)
    const onVisibility = () => {
      if (!document.hidden) resetTimer()
    }
    document.addEventListener('visibilitychange', onVisibility)

    // start timer
    resetTimer()

    return () => {
      // cleanup
      if (timerRef.current) clearTimeout(timerRef.current)
      events.forEach((ev) => window.removeEventListener(ev, resetTimer))
      document.removeEventListener('visibilitychange', onVisibility)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}

export default AutoLogout
