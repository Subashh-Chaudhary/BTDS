"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { Upload, FileIcon, AlertCircle } from "lucide-react"
import { useAuthStore } from "@/lib/store/auth.store"
import { useToast } from "@/hooks/use-toast"

export default function UploadSection() {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const { toast } = useToast()

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const showAuthToast = () => {
    toast({
      title: "Authentication Required",
      description: "Please login first to upload and analyze scans.",
      duration: 3000,
    })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (!isAuthenticated) {
      showAuthToast()
      return
    }
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      setFile(droppedFile)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAuthenticated) {
      showAuthToast()
      return
    }
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const handleAnalyze = async () => {
    if (!isAuthenticated) {
      showAuthToast()
      return
    }
    if (!file) return
    setIsAnalyzing(true)
    // Simulate analysis
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsAnalyzing(false)
  }

  return (
    <section id="upload" className="py-20 px-4 bg-background">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Upload Your Scan</h2>
          <p className="text-lg text-muted-foreground">Get instant AI-powered analysis of your medical imaging</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          {/* Upload Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative p-12 rounded-2xl border-2 border-dashed transition cursor-pointer ${
              isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            }`}
          >
            <input
              type="file"
              onChange={handleFileSelect}
              accept="image/*,.dcm"
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="text-center">
              <Upload className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">Drag and drop your scan here</h3>
              <p className="text-muted-foreground mb-4">or click to browse (DICOM, PNG, JPG)</p>
              <p className="text-sm text-muted-foreground">Maximum file size: 50MB</p>
            </div>
          </div>

          {/* File Preview */}
          {file && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg bg-accent/5 border border-border flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <FileIcon className="text-primary" size={24} />
                <div>
                  <p className="font-medium text-foreground">{file.name}</p>
                  <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button onClick={() => setFile(null)} className="text-muted-foreground hover:text-foreground transition">
                ✕
              </button>
            </motion.div>
          )}

          {/* Info Box */}
          <div className="p-4 rounded-lg bg-accent/10 border border-accent/20 flex gap-3">
            <AlertCircle className="text-accent shrink-0 mt-0.5" size={20} />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Important:</p>
              <p>
                This tool is designed to assist medical professionals. Always consult with qualified healthcare
                providers for diagnosis and treatment decisions.
              </p>
            </div>
          </div>

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={!file || isAnalyzing}
            className="w-full py-3 rounded-full bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Upload size={20} />
                Analyze Scan
              </>
            )}
          </button>
        </motion.div>
      </div>
    </section>
  )
}
