import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { WalletProvider } from './context/WalletContext'
import { ToastProvider } from './context/ToastContext'
import Navbar from './components/Navbar'
import LandingPage from './pages/LandingPage'
import ProfilePage from './pages/ProfilePage'
import SkillReport from './pages/SkillReport'
import VerifierPage from './pages/VerifierPage'
import Dashboard from './pages/Dashboard'
import Toast from './components/Toast'

export default function App() {
  return (
    <WalletProvider>
      <ToastProvider>
        <Router>
          <div className="min-h-screen bg-dark-bg">
            <Navbar />
            <main className="pt-16">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/report" element={<SkillReport />} />
                <Route path="/verify" element={<VerifierPage />} />
                <Route path="/dashboard" element={<Dashboard />} />
              </Routes>
            </main>
            <Toast />
          </div>
        </Router>
      </ToastProvider>
    </WalletProvider>
  )
}
