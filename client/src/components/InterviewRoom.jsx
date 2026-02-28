import { useState, useRef, useEffect, useMemo } from "react"
import ResumeUpload from "./ResumeUpload"
import { Square, Mic, MicOff, Camera, CameraOff, Timer, CheckCircle, Send, Loader2, Bot, User, Volume2, VolumeX, Download, Trash2, Film } from "lucide-react"
import { Button } from "./ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { deleteRecording, listRecordings, saveRecording } from "../utils/recordingsDb"

const interviewQuestions = [
  "Hello! Welcome to the interview. Let's start with a classic question: Tell me about yourself and your background.",
  "That's great! Now, what are your greatest strengths?",
  "Interesting! Can you describe a challenging situation you faced and how you handled it?",
  "Thank you for sharing that. Why do you want to work here?",
  "Excellent! One last question: Where do you see yourself in 5 years?",
]

export default function InterviewRoom() {
  // Pre-interview form state
  const [form, setForm] = useState({
    jobTitle: "",
    experience: "",
    resumeFile: null,
    resumeText: "",
    skills: "",
    projects: ""
  });
  const [formStep, setFormStep] = useState(0); // 0=form, 1=interview

    // Handle form input changes
    const handleFormChange = (e) => {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
    };

    // Handle resume upload and extract (placeholder for now)
    const handleResumeUpload = (file, text) => {
      setForm((prev) => ({ ...prev, resumeFile: file, resumeText: text }));
      // Optionally, extract skills/projects from text here
    };

    // Continue to interview room
    const handleFormSubmit = (e) => {
      e.preventDefault();
      setFormStep(1);
    };
  const [isRecording, setIsRecording] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isAudioOn, setIsAudioOn] = useState(true)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [conversation, setConversation] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [answerText, setAnswerText] = useState("")
  const [isInterviewStarted, setIsInterviewStarted] = useState(false)
  const [transcribedText, setTranscribedText] = useState("")
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [isAISpeaking, setIsAISpeaking] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [consentOpen, setConsentOpen] = useState(false)
  const [consentChecked, setConsentChecked] = useState(false)
  const [hasConsented, setHasConsented] = useState(false)
  const [isRequestingMedia, setIsRequestingMedia] = useState(false)
  const [mediaError, setMediaError] = useState("")
  const [isSessionRecording, setIsSessionRecording] = useState(false)
  const [isSavingSession, setIsSavingSession] = useState(false)
  const [savedRecordings, setSavedRecordings] = useState([])
  const [previewUrl, setPreviewUrl] = useState("")
  const [previewTitle, setPreviewTitle] = useState("")
  
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const chatEndRef = useRef(null)
  const answerInputRef = useRef(null)
  const recognitionRef = useRef(null)
  const sessionRecorderRef = useRef(null)
  const sessionChunksRef = useRef([])
  const sessionStartedAtRef = useRef(null)
  const synthRef = useRef(null)
  const interviewStartedAtRef = useRef(null)

  const bestMimeType = useMemo(() => {
    if (typeof window === "undefined" || typeof MediaRecorder === "undefined") return ""
    const candidates = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm;codecs=opus",
      "video/webm",
    ]
    return candidates.find((t) => MediaRecorder.isTypeSupported(t)) || ""
  }, [])

  // Initialize Speech Recognition and Synthesis
  useEffect(() => {
    // Initialize Web Speech API for speech-to-text
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = ''
        let finalTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' '
          } else {
            interimTranscript += transcript
          }
        }

        setTranscribedText(prev => prev + finalTranscript + interimTranscript)
        if (finalTranscript) {
          setAnswerText(prev => prev + finalTranscript)
        }
      }

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsTranscribing(false)
      }

      recognitionRef.current.onend = () => {
        if (isRecording) {
          // Restart recognition if still recording
          try {
            recognitionRef.current.start()
          } catch (e) {
            console.error('Error restarting recognition:', e)
          }
        }
      }
    }

    // Initialize Web Speech API for text-to-speech
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (synthRef.current) {
        synthRef.current.cancel()
      }
    }
  }, [isRecording])

  // Initialize with first question (only after interview starts)
  useEffect(() => {
    if (isInterviewStarted && conversation.length === 0 && interviewQuestions.length > 0) {
      const firstQuestion = interviewQuestions[0]
      setConversation([
        {
          type: "ai",
          message: firstQuestion,
          timestamp: new Date(),
        },
      ])
      setCurrentQuestionIndex(0)
      // Speak the first question
      if (audioEnabled && synthRef.current) {
        speakText(firstQuestion)
      }
    }
  }, [isInterviewStarted, audioEnabled, conversation.length])

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [conversation, isProcessing])

  // Timer for recording
  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        setTimeElapsed((prev) => prev + 1)
      }, 1000)
      return () => clearInterval(interval)
    } else {
      setTimeElapsed(0)
    }
  }, [isRecording])

  const applyTrackToggles = () => {
    const stream = streamRef.current
    if (!stream) return
    stream.getVideoTracks().forEach((t) => (t.enabled = isVideoOn))
    stream.getAudioTracks().forEach((t) => (t.enabled = isAudioOn))
  }

  // Apply video/audio toggles without re-requesting permissions
  useEffect(() => {
    applyTrackToggles()
  }, [isVideoOn, isAudioOn])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        if (sessionRecorderRef.current && sessionRecorderRef.current.state !== "inactive") {
          sessionRecorderRef.current.stop()
        }
      } catch {
        // ignore
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
      }
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const refreshSavedRecordings = async () => {
    try {
      const items = await listRecordings({ type: "interview" })
      setSavedRecordings(items)
    } catch (e) {
      console.error("Failed to load recordings:", e)
    }
  }

  useEffect(() => {
    refreshSavedRecordings()
  }, [])

  const requestMedia = async () => {
    if (streamRef.current) return true
    setIsRequestingMedia(true)
    setMediaError("")
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      streamRef.current = stream
      applyTrackToggles()
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      return true
    } catch (e) {
      console.error("Error accessing media devices:", e)
      setMediaError("Camera/Microphone permission was denied or not available.")
      return false
    } finally {
      setIsRequestingMedia(false)
    }
  }

  const startSessionRecording = () => {
    if (!streamRef.current || typeof MediaRecorder === "undefined") return false
    try {
      sessionChunksRef.current = []
      const options = bestMimeType ? { mimeType: bestMimeType } : undefined
      const recorder = new MediaRecorder(streamRef.current, options)
      sessionRecorderRef.current = recorder
      sessionStartedAtRef.current = Date.now()

      recorder.ondataavailable = (evt) => {
        if (evt.data && evt.data.size > 0) {
          sessionChunksRef.current.push(evt.data)
        }
      }

      recorder.start()
      setIsSessionRecording(true)
      return true
    } catch (e) {
      console.error("Failed to start MediaRecorder:", e)
      setMediaError("Recording is not supported in this browser/device.")
      return false
    }
  }

  const stopAndSaveSessionRecording = async () => {
    const recorder = sessionRecorderRef.current
    if (!recorder || recorder.state === "inactive") return

    setIsSavingSession(true)
    const stoppedAt = Date.now()

    const blobResult = await new Promise((resolve) => {
      recorder.onstop = () => {
        const mimeType = recorder.mimeType || bestMimeType || "video/webm"
        const blob = new Blob(sessionChunksRef.current, { type: mimeType })
        resolve({ blob, mimeType })
      }
      try {
        recorder.stop()
      } catch {
        resolve(null)
      }
    })

    sessionRecorderRef.current = null
    setIsSessionRecording(false)

    if (blobResult?.blob && blobResult.blob.size > 0) {
      const durationSec =
        sessionStartedAtRef.current ? Math.max(1, Math.round((stoppedAt - sessionStartedAtRef.current) / 1000)) : null
      try {
        await saveRecording({
          blob: blobResult.blob,
          mimeType: blobResult.mimeType,
          createdAt: interviewStartedAtRef.current || sessionStartedAtRef.current || Date.now(),
          durationSec,
          type: "interview",
        })
        // Send to backend
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `interview-${timestamp}.webm`;
        const formData = new FormData();
        formData.append('file', blobResult.blob, filename);
        
        const backendUrl = `${window.location.protocol}//${window.location.hostname}:3000/upload/upload`;
        try {
          const uploadRes = await fetch(backendUrl, {
            method: 'POST',
            body: formData,
          });
          
          if (!uploadRes.ok) {
            throw new Error(`Upload failed: ${uploadRes.statusText}`);
          }
          
          const uploadData = await uploadRes.json();
          console.log('Recording uploaded successfully:', uploadData.data);
        } catch (uploadErr) {
          console.error('Upload error:', uploadErr);
          setMediaError(`Could not upload recording to server: ${uploadErr.message}`);
        }
        await refreshSavedRecordings()
      } catch (e) {
        console.error("Failed to save recording:", e)
        setMediaError("Could not save recording locally (storage permission/space issue).")
      }
    }

    setIsSavingSession(false)
  }

  // Function to speak text using Web Speech API
  const speakText = (text) => {
    if (!synthRef.current || !audioEnabled) return

    // Cancel any ongoing speech
    synthRef.current.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 1
    utterance.volume = 1
    utterance.lang = 'en-US'

    utterance.onstart = () => {
      setIsAISpeaking(true)
    }

    utterance.onend = () => {
      setIsAISpeaking(false)
    }

    utterance.onerror = () => {
      setIsAISpeaking(false)
    }

    synthRef.current.speak(utterance)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleStartInterview = () => {
    if (!hasConsented) {
      setConsentOpen(true)
      return
    }
    ;(async () => {
      const ok = await requestMedia()
      if (!ok) return

      interviewStartedAtRef.current = Date.now()
      setIsInterviewStarted(true)
      setCurrentQuestionIndex(0)
      startSessionRecording()
    })()
  }

  const handleSubmitAnswer = async () => {
    const finalAnswer = answerText.trim() || transcribedText.trim() || "[Audio/Video Response Recorded]"
    
    if (!finalAnswer || finalAnswer === "[Audio/Video Response Recorded]") {
      alert("Please provide an answer before submitting.")
      return
    }

    // Add user answer to conversation
    setConversation((prev) => [
      ...prev,
      {
        type: "user",
        message: finalAnswer,
        timestamp: new Date(),
      },
    ])

    // Clear answer input and transcribed text
    setAnswerText("")
    setTranscribedText("")
    setIsRecording(false)
    setTimeElapsed(0)
    setIsTranscribing(false)

    // Stop speech recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (e) {
        console.error('Error stopping recognition:', e)
      }
    }

    // Show processing indicator
    setIsProcessing(true)

    // Simulate AI processing (2-3 seconds)
    await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 1000))

    // Move to next question
    if (currentQuestionIndex < interviewQuestions.length - 1) {
      const nextIndex = currentQuestionIndex + 1
      setCurrentQuestionIndex(nextIndex)
      const nextQuestion = interviewQuestions[nextIndex]

      // Add next AI question
      setConversation((prev) => [
        ...prev,
        {
          type: "ai",
          message: nextQuestion,
          timestamp: new Date(),
        },
      ])

      // Speak the next question
      if (audioEnabled && synthRef.current) {
        speakText(nextQuestion)
      }
    } else {
      // Interview completed
      const completionMessage = "Thank you for your time! The interview is now complete. We'll review your responses and provide detailed feedback shortly."
      setConversation((prev) => [
        ...prev,
        {
          type: "ai",
          message: completionMessage,
          timestamp: new Date(),
        },
      ])
      if (audioEnabled && synthRef.current) {
        speakText(completionMessage)
      }
    }

    setIsProcessing(false)
  }

  const handleStartRecording = () => {
    setIsRecording(true)
    setTranscribedText("")
    setAnswerText("")
    setIsTranscribing(true)

    // Start speech recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start()
      } catch (e) {
        console.error('Error starting recognition:', e)
        setIsTranscribing(false)
      }
    } else {
      // Fallback: if speech recognition is not available, just record
      setIsTranscribing(false)
    }
  }

  const handleStopRecording = () => {
    setIsRecording(false)
    setIsTranscribing(false)

    // Stop speech recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (e) {
        console.error('Error stopping recognition:', e)
      }
    }

    // Use transcribed text if available, otherwise use placeholder
    if (!answerText.trim() && transcribedText.trim()) {
      setAnswerText(transcribedText)
    }

    // Auto-submit after a short delay
    setTimeout(() => {
      handleSubmitAnswer()
    }, 500)
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmitAnswer()
    }
  }

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled)
    if (!audioEnabled && synthRef.current) {
      synthRef.current.cancel()
    }
  }

  const isInterviewComplete = currentQuestionIndex >= interviewQuestions.length - 1 && conversation.length > 0 && conversation[conversation.length - 1].type === "ai"

  useEffect(() => {
    if (isInterviewComplete && isSessionRecording) {
      stopAndSaveSessionRecording()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInterviewComplete])

  const handleConsentConfirm = async () => {
    if (!consentChecked) return
    setHasConsented(true)
    setConsentOpen(false)
    const ok = await requestMedia()
    if (!ok) return
    interviewStartedAtRef.current = Date.now()
    setIsInterviewStarted(true)
    startSessionRecording()
  }

  const openPreview = (recording) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    const url = URL.createObjectURL(recording.blob)
    setPreviewUrl(url)
    setPreviewTitle(new Date(recording.createdAt).toLocaleString())
  }

  const closePreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl("")
    setPreviewTitle("")
  }

  const handleDeleteRecording = async (id) => {
    await deleteRecording(id)
    await refreshSavedRecordings()
    closePreview()
  }

  const handleEndInterviewNow = async () => {
    if (isSessionRecording) {
      await stopAndSaveSessionRecording()
    }
    setIsInterviewStarted(false)
    setConversation([])
    setCurrentQuestionIndex(0)
    setIsRecording(false)
    setIsTranscribing(false)
    setIsProcessing(false)
    setAnswerText("")
    setTranscribedText("")
  }

  // Show pre-interview form before interview room
  // Disable continue if any required field is empty or resume not uploaded
  const isFormComplete = form.jobTitle.trim() && form.experience.trim() && form.resumeFile;

  if (formStep === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900/60 to-blue-900/60 p-6">
        <form onSubmit={handleFormSubmit} className="glass-strong rounded-3xl border border-white/10 p-8 w-full max-w-xl space-y-6">
          <h2 className="text-3xl font-bold text-white mb-2">Interview Setup</h2>
          <div>
            <label className="block text-white font-medium mb-1">Job Title</label>
            <input
              type="text"
              name="jobTitle"
              value={form.jobTitle}
              onChange={handleFormChange}
              required
              className="w-full rounded-lg p-3 bg-transparent border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g. Frontend Developer"
            />
          </div>
          <div>
            <label className="block text-white font-medium mb-1">Experience (years)</label>
            <input
              type="number"
              name="experience"
              value={form.experience}
              onChange={handleFormChange}
              min="0"
              required
              className="w-full rounded-lg p-3 bg-transparent border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g. 3"
            />
          </div>
          <div>
            <ResumeUpload
              onUpload={handleResumeUpload}
              skills={form.skills}
              projects={form.projects}
              setForm={setForm}
            />
            {form.resumeFile && (
              <div className="mt-2 text-white/80 text-sm">Uploaded: {form.resumeFile.name}</div>
            )}
          </div>
          {/* Show fetched skills/projects fields as read-only */}
          {form.skills && (
            <div>
              <label className="block text-white font-medium mb-1">Skills (fetched)</label>
              <input
                type="text"
                name="skills"
                value={form.skills}
                readOnly
                className="w-full rounded-lg p-3 bg-transparent border border-white/20 text-white opacity-80"
              />
            </div>
          )}
          {form.projects && (
            <div>
              <label className="block text-white font-medium mb-1">Projects (fetched)</label>
              <input
                type="text"
                name="projects"
                value={form.projects}
                readOnly
                className="w-full rounded-lg p-3 bg-transparent border border-white/20 text-white opacity-80"
              />
            </div>
          )}
          <Button
            type="submit"
            variant="default"
            className="w-full mt-4"
            disabled={!(isFormComplete && form.skills && form.projects)}
          >
            Continue to Interview
          </Button>
        </form>
      </div>
    );
  }

  // ...existing code...
  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Consent Modal */}
        <AnimatePresence>
          {consentOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            >
              <motion.div
                initial={{ scale: 0.96, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.98, opacity: 0, y: 10 }}
                className="w-full max-w-lg glass-strong rounded-3xl border border-white/10 p-6 sm:p-7"
              >
                <h3 className="text-xl font-semibold text-white">Permission required</h3>
                <p className="mt-2 text-sm text-white/70">
                  Before starting, please confirm you allow this app to access your camera and microphone and
                  record your interview. The recording is saved only in your browser on this device.
                </p>

                <div className="mt-4 glass rounded-2xl p-4 border border-white/10">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 rounded border-white/30 bg-transparent text-purple-400 focus:ring-purple-400/70"
                      checked={consentChecked}
                      onChange={(e) => setConsentChecked(e.target.checked)}
                    />
                    <span className="text-sm text-white/80">
                      I consent to camera/microphone access and local recording for this practice interview.
                    </span>
                  </label>
                </div>

                {mediaError && <p className="mt-3 text-sm text-red-300">{mediaError}</p>}

                <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setConsentOpen(false)}
                    className="border-white/15"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="default"
                    onClick={handleConsentConfirm}
                    disabled={!consentChecked || isRequestingMedia}
                    className="flex items-center gap-2"
                  >
                    {isRequestingMedia ? <Loader2 size={18} className="animate-spin" /> : null}
                    Allow & Start
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recording Preview Modal */}
        <AnimatePresence>
          {previewUrl && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
              onClick={closePreview}
            >
              <motion.div
                initial={{ scale: 0.96, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.98, opacity: 0, y: 10 }}
                className="w-full max-w-3xl glass-strong rounded-3xl border border-white/10 p-4 sm:p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-white font-semibold">Recording - {previewTitle}</h3>
                  <Button variant="outline" className="border-white/15" onClick={closePreview}>
                    Close
                  </Button>
                </div>
                <div className="mt-4 rounded-2xl overflow-hidden border border-white/10">
                  <video src={previewUrl} controls className="w-full h-auto bg-black" />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold gradient-text mb-2">Interview Room</h1>
              <p className="text-white/60">Practice your interview skills with AI-powered feedback</p>
            </div>
            <Button
              variant="outline"
              onClick={toggleAudio}
              className="flex items-center gap-2"
            >
              {audioEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              {audioEnabled ? "Audio On" : "Audio Off"}
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Interview Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative glass-strong rounded-2xl overflow-hidden aspect-video"
            >
              {!hasConsented ? (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/20 to-blue-900/20">
                  <div className="text-center px-6">
                    <p className="text-white font-semibold">Camera & microphone are off</p>
                    <p className="text-white/60 text-sm mt-2">
                      Click <span className="text-white/80 font-medium">Start Interview</span> and give consent to enable them.
                    </p>
                  </div>
                </div>
              ) : isVideoOn ? (
                <video
                  ref={videoRef}
                  autoPlay
                  muted={!isAudioOn}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/20 to-blue-900/20">
                  <CameraOff size={64} className="text-white/30" />
                </div>
              )}

              {/* Recording Indicator */}
              <AnimatePresence>
                {(isRecording || isSessionRecording) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute top-4 left-4 flex items-center gap-2 glass px-4 py-2 rounded-full"
                  >
                    <div className={`w-3 h-3 rounded-full animate-pulse ${isSavingSession ? "bg-yellow-400" : "bg-red-500"}`} />
                    <span className="text-white text-sm font-medium">
                      {isSavingSession
                        ? "Saving recording..."
                        : isRecording && isTranscribing
                          ? "Transcribing..."
                          : isSessionRecording
                            ? "Interview Recording"
                            : "Recording"}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* AI Speaking Indicator */}
              <AnimatePresence>
                {isAISpeaking && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute top-4 right-4 glass px-4 py-2 rounded-full"
                  >
                    <div className="flex items-center gap-2 text-white">
                      <Volume2 size={16} className="animate-pulse" />
                      <span className="text-sm font-medium">AI Speaking</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Timer */}
              {isRecording && (
                <div className="absolute bottom-4 right-4 glass px-4 py-2 rounded-full">
                  <div className="flex items-center gap-2 text-white">
                    <Timer size={16} />
                    <span className="font-mono font-medium">{formatTime(timeElapsed)}</span>
                  </div>
                </div>
              )}

              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
            </motion.div>

            {/* Conversation Chat */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-strong rounded-2xl p-6 h-[400px] flex flex-col"
            >
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                <AnimatePresence>
                  {conversation.map((msg, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`flex gap-3 ${msg.type === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {msg.type === "ai" && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                          <Bot size={18} className="text-white" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          msg.type === "user"
                            ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                            : "glass text-white"
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{msg.message}</p>
                        {msg.type === "ai" && audioEnabled && (
                          <button
                            onClick={() => speakText(msg.message)}
                            className="mt-2 text-xs text-white/70 hover:text-white flex items-center gap-1"
                          >
                            <Volume2 size={12} />
                            Replay audio
                          </button>
                        )}
                      </div>
                      {msg.type === "user" && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                          <User size={18} className="text-white" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Processing Indicator */}
                {isProcessing && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3 justify-start"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                      <Bot size={18} className="text-white" />
                    </div>
                    <div className="glass rounded-2xl px-4 py-3 flex items-center gap-2">
                      <Loader2 size={16} className="text-white animate-spin" />
                      <span className="text-white/70 text-sm">Processing your answer...</span>
                    </div>
                  </motion.div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Answer Input */}
              {!isInterviewStarted ? (
                <Button
                  variant="default"
                  onClick={handleStartInterview}
                  className="w-full"
                  size="lg"
                >
                  Start Interview
                </Button>
              ) : !isInterviewComplete ? (
                <div className="space-y-3">
                  {/* Transcribed Text Display */}
                  {isTranscribing && transcribedText && (
                    <div className="glass rounded-lg px-4 py-2">
                      <p className="text-xs text-white/50 mb-1">Transcribing...</p>
                      <p className="text-sm text-white/80">{transcribedText}</p>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <textarea
                      ref={answerInputRef}
                      value={answerText}
                      onChange={(e) => setAnswerText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={isRecording ? (isTranscribing ? "Speaking... (transcribing to text)" : "Recording your answer...") : "Type your answer here... (Press Enter to submit)"}
                      disabled={isRecording || isProcessing}
                      className="flex-1 glass rounded-lg px-4 py-3 text-white placeholder-white/50 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                      rows={3}
                    />
                    <div className="flex flex-col gap-2">
                      {!isRecording ? (
                        <Button
                          variant="default"
                          onClick={handleStartRecording}
                          disabled={isProcessing}
                          className="flex items-center gap-2"
                          title="Record audio answer (will be transcribed to text)"
                        >
                          <Mic size={18} />
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={handleStopRecording}
                          className="flex items-center gap-2 border-red-500 text-red-400 hover:bg-red-500/10"
                        >
                          <Square size={18} />
                        </Button>
                      )}
                      <Button
                        variant="default"
                        onClick={handleSubmitAnswer}
                        disabled={(!answerText.trim() && !transcribedText.trim()) || isProcessing}
                        className="flex items-center gap-2"
                      >
                        {isProcessing ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <Send size={18} />
                        )}
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-white/50 text-center">
                    {isRecording
                      ? isTranscribing 
                        ? "Your speech is being converted to text automatically"
                        : "Click stop to finish recording and submit"
                      : "You can type your answer or record audio (will be transcribed to text)"}
                  </p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <CheckCircle size={48} className="mx-auto mb-4 text-green-400" />
                  <p className="text-white font-semibold text-lg">Interview Completed!</p>
                  <p className="text-white/60 text-sm mt-2">Check your dashboard for detailed feedback</p>
                </div>
              )}
            </motion.div>

            {/* Controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-strong rounded-2xl p-6"
            >
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Button
                  variant={isVideoOn ? "default" : "outline"}
                  onClick={() => setIsVideoOn(!isVideoOn)}
                  className="flex items-center gap-2"
                  disabled={!hasConsented}
                >
                  {isVideoOn ? <Camera size={20} /> : <CameraOff size={20} />}
                  {isVideoOn ? "Video On" : "Video Off"}
                </Button>

                <Button
                  variant={isAudioOn ? "default" : "outline"}
                  onClick={() => setIsAudioOn(!isAudioOn)}
                  className="flex items-center gap-2"
                  disabled={!hasConsented}
                >
                  {isAudioOn ? <Mic size={20} /> : <MicOff size={20} />}
                  {isAudioOn ? "Audio On" : "Audio Off"}
                </Button>

                {isInterviewStarted && (
                  <Button
                    variant="outline"
                    onClick={handleEndInterviewNow}
                    className="flex items-center gap-2 border-red-500 text-red-300 hover:bg-red-500/10"
                    disabled={isSavingSession}
                  >
                    <Square size={18} />
                    End & Save
                  </Button>
                )}
              </div>
            </motion.div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Saved recordings */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="glass-strong rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Film size={18} className="text-white/80" />
                  Saved Recordings
                </h3>
                <Button variant="outline" className="border-white/15" onClick={refreshSavedRecordings}>
                  Refresh
                </Button>
              </div>

              {savedRecordings.length === 0 ? (
                <p className="text-sm text-white/60">No saved recordings yet.</p>
              ) : (
                <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                  {savedRecordings.map((r) => {
                    const created = new Date(r.createdAt || Date.now()).toLocaleString()
                    const sizeMb = r.sizeBytes ? (r.sizeBytes / (1024 * 1024)).toFixed(1) : null
                    return (
                      <div key={r.id} className="glass rounded-2xl p-4 border border-white/10">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm text-white font-medium">{created}</p>
                            <p className="text-xs text-white/60 mt-1">
                              {r.durationSec ? `${r.durationSec}s` : "—"} · {sizeMb ? `${sizeMb} MB` : "—"}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" className="border-white/15" onClick={() => openPreview(r)}>
                              Play
                            </Button>
                            <a
                              href={URL.createObjectURL(r.blob)}
                              download={`interview-${r.id}.webm`}
                              className="inline-flex"
                            >
                              <Button variant="outline" className="border-white/15" title="Download">
                                <Download size={16} />
                              </Button>
                            </a>
                            <Button
                              variant="outline"
                              className="border-red-500/50 text-red-300 hover:bg-red-500/10"
                              title="Delete"
                              onClick={() => handleDeleteRecording(r.id)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </motion.div>

            {/* Progress */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-strong rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Interview Progress</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/70">Questions Answered</span>
                  <span className="text-white font-medium">
                    {Math.min(currentQuestionIndex, interviewQuestions.length - 1)} / {interviewQuestions.length}
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${((Math.min(currentQuestionIndex, interviewQuestions.length - 1)) / interviewQuestions.length) * 100}%`,
                    }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                  />
                </div>
              </div>
            </motion.div>

            {/* AI Analysis Preview */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-strong rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Real-time Analysis</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-sm">Eye Contact</span>
                  <span className="text-green-400 text-sm font-medium">Good</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-sm">Speaking Pace</span>
                  <span className="text-yellow-400 text-sm font-medium">Moderate</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-sm">Confidence</span>
                  <span className="text-blue-400 text-sm font-medium">High</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-sm">Response Quality</span>
                  <span className="text-purple-400 text-sm font-medium">Excellent</span>
                </div>
              </div>
            </motion.div>

            {/* Tips */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-strong rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <CheckCircle size={20} className="text-green-400" />
                Tips
              </h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>Speak clearly for better transcription</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>Your audio answers are converted to text automatically</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>AI responses are spoken out loud</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>You can replay AI audio anytime</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
