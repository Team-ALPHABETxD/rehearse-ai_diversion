import { useNavigate } from "react-router-dom"
import { ArrowRight, Sparkles, Target, Zap, TrendingUp } from "lucide-react"
import { Button } from "../components/ui/button"
import heroImage from "../assets/hero-illustration.png"

const navItems = [
  { label: "Home", path: "/home" },
  { label: "Login", path: "/login" },
  { label: "Signup", path: "/signup" },
  { label: "Dashboard", path: "/dashboard" },
  { label: "Contact Us", path: "/home#contact" },
]

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Analysis",
    description: "Get real-time feedback on your interview performance",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Target,
    title: "ATS Resume Checker",
    description: "Optimize your resume for Applicant Tracking Systems",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Zap,
    title: "Practice Interviews",
    description: "Record and analyze your responses with AI insights",
    color: "from-yellow-500 to-orange-500",
  },
  {
    icon: TrendingUp,
    title: "Track Progress",
    description: "Monitor your improvement with detailed analytics",
    color: "from-green-500 to-emerald-500",
  },
]

function FeatureCard({ feature, Icon }) {
  return (
    <div className="relative glass-strong rounded-2xl p-6 lg:p-8 border border-white/10">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
        <Icon className="text-white" size={24} />
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
      <p className="text-white/60 text-sm leading-relaxed">{feature.description}</p>
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()

  const handleNavClick = (path) => {
    if (path === "/home#contact") {
      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })
    } else {
      navigate(path)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-slate-950/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold gradient-text">RehearseAI</h1>
              <span className="text-[10px] text-white/50 uppercase tracking-wider hidden sm:inline">
                Tech Driven Hiring
              </span>
            </div>
            <div className="flex items-center flex-wrap gap-3 sm:gap-4 lg:gap-6">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavClick(item.path)}
                  className="text-sm text-white/80 hover:text-white transition-colors"
                >
                  {item.label}
                </button>
              ))}
              <Button
                size="sm"
                onClick={() => navigate("/signup")}
                className="flex items-center gap-1.5 px-4 py-2 text-sm"
              >
                Get Started
                <ArrowRight size={14} />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative z-10 container mx-auto px-6 lg:px-12 pt-28 pb-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="inline-block glass px-3 py-1.5 rounded-full text-xs text-white/80 font-medium">
              AI-Powered Interview Simulator
            </span>
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
              <span className="gradient-text">Master Your</span>
              <br />
              <span className="text-white">Interview Skills</span>
            </h1>
            <p className="text-lg text-white/70 leading-relaxed max-w-lg">
              Practice with AI-powered feedback on resumes, video interviews, eye contact, speaking pace,
              and aptitude tests. Get personalized insights to ace your next interview.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="sm"
                onClick={() => navigate("/signup")}
                className="flex items-center gap-2 px-5 py-2.5"
              >
                Start Practicing
                <ArrowRight size={16} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/login")}
                className="px-5 py-2.5 border-white/20 text-white/80"
              >
                I already have an account
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-6 pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold gradient-text">10K+</div>
                <div className="text-xs text-white/60 mt-1">Students</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold gradient-text">95%</div>
                <div className="text-xs text-white/60 mt-1">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold gradient-text">24/7</div>
                <div className="text-xs text-white/60 mt-1">Available</div>
              </div>
            </div>
          </div>
          <div className="relative h-[320px] sm:h-[380px] lg:h-[480px] rounded-2xl overflow-hidden glass-strong border border-white/10 flex items-center justify-center bg-slate-900/50">
            <img
              src={heroImage}
              alt="Mock interview platform - analytics, video, and coding tools"
              className="w-full h-full object-cover object-center"
            />
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 lg:mt-28">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-2">Powerful Features</h2>
            <p className="text-white/60">Everything you need to prepare for your dream job</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon
              return <FeatureCard key={feature.title} feature={feature} Icon={Icon} />
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 lg:mt-28 text-center">
          <div className="glass-strong rounded-2xl p-10 lg:p-14 max-w-3xl mx-auto border border-white/10">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Ready to Ace Your Next Interview?
            </h2>
            <p className="text-white/70 mb-6 max-w-xl mx-auto">
              Join thousands of students who have improved their interview skills with our AI-powered platform.
            </p>
            <Button size="sm" onClick={() => navigate("/signup")} className="px-6 py-2.5">
              Get Started — It&apos;s Free
            </Button>
          </div>
        </div>

        {/* Contact */}
        <div id="contact" className="mt-20 lg:mt-28 pt-16 border-t border-white/10">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Contact Us</h2>
            <p className="text-white/60 text-sm mb-6 max-w-md mx-auto">
              Have questions? Reach out and we&apos;ll get back to you.
            </p>
            <a
              href="mailto:contact@interviewai.com"
              className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              contact@interviewai.com
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
