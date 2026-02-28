import React, { useRef, useState } from "react";
import { Button } from "./ui/button";

export default function ResumeUpload({ onUpload, onExtract, skills, projects, setForm }) {
  const fileInputRef = useRef();
  const [localFile, setLocalFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLocalFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        onUpload(file, event.target.result);
      };
      reader.readAsText(file);
    }
  };

  // Simulate analyze/fetch skills & projects from backend
  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!localFile) return;
    setAnalyzing(true);
    // TODO: Replace with real backend call
    setTimeout(() => {
      // Simulated response
      const fetchedSkills = "React, Node.js, SQL";
      const fetchedProjects = "Portfolio Website, Chatbot";
      setForm((prev) => ({ ...prev, skills: fetchedSkills, projects: fetchedProjects }));
      setAnalyzing(false);
    }, 1200);
  };

  return (
    <div className="space-y-2">
      <label className="block text-white font-medium mb-1">Upload Resume (PDF or TXT)</label>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.txt"
        className="block w-full text-white bg-transparent border border-white/20 rounded-lg p-2"
        onChange={handleFileChange}
      />
      <Button
        variant="default"
        onClick={handleAnalyze}
        className="mt-2"
        disabled={!localFile || analyzing}
      >
        {analyzing ? "Analyzing..." : "Analyze"}
      </Button>
      {skills && (
        <div className="mt-2 text-white/80 text-sm">Skills: {skills}</div>
      )}
      {projects && (
        <div className="mt-1 text-white/80 text-sm">Projects: {projects}</div>
      )}
    </div>
  );
}
