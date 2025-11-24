"use client"

import React, { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import { httpClient } from '@/lib/http-client'
import { createReportFeedback } from '@/lib/api/feedbacks'
import { updateReport } from '@/lib/api/reports'
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
type ReportItem = any

export default function ExpertDashboard() {
  const currentUser = useAuthStore((s) => s.user)
  const initializeAuth = useAuthStore((s) => s.initializeAuth)
  const isAdmin = !!currentUser?.is_admin
  const [reports, setReports] = useState<ReportItem[]>([])
  const [loading, setLoading] = useState(false)
  const [feedbackById, setFeedbackById] = useState<Record<string, string>>({})
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewSrc, setPreviewSrc] = useState<string | null>(null)

  const loadReports = async () => {
    setLoading(true)
    try {
      const res = await httpClient.get('/reports')
      const payload = res?.data?.data ?? res?.data
      const items = Array.isArray(payload) ? payload : (payload?.items ?? [])
      setReports(items || [])
    } catch (err: any) {
      console.error('Failed to load reports for expert dashboard', err)
      toast({ title: 'Load failed', description: 'Could not fetch reports', duration: 4000 })
      setReports([])
    } finally {
      setLoading(false)
    }
  }

  // Reusable recursive helpers to find report id/object inside various payload shapes
  const findReportIdRecursive = (obj: any): string | null => {
    if (!obj || typeof obj !== 'object') return null
    if (typeof obj.report_id === 'string' && obj.report_id) return obj.report_id
    if (typeof obj.reportId === 'string' && obj.reportId) return obj.reportId
    if (obj.report && typeof obj.report === 'object' && (typeof obj.report.id === 'string')) return obj.report.id
    for (const k of Object.keys(obj)) {
      try {
        const v = (obj as any)[k]
        if (v && typeof v === 'object') {
          const found = findReportIdRecursive(v)
          if (found) return found
        }
      } catch (e) { }
    }
    return null
  }

  const findReportObjectRecursive = (obj: any): any | null => {
    if (!obj || typeof obj !== 'object') return null
    if (obj.report && typeof obj.report === 'object') return obj.report
    for (const k of Object.keys(obj)) {
      try {
        const v = (obj as any)[k]
        if (v && typeof v === 'object') {
          const found = findReportObjectRecursive(v)
          if (found) return found
        }
      } catch (e) { }
    }
    return null
  }

  // Helper to run an async API action and on 401/403 attempt re-initializing auth once and retry.
  const requestWithAuthRetry = async (action: () => Promise<any>) => {
    try {
      // Log the token being used for debugging (do not expose full token in production)
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      console.debug('[expert-dashboard] requestWithAuthRetry: token present?', !!token)
      return await action()
    } catch (err: any) {
      const status = err?.response?.status
      if (status === 401 || status === 403) {
        console.warn('[expert-dashboard] request failed with 401/403, reinitializing auth and retrying')
        try {
          await initializeAuth()
        } catch (initErr) {
          console.warn('[expert-dashboard] initializeAuth failed during retry', initErr)
        }
        // retry once
        try {
          const tokenAfter = typeof window !== 'undefined' ? localStorage.getItem('token') : null
          console.debug('[expert-dashboard] retrying action, token present?', !!tokenAfter)
          return await action()
        } catch (retryErr) {
          throw retryErr
        }
      }
      throw err
    }
  }

  useEffect(() => {
    if (!isAdmin) loadReports()
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

    // For reports view, the id is the report id
    const reportId = id

    try {
      const resp = await requestWithAuthRetry(() => createReportFeedback(reportId!, text))
      console.debug('[expert-dashboard] createReportFeedback response', resp)
      if (resp?.success || resp?.statusCode === 201 || resp?.data) {
        toast({ title: 'Feedback saved', description: 'Report feedback created successfully', duration: 3000 })
      } else {
        toast({ title: 'Submit failed', description: 'Server did not confirm feedback creation', duration: 4000 })
      }
      

      // Optionally reload reports
      loadReports()
      setFeedbackById(prev => ({ ...prev, [id]: '' }))
    } catch (err: any) {
      console.error('Failed to submit feedback', err)
      const msg = err?.response?.data?.message || err?.message || 'Could not submit feedback'
      toast({ title: 'Submit failed', description: msg, duration: 4000 })
    }
  }

  const verifyPrediction = async (id: string) => {
    // id is report id in reports view
    const reportId = id

    try {
      const resp = await requestWithAuthRetry(() => updateReport(reportId!, { is_verified: true }))
      console.debug('[expert-dashboard] updateReport response', resp)
      if (resp?.success || resp?.statusCode === 200 || resp?.data) {
        toast({ title: 'Verified', description: 'Report verified successfully', duration: 3000 })
      } else {
        console.warn('[expert-dashboard] updateReport returned unexpected response', resp)
        toast({ title: 'Verify failed', description: 'Server did not confirm verification', duration: 4000 })
      }

      loadReports()
    } catch (err: any) {
      console.error('Failed to verify prediction', err)
      const status = err?.response?.status
      if (status === 401 || status === 403) {
        // Try to refresh auth state in case token expired or role changed
        try {
          await initializeAuth()
        } catch (e) {
          console.warn('initializeAuth failed during verify error handling', e)
        }
        toast({ title: 'Verify failed', description: 'Unauthorized — please login with an expert account', duration: 6000 })
      } else {
        toast({ title: 'Verify failed', description: err?.response?.data?.message || err?.message || 'Could not verify prediction', duration: 4000 })
      }
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
        <p className="text-sm text-muted-foreground mb-6">View all reports and add feedback to predictions.</p>

        {loading && <p>Loading histories...</p>}

        {!loading && reports.length === 0 && (
          <Card className="p-6 mb-4">
            <p className="text-sm text-muted-foreground">No reports available.</p>
          </Card>
        )}

        <div className="space-y-4">
          {reports.map((r) => {
            const scanObj = (r as any).scan ?? null
            const prediction = (r as any).prediction ?? null
            const imageSrc = prediction?.output_image_url ?? scanObj?.image_url ?? null
            const filename = scanObj?.filename ?? scanObj?.id ?? r.id
            const uploadedAt = scanObj?.uploaded_at ?? r.generated_at ?? r.created_at

            const userInfo = (r as any).user ?? null

            return (
              <Card key={r.id} className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-48 shrink-0">
                    {imageSrc ? (
                      <img src={imageSrc} alt={filename} className="w-full h-auto rounded-md object-cover border cursor-zoom-in" onClick={() => openPreview(imageSrc)} />
                    ) : (
                      <div className="w-full h-32 rounded-md bg-muted flex items-center justify-center text-sm text-muted-foreground">No image</div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium">{filename}</div>
                        <div className="text-xs text-muted-foreground">Generated: {uploadedAt ? new Date(uploadedAt).toLocaleString() : '—'}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {((r as any).is_verified) ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm font-medium">Verified</span>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => verifyPrediction(r.id)}>Verify</Button>
                        )}
                      </div>
                    </div>

                    {/* User Information Section */}
                    {userInfo && (
                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-2 mb-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">Patient Information</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          {userInfo.name && (
                            <div className="flex items-center gap-2">
                              <span className="text-blue-700 dark:text-blue-300 font-medium">Name:</span>
                              <span className="text-blue-900 dark:text-blue-100">{userInfo.name}</span>
                            </div>
                          )}
                          {userInfo.email && (
                            <div className="flex items-center gap-2">
                              <span className="text-blue-700 dark:text-blue-300 font-medium">Email:</span>
                              <span className="text-blue-900 dark:text-blue-100 truncate">{userInfo.email}</span>
                            </div>
                          )}
                          {userInfo.phone && (
                            <div className="flex items-center gap-2">
                              <span className="text-blue-700 dark:text-blue-300 font-medium">Phone:</span>
                              <span className="text-blue-900 dark:text-blue-100">{userInfo.phone}</span>
                            </div>
                          )}
                          {userInfo.age && (
                            <div className="flex items-center gap-2">
                              <span className="text-blue-700 dark:text-blue-300 font-medium">Age:</span>
                              <span className="text-blue-900 dark:text-blue-100">{userInfo.age}</span>
                            </div>
                          )}
                          {userInfo.gender && (
                            <div className="flex items-center gap-2">
                              <span className="text-blue-700 dark:text-blue-300 font-medium">Gender:</span>
                              <span className="text-blue-900 dark:text-blue-100 capitalize">{userInfo.gender}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

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
                      <Input value={feedbackById[r.id] ?? ''} onChange={(e) => handleFeedbackChange(r.id, e.target.value)} placeholder="Add your feedback for this prediction" />
                      <div className="mt-3 flex justify-end gap-2">
                        <Button onClick={() => submitFeedback(r.id)} size="sm">Submit Feedback</Button>
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
