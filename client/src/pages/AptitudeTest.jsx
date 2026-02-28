import { useState } from "react"
import { motion } from "framer-motion"
import { Clock, CheckCircle, XCircle } from "lucide-react"
import { Button } from "../components/ui/button"

const questions = [
  {
    id: 1,
    question: "What is 25% of 200?",
    options: ["40", "50", "60", "75"],
    correct: 1,
  },
  {
    id: 2,
    question: "If a train travels 120 km in 2 hours, what is its speed?",
    options: ["50 km/h", "60 km/h", "70 km/h", "80 km/h"],
    correct: 1,
  },
  {
    id: 3,
    question: "What comes next in the series: 2, 6, 12, 20, ?",
    options: ["28", "30", "32", "34"],
    correct: 1,
  },
]

export default function AptitudeTest() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes
  const [isFinished, setIsFinished] = useState(false)

  const handleAnswer = (index) => {
    setSelectedAnswer(index)
    if (index === questions[currentQuestion].correct) {
      setScore(score + 1)
    }
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
    } else {
      setIsFinished(true)
    }
  }

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold gradient-text mb-2">Aptitude Test</h1>
          <p className="text-white/60">Test your problem-solving and analytical skills</p>
        </motion.div>

        {!isFinished ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-strong rounded-2xl p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 glass px-4 py-2 rounded-full">
                <Clock size={20} className="text-white" />
                <span className="text-white font-mono">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}</span>
              </div>
              <div className="text-white/60">
                Question {currentQuestion + 1} of {questions.length}
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-6">
              {questions[currentQuestion].question}
            </h2>

            <div className="space-y-3 mb-6">
              {questions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${
                    selectedAnswer === index
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                      : "glass text-white/80 hover:bg-white/10"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            <Button
              variant="default"
              onClick={handleNext}
              disabled={selectedAnswer === null}
              className="w-full"
            >
              {currentQuestion === questions.length - 1 ? "Finish Test" : "Next Question"}
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-strong rounded-2xl p-8 text-center"
          >
            <CheckCircle size={64} className="mx-auto mb-4 text-green-400" />
            <h2 className="text-3xl font-bold text-white mb-4">Test Completed!</h2>
            <p className="text-2xl font-bold gradient-text mb-6">
              Score: {score} / {questions.length}
            </p>
            <p className="text-white/60 mb-6">
              You scored {Math.round((score / questions.length) * 100)}%
            </p>
            <Button variant="default" onClick={() => window.location.reload()}>
              Retake Test
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

