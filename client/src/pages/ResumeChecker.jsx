import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Upload, FileText, CheckCircle, AlertCircle, X } from "lucide-react"
import { Button } from "../components/ui/button"

export default function ResumeChecker() {
  const [file, setFile] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validate file type
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      const validExtensions = ['.pdf', '.doc', '.docx']
      const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase()
      
      if (validTypes.includes(selectedFile.type) || validExtensions.includes(fileExtension)) {
        setFile(selectedFile)
      } else {
        alert('Please upload a valid PDF or DOCX file')
      }
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) {
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      const validExtensions = ['.pdf', '.doc', '.docx']
      const fileExtension = droppedFile.name.substring(droppedFile.name.lastIndexOf('.')).toLowerCase()
      
      if (validTypes.includes(droppedFile.type) || validExtensions.includes(fileExtension)) {
        setFile(droppedFile)
      } else {
        alert('Please upload a valid PDF or DOCX file')
      }
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleChooseFile = () => {
    fileInputRef.current?.click()
  }

  const handleAnalyze = () => {
    setIsAnalyzing(true)
    setTimeout(() => setIsAnalyzing(false), 2000)
  }

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold gradient-text mb-2">ATS Resume Checker</h1>
          <p className="text-white/60">Optimize your resume for Applicant Tracking Systems</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-2xl p-8"
        >
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-12 text-center mb-6 transition-all duration-300 ${
              isDragging 
                ? 'border-purple-500 bg-purple-500/10 scale-105' 
                : 'border-white/20 hover:border-white/40'
            }`}
          >
            <Upload size={48} className={`mx-auto mb-4 transition-colors ${isDragging ? 'text-purple-400' : 'text-white/40'}`} />
            <p className="text-white/60 mb-4">
              {isDragging ? 'Drop your resume here' : 'Drag and drop your resume here, or click to browse'}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileChange}
              className="hidden"
              id="resume-upload"
            />
            <Button 
              variant="outline" 
              onClick={handleChooseFile}
              className="cursor-pointer"
            >
              Choose File from Folder
            </Button>
            {file && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex items-center justify-center gap-3 bg-white/5 rounded-lg p-3"
              >
                <FileText size={20} className="text-purple-400" />
                <p className="text-white/80 flex-1 text-left">{file.name}</p>
                <button
                  onClick={handleRemoveFile}
                  className="text-white/60 hover:text-white transition-colors"
                  aria-label="Remove file"
                >
                  <X size={18} />
                </button>
              </motion.div>
            )}
          </div>

          <Button
            variant="default"
            onClick={handleAnalyze}
            disabled={!file || isAnalyzing}
            className="w-full"
          >
            {isAnalyzing ? "Analyzing..." : "Analyze Resume"}
          </Button>
        </motion.div>

        {/* Results Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-strong rounded-2xl p-8 mt-6"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Analysis Results</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <CheckCircle className="text-green-400 mt-1" size={24} />
              <div>
                <h3 className="text-white font-medium">Keywords Match</h3>
                <p className="text-white/60 text-sm">Your resume matches 85% of job description keywords</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <AlertCircle className="text-yellow-400 mt-1" size={24} />
              <div>
                <h3 className="text-white font-medium">Suggestions</h3>
                <p className="text-white/60 text-sm">Add more technical skills and quantify achievements</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

