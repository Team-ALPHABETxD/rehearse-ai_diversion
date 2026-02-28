import React, { useRef } from "react";
import { Button } from "./ui/button";

export default function ResumeUpload({ onUpload, onExtract }) {
  const fileInputRef = useRef();


  // Only trigger file input, do not auto-analyze
  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Store file in parent, but do not analyze yet
      onUpload(file, null);
    }
  };

  // Analyze button click
  const handleAnalyze = () => {
    const file = fileInputRef.current.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        // Pass file and text content up for analysis
        onUpload(file, event.target.result);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-white font-medium mb-1">Upload Resume (PDF or TXT)</label>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.txt"
        className="block w-full text-white bg-transparent border border-white/20 rounded-lg p-2"
        onChange={handleFileInput}
      />
      <Button
        variant="default"
        onClick={handleAnalyze}
        className="mt-2 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500"
        type="button"
      >
        Analyze
      </Button>
    </div>
  );
}
