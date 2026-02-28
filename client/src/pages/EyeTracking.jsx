import { motion } from "framer-motion"
import { Eye, TrendingUp } from "lucide-react"
import { Button } from "../components/ui/button"

export default function EyeTracking() {
  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold gradient-text mb-2">Eye Movement Detection</h1>
          <p className="text-white/60">Track and improve your eye contact during interviews</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-2xl p-8"
        >
          <div className="text-center mb-8">
            <Eye size={64} className="mx-auto mb-4 text-purple-400" />
            <h2 className="text-2xl font-bold text-white mb-4">Eye Contact Analysis</h2>
            <p className="text-white/60">Start a video interview to track your eye movements</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="glass rounded-xl p-6 text-center">
              <div className="text-3xl font-bold gradient-text mb-2">92%</div>
              <div className="text-white/60 text-sm">Eye Contact Score</div>
            </div>
            <div className="glass rounded-xl p-6 text-center">
              <div className="text-3xl font-bold gradient-text mb-2">85%</div>
              <div className="text-white/60 text-sm">Focus Level</div>
            </div>
            <div className="glass rounded-xl p-6 text-center">
              <div className="text-3xl font-bold gradient-text mb-2">78%</div>
              <div className="text-white/60 text-sm">Engagement</div>
            </div>
          </div>

          <Button variant="default" className="w-full">
            Start Eye Tracking Session
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

