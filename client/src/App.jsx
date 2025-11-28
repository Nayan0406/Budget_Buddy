import './App.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './component/Dashboard.jsx'
import AddIncome from './component/AddIncome.jsx'
import AddExpenses from './component/AddExpenses.jsx'
import Borrowing from './component/Borrowing.jsx'
import Records from './component/Records.jsx'
import Profile from './component/Profile.jsx'

function App() {

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/add-income" element={<AddIncome />} />
          <Route path="/add-expenses" element={<AddExpenses />} />
          <Route path="/borrowing" element={<Borrowing />} />
          <Route path="/records" element={<Records />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
