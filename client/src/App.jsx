import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom"
import Sidebar from "./components/Sidebar"
import ThreeBackground from "./components/ThreeBackground"
import Home from "./pages/Home"
import Dashboard from "./pages/Dashboard"
import ResumeChecker from "./pages/ResumeChecker"
import InterviewRoom from "./components/InterviewRoom"
import AptitudeTest from "./pages/AptitudeTest"
import EyeTracking from "./pages/EyeTracking"
import SpeakingPace from "./pages/SpeakingPace"
import Login from "./pages/Login"
import SignUp from "./pages/SignUp"
import "./App.css"

function AppContent() {
  const navigate = useNavigate()
  const location = useLocation()
  const isHomePage = location.pathname === "/home" || location.pathname === "/"
  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup"

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {!isHomePage && !isAuthPage && <ThreeBackground />}
      <div className="relative z-10 flex">
        {!isHomePage && !isAuthPage && (
          <Sidebar currentPath={location.pathname} onNavigate={(path) => navigate(path)} />
        )}
        <main className={`flex-1 transition-all duration-300 ${!isHomePage && !isAuthPage ? "lg:ml-64" : ""}`}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/resume" element={<ResumeChecker />} />
            <Route path="/interview" element={<InterviewRoom />} />
            <Route path="/aptitude" element={<AptitudeTest />} />
            <Route path="/eye-tracking" element={<EyeTracking />} />
            <Route path="/speaking" element={<SpeakingPace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
