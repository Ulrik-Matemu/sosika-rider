
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import PhoneOnboarding from './pages/phoneOnboarding'
import RiderIdentityForm from './pages/riderIndentityForm'
import { Dashboard } from './pages/dashboard'

function App() {

  return (
    <>
    <Router>
      <Routes>
        <Route path='/' element={<PhoneOnboarding />} />
        <Route path='/rider-id-form' element={<RiderIdentityForm />} />
        <Route path='/dashboard' element={<Dashboard />} />
      </Routes>
    </Router>
    </>
  )
}

export default App
