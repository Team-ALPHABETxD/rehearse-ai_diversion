import { motion } from "framer-motion"
import { Mic, BarChart3 } from "lucide-react"
import { Button } from "../components/ui/button"

export default function SpeakingPace() {
  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold gradient-text mb-2">Speaking Pace Analyzer</h1>
          <p className="text-white/60">Analyze your speech speed and fluency</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-2xl p-8"
        >
          <div className="text-center mb-8">
            <Mic size={64} className="mx-auto mb-4 text-blue-400" />
            <h2 className="text-2xl font-bold text-white mb-4">Speech Analysis</h2>
            <p className="text-white/60">Record your speech to get real-time feedback</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="glass rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <BarChart3 className="text-purple-400" size={24} />
                <h3 className="text-white font-semibold">Current Pace</h3>
              </div>
              <div className="text-3xl font-bold gradient-text mb-2">145 WPM</div>
              <div className="text-white/60 text-sm">Words per minute</div>
            </div>
            <div className="glass rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <BarChart3 className="text-green-400" size={24} />
                <h3 className="text-white font-semibold">Optimal Range</h3>
              </div>
              <div className="text-3xl font-bold gradient-text mb-2">140-160</div>
              <div className="text-white/60 text-sm">Recommended WPM</div>
            </div>
          </div>

          <Button variant="default" className="w-full">
            Start Recording
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

