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

export default function ExpertDashboard() {
  const currentUser = useAuthStore((s) => s.user)
  const initializeAuth = useAuthStore((s) => s.initializeAuth)
  const isAdmin = !!currentUser?.is_admin
  const [scans, setScans] = useState<ScanItem[]>([])
  const [loading, setLoading] = useState(false)
  const [feedbackById, setFeedbackById] = useState<Record<string, string>>({})
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewSrc, setPreviewSrc] = useState<string | null>(null)

  const loadScans = async () => {
    setLoading(true)
    try {
      // For experts we prefer the `/histories` endpoint which contains report objects
      // so that actions like verify/feedback reflect immediately.
      let res
      try {
        res = await httpClient.get('/histories')
        const payload = res?.data?.data ?? res?.data
        // payload may be an object with items/pagination or an array
        const items = Array.isArray(payload) ? payload : (Array.isArray(payload?.items) ? payload.items : null)
        if (items) {
          setScans(items as any)
          return
        }
        // if payload itself looks like an item array, set it
      } catch (e) {
        // ignore and fallback to /scans
      }

      const res2 = await httpClient.get('/scans')
      const data = res2?.data?.data ?? res2?.data
      if (Array.isArray(data)) {
        setScans(data)
      } else if (Array.isArray(res2?.data)) {
        setScans(res2.data)
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

    let reportId = findReportIdRecursive(scanItem)

    try {
      // If not found in the list, fetch the scan details from the API and search there
      if (!reportId) {
        try {
          const single = await httpClient.get(`/scans/${id}`)
          const singleData = single?.data?.data ?? single?.data
          reportId = findReportIdRecursive(singleData)
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
            const found = findReportIdRecursive(first)
            if (found) reportId = found
            else if (first.report && first.report.id) reportId = first.report.id
          }
        } catch (hErr) {
          console.warn('Could not fetch histories to find report id', hErr)
        }
      }

      if (reportId) {
        const resp = await requestWithAuthRetry(() => createReportFeedback(reportId!, text))
        console.debug('[expert-dashboard] createReportFeedback response', resp)
        if (resp?.success || resp?.statusCode === 201 || resp?.data) {
          toast({ title: 'Feedback saved', description: 'Report feedback created successfully', duration: 3000 })
        } else {
          toast({ title: 'Submit failed', description: 'Server did not confirm feedback creation', duration: 4000 })
        }
      } else {
        // Fallback to legacy scan feedback endpoint (with auth-retry)
        const resp2 = await requestWithAuthRetry(() => httpClient.post(`/scans/${id}/feedback`, { feedback: text }))
        console.debug('[expert-dashboard] fallback feedback response', resp2)
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
    // Try to find a report id for this scan and prefer PUT /reports/:id
    const scanItem = scans.find((s) => s.id === id) as any
    let reportId = findReportIdRecursive(scanItem)

    try {
      if (!reportId) {
        try {
          const single = await httpClient.get(`/scans/${id}`)
          const singleData = single?.data?.data ?? single?.data
          reportId = findReportIdRecursive(singleData)
        } catch (e) {
          console.warn('Could not fetch scan to find report id for verify', e)
        }
      }

      if (!reportId) {
        try {
          const hist = await httpClient.get(`/histories/?scan_id=${id}&limit=1`)
          const histData = hist?.data?.data ?? hist?.data
          const items = Array.isArray(histData) ? histData : (histData?.items ?? [])
          if (items && items.length > 0) {
            const first = items[0]
            const found = findReportIdRecursive(first)
            if (found) reportId = found
            else if (first.report && first.report.id) reportId = first.report.id
          }
        } catch (hErr) {
          console.warn('Could not fetch histories to find report id for verify', hErr)
        }
      }

      if (reportId) {
        const resp = await requestWithAuthRetry(() => updateReport(reportId!, { is_verified: true }))
        console.debug('[expert-dashboard] updateReport response', resp)
        if (resp?.success || resp?.statusCode === 200 || resp?.data) {
          toast({ title: 'Verified', description: 'Report verified successfully', duration: 3000 })
        } else {
          console.warn('[expert-dashboard] updateReport returned unexpected response', resp)
          toast({ title: 'Verify failed', description: 'Server did not confirm verification', duration: 4000 })
        }
      } else {
        // Fallback to older endpoint if available (with retry)
        const resp2 = await requestWithAuthRetry(() => httpClient.post(`/scans/${id}/verify`, { verified: true }))
        console.debug('[expert-dashboard] fallback verify response', resp2)
        toast({ title: 'Verified', description: 'Prediction marked as verified', duration: 3000 })
      }

      loadScans()
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
        <p className="text-sm text-muted-foreground mb-6">View all histories and add feedback to predictions.</p>

        {loading && <p>Loading histories...</p>}

        {!loading && scans.length === 0 && (
          <Card className="p-6 mb-4">
            <p className="text-sm text-muted-foreground">No histories available.</p>
          </Card>
        )}

        <div className="space-y-4">
          {scans.map((s) => {
            // s may be a plain scan object or a history item containing report/prediction
            const historyReport = (s as any).report ?? null
            const scanObj = historyReport?.scan ?? (s as any)
            const prediction = historyReport?.prediction ?? (s as any).result?.model_prediction ?? (s as any).model_prediction ?? (s as any).prediction ?? null
            const imageSrc = prediction?.output_image_url ?? scanObj?.image_url ?? (s as any).image_url ?? null
            const filename = scanObj?.filename ?? scanObj?.id
            const uploadedAt = scanObj?.uploaded_at ?? scanObj?.uploadedAt ?? (s as any).uploaded_at

            // Extract user information
            const userInfo = (s as any).user ?? historyReport?.user ?? scanObj?.user ?? null

            return (
              <Card key={scanObj?.id ?? (s as any).id} className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-48 shrink-0">
                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt={filename ?? `Scan ${(scanObj?.id ?? (s as any).id)}`}
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
                        <div className="font-medium">{filename ?? `Scan ${(scanObj?.id ?? (s as any).id)}`}</div>
                        <div className="text-xs text-muted-foreground">Uploaded: {uploadedAt ? new Date(uploadedAt).toLocaleString() : '—'}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {(() => {
                          // determine if the report is already verified
                          const scanReport = findReportObjectRecursive(s as any) ?? findReportObjectRecursive((s as any).result ?? null)
                          const isVerified = !!(scanReport && scanReport.is_verified)
                          return isVerified ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm font-medium">Verified</span>
                          ) : (
                            <Button size="sm" variant="outline" onClick={() => verifyPrediction(s.id)}>Verify</Button>
                          )
                        })()}
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
