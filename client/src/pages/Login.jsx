import { motion } from "framer-motion"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import AuthScene from "../components/AuthScene"

export default function Login() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 relative overflow-hidden">
      <AuthScene />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-[1.1fr,1fr] gap-10 items-center">
          {/* Left side - Branding */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-6 text-left"
          >
            <span className="inline-flex items-center rounded-full px-4 py-1 glass text-xs sm:text-sm text-purple-200/90 border border-purple-500/30">
              <span className="mr-2 h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              AI-powered practice for every interview
            </span>

            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-3">
                <span className="gradient-text">Welcome back,</span>
                <br />
                <span className="text-white/90">let&apos;s rehearse.</span>
              </h1>
              <p className="mt-3 text-base sm:text-lg text-white/70 max-w-xl">
                Log in to access your personalized dashboard, resume checker, eye tracking, speaking pace
                analysis, and more – all in one immersive AI interview studio.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 max-w-md pt-2">
              {[
                { label: "Mock Interviews", value: "1.2K+" },
                { label: "Improved Offers", value: "4.8x" },
                { label: "Avg. Practice Time", value: "32m" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="glass rounded-2xl px-4 py-3 border border-white/10 backdrop-blur-xl"
                >
                  <p className="text-xs text-white/60">{item.label}</p>
                  <p className="mt-1 text-lg font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right side - Login card */}
          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="glass-strong rounded-3xl border border-white/10 shadow-2xl shadow-purple-900/50 p-6 sm:p-8 backdrop-blur-2xl relative overflow-hidden"
          >
            {/* Animated light sweep */}
            <motion.div
              initial={{ x: "-120%" }}
              animate={{ x: "120%" }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="pointer-events-none absolute -inset-y-10 w-1/2 bg-gradient-to-tr from-purple-500/10 via-white/10 to-cyan-400/5 blur-3xl"
            />

            <div className="relative z-10 space-y-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                  Log in to your space
                </h2>
                <p className="mt-2 text-sm text-white/60">
                  Continue your practice journey. New here?{" "}
                  <Link
                    to="/signup"
                    className="text-cyan-300 hover:text-cyan-200 underline underline-offset-4"
                  >
                    Create an account
                  </Link>
                  .
                </p>
              </div>

              <form
                className="space-y-5"
                onSubmit={(e) => {
                  e.preventDefault()
                  navigate("/dashboard")
                }}
              >
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-white/80">Email</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-3.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/70 focus:border-transparent backdrop-blur-xl transition-all duration-200"
                    />
                    <span className="pointer-events-none absolute inset-px rounded-2xl border border-white/10 opacity-40" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-white/80">Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-3.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-400/70 focus:border-transparent backdrop-blur-xl transition-all duration-200"
                    />
                    <span className="pointer-events-none absolute inset-px rounded-2xl border border-white/10 opacity-40" />
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <label className="inline-flex items-center gap-2 text-xs text-white/60 cursor-pointer">
                      <input
                        type="checkbox"
                        className="h-3.5 w-3.5 rounded border-white/30 bg-transparent text-purple-400 focus:ring-purple-400/70"
                      />
                      <span>Remember this device</span>
                    </label>
                    <button
                      type="button"
                      className="text-xs text-cyan-300 hover:text-cyan-200 underline underline-offset-4"
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>

                <motion.div
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="pt-2"
                >
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full justify-center text-base py-3.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 hover:from-purple-400 hover:via-indigo-400 hover:to-cyan-300 shadow-lg shadow-purple-700/40"
                  >
                    Enter Interview Studio
                  </Button>
                </motion.div>
              </form>

              <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between text-xs text-white/55">
                <p>By continuing, you agree to our terms and privacy policy.</p>
                <div className="flex gap-4">
                  <button type="button" className="hover:text-white/90 transition-colors">
                    Terms
                  </button>
                  <button type="button" className="hover:text-white/90 transition-colors">
                    Privacy
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

