
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import PhoneOnboarding from './pages/phoneOnboarding'
import RiderIdentityForm from './pages/riderIndentityForm'

function App() {

  return (
    <>
    <Router>
      <Routes>
        <Route path='/' element={<PhoneOnboarding />} />
        <Route path='/rider-id-form' element={<RiderIdentityForm />} />
      </Routes>
    </Router>
    </>
  )
}

export default App
