"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { Upload, FileIcon, AlertCircle } from "lucide-react"
import { useAuthStore } from "@/lib/store/auth.store"
import { useToast } from "@/hooks/use-toast"
import { httpClient } from '@/lib/http-client'

export default function UploadSection() {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<any | null>(null)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)
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
    // Read latest user from store in case the hook value is stale during hydration
    const currentUser = useAuthStore.getState().user
    if (!currentUser || !currentUser.id) {
      toast({
        title: 'Upload failed',
        description: 'Could not determine logged in user. Please login again.',
        duration: 4000,
      })
      return
    }

    setIsAnalyzing(true)
    setResult(null)
    try {
      const form = new FormData()
  form.append('user_id', currentUser.id)
      form.append('file', file)

      // Use axios httpClient so the Authorization header from interceptors is applied
      // Debug: dump FormData keys to console to verify file is attached
      try {
        for (const pair of form.entries()) {
          // pair is [key, value]
          if (pair[1] instanceof File) {
            console.log('FormData entry:', pair[0], (pair[1] as File).name, (pair[1] as File).size)
          } else {
            console.log('FormData entry:', pair[0], pair[1])
          }
        }
      } catch (e) {
        console.warn('Failed to enumerate FormData', e)
      }

      // The axios instance has a default Content-Type of application/json which
      // would cause the request to be sent incorrectly. Passing `undefined`
      // tells axios to let the browser set the proper multipart boundary header.
      const res = await httpClient.post('/scans/upload', form, {
        headers: {
          'Content-Type': undefined as unknown as string,
        },
      })

      // Response shape may be { success, statusCode, message, data: { ... } }
      const body = res?.data
      const payload = body?.data ?? body

      console.log('Upload API response', { status: res?.status, body, payload })

      // If server indicates failure, show message
      const successFlag = body?.success ?? (res?.status >= 200 && res?.status < 300)
      if (!successFlag) {
        console.error('Upload error', { status: res?.status, body })
        toast({
          title: 'Upload failed',
          description: body?.message || 'Failed to upload scan. Try again later.',
          duration: 5000,
        })
        return
      }

      // inner data object contains the uploaded scan and prediction
      const resultData = body?.data ?? payload
      setResult(resultData)
      toast({
        title: 'Upload successful',
        description: body?.message || 'MRI scan uploaded successfully',
        duration: 4000,
      })
    } catch (err: any) {
      // More robust logging for axios / network errors
      try {
        console.error('Upload exception (raw):', err)
        const names = Object.getOwnPropertyNames(err)
        const props = names.reduce<any>((acc, k) => {
          try {
            acc[k] = err[k]
          } catch (e) {
            acc[k] = '<unserializable>'
          }
          return acc
        }, {})
        console.error('Upload exception (props):', props)
      } catch (logErr) {
        console.error('Failed to serialize upload error', logErr)
      }

      // Decide user-facing message based on error shape
      const serverMessage = err?.response?.data?.message || err?.message
      const isNetworkError = !!err?.request && !err?.response

      toast({
        title: 'Upload failed',
        description: isNetworkError
          ? 'Network error or CORS issue. Check API server availability and CORS settings.'
          : serverMessage || 'An unexpected error occurred while uploading.',
        duration: 7000,
      })
    } finally {
      setIsAnalyzing(false)
    }
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

          {/* Result Preview */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg bg-white/5 border border-border"
            >
              <h4 className="font-medium text-foreground mb-2">Analysis Result</h4>
              <div className="flex flex-col md:flex-row gap-4 items-start">
                <div className="w-full md:w-48">
                  {/* prefer model output image if present */}
                  <img
                    src={result.model_prediction?.output_image_url || result.image_url}
                    alt="analysis output"
                    className="w-full h-auto rounded-md object-cover border"
                  />
                </div>
                <div className="flex-1 text-sm text-muted-foreground">
                  <p>
                    <span className="font-semibold text-foreground">Tumor type: </span>
                    {result.model_prediction?.tumor_type ?? 'N/A'}
                  </p>
                  <p>
                    <span className="font-semibold text-foreground">Confidence: </span>
                    {result.model_prediction?.confidence_score
                      ? (result.model_prediction.confidence_score * 100).toFixed(2) + '%'
                      : 'N/A'}
                  </p>
                  {result.model_prediction?.description && (
                    <p className="mt-2">
                      <span className="font-semibold text-foreground">Details: </span>
                      {result.model_prediction.description}
                    </p>
                  )}
                  <p className="mt-3 text-xs text-muted-foreground">Uploaded at: {new Date(result.uploaded_at).toLocaleString()}</p>
                </div>
              </div>
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
