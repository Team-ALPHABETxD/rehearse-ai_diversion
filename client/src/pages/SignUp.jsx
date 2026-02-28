import { motion } from "framer-motion"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import AuthScene from "../components/AuthScene"

export default function SignUp() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 relative overflow-hidden">
      <AuthScene />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-[1.05fr,1fr] gap-10 items-center">
          {/* Left side - Copy */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-6 text-left"
          >
            <span className="inline-flex items-center rounded-full px-4 py-1 glass text-xs sm:text-sm text-cyan-100/90 border border-cyan-400/40">
              <span className="mr-2 h-1.5 w-1.5 rounded-full bg-cyan-300 animate-ping" />
              New here? Create your rehearsal profile
            </span>

            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-3">
                <span className="gradient-text">Sign up</span>
                <br />
                <span className="text-white/90">and start practicing.</span>
              </h1>
              <p className="mt-3 text-base sm:text-lg text-white/70 max-w-xl">
                Build confidence with AI-powered mock interviews, resume insights, and real-time body
                language feedback. Your next offer starts with your next practice.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-md pt-1">
              {[
                "Behavioral interviews",
                "System design practice",
                "ATS optimization",
                "Eye contact tracking",
                "Speaking pace analysis",
                "Aptitude warmups",
              ].map((pill) => (
                <div
                  key={pill}
                  className="glass rounded-full px-3 py-1.5 text-[11px] sm:text-xs text-white/70 border border-white/10"
                >
                  {pill}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right side - Sign up card */}
          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="glass-strong rounded-3xl border border-white/10 shadow-2xl shadow-purple-900/50 p-6 sm:p-8 backdrop-blur-2xl relative overflow-hidden"
          >
            {/* Animated border glow */}
            <motion.div
              className="pointer-events-none absolute inset-0 rounded-3xl border border-transparent"
              animate={{
                boxShadow: [
                  "0 0 0 0 rgba(129, 140, 248, 0.2)",
                  "0 0 40px 4px rgba(129, 140, 248, 0.45)",
                  "0 0 0 0 rgba(129, 140, 248, 0.15)",
                ],
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="relative z-10 space-y-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                  Create your account
                </h2>
                <p className="mt-2 text-sm text-white/60">
                  Already practicing with us?{" "}
                  <Link
                    to="/login"
                    className="text-cyan-300 hover:text-cyan-200 underline underline-offset-4"
                  >
                    Log in instead
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-white/80">First name</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="Alex"
                        className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/70 focus:border-transparent backdrop-blur-xl transition-all duration-200"
                      />
                      <span className="pointer-events-none absolute inset-px rounded-2xl border border-white/10 opacity-30" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-white/80">Last name</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="Patel"
                        className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/70 focus:border-transparent backdrop-blur-xl transition-all duration-200"
                      />
                      <span className="pointer-events-none absolute inset-px rounded-2xl border border-white/10 opacity-30" />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-white/80">Email</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-400/70 focus:border-transparent backdrop-blur-xl transition-all duration-200"
                    />
                    <span className="pointer-events-none absolute inset-px rounded-2xl border border-white/10 opacity-30" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-white/80">Password</label>
                    <div className="relative">
                      <input
                        type="password"
                        required
                        placeholder="Create a strong password"
                        className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-400/70 focus:border-transparent backdrop-blur-xl transition-all duration-200"
                      />
                      <span className="pointer-events-none absolute inset-px rounded-2xl border border-white/10 opacity-30" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-white/80">Confirm password</label>
                    <div className="relative">
                      <input
                        type="password"
                        required
                        placeholder="Repeat password"
                        className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-400/70 focus:border-transparent backdrop-blur-xl transition-all duration-200"
                      />
                      <span className="pointer-events-none absolute inset-px rounded-2xl border border-white/10 opacity-30" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1 text-xs text-white/65">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      className="h-3.5 w-3.5 rounded border-white/30 bg-transparent text-purple-400 focus:ring-purple-400/70"
                    />
                    <span>
                      I agree to the{" "}
                      <span className="underline underline-offset-4">Terms of Service</span> and{" "}
                      <span className="underline underline-offset-4">Privacy Policy</span>.
                    </span>
                  </label>
                </div>

                <motion.div
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="pt-2"
                >
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full justify-center text-base py-3.5 bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-600 hover:from-cyan-300 hover:via-indigo-400 hover:to-purple-500 shadow-lg shadow-cyan-700/40"
                  >
                    Create free account
                  </Button>
                </motion.div>
              </form>

              <p className="pt-3 text-xs text-white/55">
                We&apos;ll occasionally send product updates and interview tips. You can unsubscribe at
                any time.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

