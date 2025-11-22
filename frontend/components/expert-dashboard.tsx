"use client"

import React, { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import { httpClient } from '@/lib/http-client'
import { createReportFeedback } from '@/lib/api/feedbacks'
import { X as XIcon } from 'lucide-react'
import AdminDashboard from './admin-users'
import { useAuthStore } from '@/lib/store/auth.store'

type ScanItem = {
  id: string
  user_id?: string
  filename?: string
  uploaded_at?: string
  result?: any
}

export default function ExpertDashboard() {
  const currentUser = useAuthStore((s) => s.user)
  const isAdmin = !!currentUser?.is_admin
  const [scans, setScans] = useState<ScanItem[]>([])
  const [loading, setLoading] = useState(false)
  const [feedbackById, setFeedbackById] = useState<Record<string, string>>({})
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewSrc, setPreviewSrc] = useState<string | null>(null)

  const loadScans = async () => {
    setLoading(true)
    try {
      const res = await httpClient.get('/scans')
      const data = res?.data?.data ?? res?.data
      if (Array.isArray(data)) {
        setScans(data)
      } else if (Array.isArray(res?.data)) {
        setScans(res.data)
      } else {
        setScans([])
      }
    } catch (err: any) {
      console.error('Failed to load scans for expert dashboard', err)
      toast({ title: 'Load failed', description: 'Could not fetch histories', duration: 4000 })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isAdmin) {
      loadScans()
    }
  }, [isAdmin])

  const handleFeedbackChange = (id: string, value: string) => {
    setFeedbackById(prev => ({ ...prev, [id]: value }))
  }

  const submitFeedback = async (id: string) => {
    const text = feedbackById[id]
    if (!text || text.trim().length === 0) {
      toast({ title: 'Empty feedback', description: 'Please enter feedback before submitting', duration: 2000 })
      return
    }
    // Try to find the scan item to see if a report id exists
    const scanItem = scans.find((s) => s.id === id) as any

    // recursive search for report id in an object
    const findReportId = (obj: any): string | null => {
      if (!obj || typeof obj !== 'object') return null
      // common keys
      if (typeof obj.report_id === 'string' && obj.report_id) return obj.report_id
      if (typeof obj.reportId === 'string' && obj.reportId) return obj.reportId
      if (obj.report && typeof obj.report === 'object' && (typeof obj.report.id === 'string')) return obj.report.id
      // shallow search
      for (const k of Object.keys(obj)) {
        try {
          const v = (obj as any)[k]
          if (v && typeof v === 'object') {
            const found = findReportId(v)
            if (found) return found
          }
        } catch (e) {
          // ignore
        }
      }
      return null
    }

    let reportId = findReportId(scanItem)

    try {
      // If not found in the list, fetch the scan details from the API and search there
      if (!reportId) {
        try {
          const single = await httpClient.get(`/scans/${id}`)
          const singleData = single?.data?.data ?? single?.data
          reportId = findReportId(singleData)
        } catch (fetchErr) {
          // ignore fetch error here; we'll fallback to legacy endpoint
          console.warn('Could not fetch single scan to find report id', fetchErr)
        }
      }

      // If still not found, try the histories endpoint to locate a report by scan id
      if (!reportId) {
        try {
          const hist = await httpClient.get(`/histories/?scan_id=${id}&limit=1`)
          const histData = hist?.data?.data ?? hist?.data
          const items = Array.isArray(histData) ? histData : (histData?.items ?? [])
          if (items && items.length > 0) {
            const first = items[0]
            const found = findReportId(first)
            if (found) reportId = found
            else if (first.report && first.report.id) reportId = first.report.id
          }
        } catch (hErr) {
          console.warn('Could not fetch histories to find report id', hErr)
        }
      }

      if (reportId) {
        await createReportFeedback(reportId, text)
        toast({ title: 'Feedback saved', description: 'Report feedback created successfully', duration: 3000 })
      } else {
        // Fallback to legacy scan feedback endpoint
        await httpClient.post(`/scans/${id}/feedback`, { feedback: text })
        toast({ title: 'Feedback saved', description: 'Your feedback was submitted', duration: 3000 })
      }

      // Optionally reload scans
      loadScans()
      setFeedbackById(prev => ({ ...prev, [id]: '' }))
    } catch (err: any) {
      console.error('Failed to submit feedback', err)
      const msg = err?.response?.data?.message || err?.message || 'Could not submit feedback'
      toast({ title: 'Submit failed', description: msg, duration: 4000 })
    }
  }

  const verifyPrediction = async (id: string) => {
    try {
      await httpClient.post(`/scans/${id}/verify`, { verified: true })
      toast({ title: 'Verified', description: 'Prediction marked as verified', duration: 3000 })
      loadScans()
    } catch (err: any) {
      console.error('Failed to verify prediction', err)
      toast({ title: 'Verify failed', description: err?.response?.data?.message || 'Could not verify prediction', duration: 4000 })
    }
  }

  const openPreview = (src?: string | null) => {
    if (!src) return
    setPreviewSrc(src)
    setPreviewOpen(true)
  }

  const closePreview = () => {
    setPreviewOpen(false)
    setTimeout(() => setPreviewSrc(null), 200)
  }

  if (isAdmin) {
    // Admins now see dashboard on home page, redirect or show message
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Restricted</h2>
          <p className="text-muted-foreground">Please visit the home page to access the admin dashboard.</p>
        </div>
      </div>
    )
  }

  return (
    <section className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Expert Dashboard</h2>
        <p className="text-sm text-muted-foreground mb-6">View all histories and add feedback to predictions.</p>

        {loading && <p>Loading histories...</p>}

        {!loading && scans.length === 0 && (
          <Card className="p-6 mb-4">
            <p className="text-sm text-muted-foreground">No histories available.</p>
          </Card>
        )}

        <div className="space-y-4">
          {scans.map((s) => {
            const scanResult = (s as any).result ?? (s as any).data ?? null
            const prediction = scanResult?.model_prediction ?? scanResult ?? (s as any).model_prediction ?? null
            const imageSrc = prediction?.output_image_url ?? scanResult?.image_url ?? (s as any).image_url ?? null

            return (
              <Card key={s.id} className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-48 shrink-0">
                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt={s.filename ?? `Scan ${s.id}`}
                        className="w-full h-auto rounded-md object-cover border cursor-zoom-in"
                        onClick={() => openPreview(imageSrc)}
                      />
                    ) : (
                      <div className="w-full h-32 rounded-md bg-muted flex items-center justify-center text-sm text-muted-foreground">No image</div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium">{s.filename ?? `Scan ${s.id}`}</div>
                        <div className="text-xs text-muted-foreground">Uploaded: {s.uploaded_at ? new Date(s.uploaded_at).toLocaleString() : '—'}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => verifyPrediction(s.id)}>Verify</Button>
                      </div>
                    </div>

                    <div className="mt-3 text-sm text-muted-foreground">
                      <p>
                        <span className="font-semibold text-foreground">Tumor type: </span>
                        {prediction?.tumor_type ?? 'N/A'}
                      </p>
                      <p>
                        <span className="font-semibold text-foreground">Confidence: </span>
                        {prediction?.confidence_score != null
                          ? (prediction.confidence_score * 100).toFixed(2) + '%'
                          : 'N/A'}
                      </p>
                      {prediction?.description && (
                        <p className="mt-2">
                          <span className="font-semibold text-foreground">Details: </span>
                          {prediction.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-4">
                      <Label className='mb-2'>Feedback</Label>
                      <Input value={feedbackById[s.id] ?? ''} onChange={(e) => handleFeedbackChange(s.id, e.target.value)} placeholder="Add your feedback for this prediction" />
                      <div className="mt-3 flex justify-end gap-2">
                        <Button onClick={() => submitFeedback(s.id)} size="sm">Submit Feedback</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

      </div>
    </section>
  )
}
