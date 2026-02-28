import { useState } from "react"
import { 
  Home as HomeIcon,
  LayoutDashboard, 
  FileText, 
  Video, 
  Brain, 
  Eye, 
  Mic,
  Menu,
  X
} from "lucide-react"
import { cn } from "../lib/utils"

const menuItems = [
  { icon: HomeIcon, label: "Home", path: "/home" },
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: FileText, label: "ATS Resume Checker", path: "/resume" },
  { icon: Video, label: "Interview Room", path: "/interview" },
  { icon: Eye, label: "Eye Movement", path: "/eye-tracking" },
  { icon: Mic, label: "Speaking Pace", path: "/speaking" },
  { icon: Brain, label: "Aptitude Test", path: "/aptitude" },
]

export default function Sidebar({ currentPath, onNavigate }) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="fixed top-4 left-4 z-50 lg:hidden glass p-2 rounded-lg text-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full glass-strong transition-all duration-300 z-40",
          "border-r border-white/10",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          "w-64"
        )}
      >
        <div className="flex flex-col h-full p-6">
          {/* Logo */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold gradient-text">InterviewAI</h1>
            <p className="text-sm text-white/60 mt-1">Your AI Interview Coach</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = currentPath === item.path

              return (
                <button
                  key={item.path}
                  onClick={() => {
                    onNavigate(item.path)
                    setIsOpen(false)
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                    "text-left group relative overflow-hidden",
                    isActive
                      ? "bg-gradient-to-r from-purple-600/30 to-blue-600/30 text-white shadow-lg shadow-purple-500/20"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  )}
                >
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20",
                    "opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  )} />
                  <Icon 
                    size={20} 
                    className={cn(
                      "relative z-10 transition-transform duration-200",
                      isActive && "scale-110"
                    )} 
                  />
                  <span className="relative z-10 font-medium">{item.label}</span>
                  {isActive && (
                    <div className="absolute right-2 w-1 h-8 bg-gradient-to-b from-purple-400 to-blue-400 rounded-full" />
                  )}
                </button>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="mt-auto pt-6 border-t border-white/10">
            <div className="glass rounded-lg p-4">
              <p className="text-xs text-white/60">Powered by AI</p>
              <p className="text-xs text-white/40 mt-1">v1.0.0</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}

