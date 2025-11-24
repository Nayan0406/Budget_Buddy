import './App.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './component/Dashboard.jsx'
import AddIncome from './component/AddIncome.jsx'
import AddExpenses from './component/AddExpenses.jsx'
import ViewReport from './component/ViewReport.jsx'
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
          <Route path="/view-report" element={<ViewReport />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
