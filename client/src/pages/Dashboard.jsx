import { motion } from "framer-motion"
import { FileText, Video, Eye, Mic, Brain, TrendingUp } from "lucide-react"
import { Button } from "../components/ui/button"

const stats = [
  { icon: FileText, label: "Resume Score", value: "85%", color: "from-purple-500 to-pink-500" },
  { icon: Video, label: "Interviews Completed", value: "12", color: "from-blue-500 to-cyan-500" },
  { icon: Eye, label: "Eye Contact Score", value: "92%", color: "from-green-500 to-emerald-500" },
  { icon: Mic, label: "Speaking Pace", value: "Good", color: "from-orange-500 to-red-500" },
  { icon: Brain, label: "Aptitude Score", value: "78%", color: "from-indigo-500 to-purple-500" },
  { icon: TrendingUp, label: "Overall Progress", value: "+15%", color: "from-yellow-500 to-orange-500" },
]

export default function Dashboard() {
  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold gradient-text mb-2">Dashboard</h1>
          <p className="text-white/60">Track your interview preparation progress</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-strong rounded-2xl p-6 hover:scale-105 transition-transform duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color} opacity-20`}>
                    <Icon className={`text-white`} size={24} />
                  </div>
                </div>
                <h3 className="text-white/60 text-sm mb-2">{stat.label}</h3>
                <p className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                  {stat.value}
                </p>
              </motion.div>
            )
          })}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-strong rounded-2xl p-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button variant="default" className="h-auto py-6 flex-col gap-2">
              <FileText size={32} />
              <span>Check Resume</span>
            </Button>
            <Button variant="default" className="h-auto py-6 flex-col gap-2">
              <Video size={32} />
              <span>Start Interview</span>
            </Button>
            <Button variant="default" className="h-auto py-6 flex-col gap-2">
              <Brain size={32} />
              <span>Take Aptitude Test</span>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

