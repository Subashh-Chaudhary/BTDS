"use client"

import React, { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'
import { httpClient } from '@/lib/http-client'
import { useAuthStore } from '@/lib/store/auth.store'
import { X as XIcon, Search, Users, UserCheck, Stethoscope, FileText, TrendingUp, Eye, Calendar, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

type UserItem = any
type ScanItem = any

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserItem[]>([])
  const [scans, setScans] = useState<ScanItem[]>([])
  const [loading, setLoading] = useState(false)
  const [scansLoading, setScansLoading] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({})
  const [confirmDelete, setConfirmDelete] = useState<{ id: string, user_type?: string } | null>(null)
  const [confirmDeleteReport, setConfirmDeleteReport] = useState<{ id: string } | null>(null)
  const [confirmInspectReport, setConfirmInspectReport] = useState<{ id: string } | null>(null)
  const [histories, setHistories] = useState<any[]>([])
  const [historiesLoading, setHistoriesLoading] = useState(false)
  const [reportDetails, setReportDetails] = useState<any | null>(null)
  const [reportLoading, setReportLoading] = useState(false)
  const [feedbackByReport, setFeedbackByReport] = useState<Record<string, any[]>>({})
  const [loadingFeedback, setLoadingFeedback] = useState<Record<string, boolean>>({})
  const [query, setQuery] = useState('')
  const [editingUser, setEditingUser] = useState<UserItem | null>(null)
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm_password: '', user_type: 'user' })
  const currentUser = useAuthStore((s) => s.user)
  
  const logout = useAuthStore((s) => s.logout)
  const router = useRouter()

  // Stats calculations
  const stats = useMemo(() => {
    const totalUsers = users.length
    const activeUsers = users.filter(u => u.is_active).length
    const experts = users.filter(u => u.user_type === 'expert').length
    const totalScans = scans.length
    const recentScans = scans.filter(s => {
      const uploadedAt = new Date(s.uploaded_at)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return uploadedAt >= weekAgo
    }).length

    return { totalUsers, activeUsers, experts, totalScans, recentScans }
  }, [users, scans])

  const loadUsers = async () => {
    setLoading(true)
    try {
      // Fetch both users and experts and merge them into a single list
      const [usersRes, expertsRes] = await Promise.allSettled([
        httpClient.get('/users'),
        httpClient.get('/experts'),
      ])

      const extractItems = (res: any) => {
        const r = res?.value ?? res?.reason ?? res
        const data = r?.data?.data ?? r?.data
        return data?.items ?? (Array.isArray(r?.data) ? r.data : [])
      }

      const userItems = usersRes.status === 'fulfilled' ? extractItems(usersRes) : []
      const expertItems = expertsRes.status === 'fulfilled' ? extractItems(expertsRes) : []

      // Normalize and tag items so we know which endpoint to call on actions
      const normalizedUsers = (userItems || []).map((u: any) => ({ ...(u || {}), user_type: (u?.user_type ?? 'user') }))
      const normalizedExperts = (expertItems || []).map((e: any) => ({ ...(e || {}), user_type: 'expert' }))

      // Merge and deduplicate by id (users + experts may not overlap)
      const merged = [...normalizedUsers, ...normalizedExperts]
      const byId: Record<string, any> = {}
      for (const item of merged) {
        byId[item.id] = { ...byId[item.id], ...item }
      }

      setUsers(Object.values(byId))
    } catch (err: any) {
      console.error('Failed to load users/experts', err)
      toast({ title: 'Load failed', description: 'Could not fetch users or experts', duration: 4000 })
    } finally {
      setLoading(false)
    }
  }

  const loadScans = async () => {
    setScansLoading(true)
    try {
      // Prefer /reports endpoint (returns richer report objects), fall back to /scans
      let res = await httpClient.get('/reports')
      let data = res?.data?.data ?? res?.data
      if (!Array.isArray(data)) {
        // backend might return { items: [...] }
        data = data?.items ?? (Array.isArray(res?.data) ? res.data : [])
      }

      if (!Array.isArray(data) || data.length === 0) {
        // fallback to scans endpoint
        const scansRes = await httpClient.get('/scans')
        const scansData = scansRes?.data?.data ?? scansRes?.data
        if (Array.isArray(scansData)) setScans(scansData)
        else if (Array.isArray(scansRes?.data)) setScans(scansRes.data)
        else setScans([])
      } else {
        setScans(data)
        // Prefetch feedbacks for visible reports (first 10)
        try {
          for (const it of (data || []).slice(0, 10)) {
            if (it?.id) loadFeedback(it.id)
          }
        } catch (e) { /* ignore */ }
      }
    } catch (err: any) {
      console.error('Failed to load scans/reports', err)
      toast({ title: 'Load failed', description: 'Could not fetch scans or reports', duration: 4000 })
      setScans([])
    } finally {
      setScansLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
    loadScans()
  }, [])

  const filtered = useMemo(() => {
    if (!query) return users
    return users.filter(u => (u.name || '').toLowerCase().includes(query.toLowerCase()) || (u.email || '').toLowerCase().includes(query.toLowerCase()))
  }, [users, query])

  const setAction = (id: string, v: boolean) => setActionLoading(prev => ({ ...prev, [id]: v }))

  const toggleActive = async (user: UserItem, value: boolean) => {
    try {
      const id = user.id
      setAction(id, true)
      // Update activation according to DTO/endpoints
      toast({ title: value ? 'Activated' : 'Deactivated', description: 'User status updated', duration: 3000 })
      loadUsers()
    } catch (err: any) {
      console.error('Failed to update user', err)
      toast({ title: 'Update failed', description: 'Could not update user', duration: 4000 })
    } finally {
      setAction(user.id, false)
    }
  }

  const deleteUser = async (id: string, userType?: string) => {
    try {
      setAction(id, true)
      // Route deletion by user_type per API (experts -> /expert/:id, users -> /user/:id)
      const path = userType === 'expert' ? `/expert/${id}` : `/user/${id}`
      await httpClient.delete(path)
      toast({ title: 'Deleted', description: `${userType === 'expert' ? 'Expert' : 'User'} deleted successfully`, duration: 3000 })
      loadUsers()
    } catch (err: any) {
      console.error('Failed to delete user', err)
      toast({ title: 'Delete failed', description: 'Could not delete user', duration: 4000 })
    } finally {
      setAction(id, false)
      setConfirmDelete(null)
    }
  }

  const deleteReport = async (id: string) => {
    try {
      setAction(id, true)

      // 1) Try to find a history by report_id filter
      let historyId: string | null = null
      try {
        const res = await httpClient.get(`/histories/?report_id=${id}&limit=1`)
        const payload = res?.data?.data ?? res?.data
        const items = Array.isArray(payload) ? payload : (payload?.items ?? [])
        if (items && items.length > 0) historyId = items[0]?.id ?? null
      } catch (e) {
        console.debug('histories?report_id lookup failed', e)
      }

      // 2) If not found, fetch recent histories and search for embedded report object
      if (!historyId) {
        try {
          const res2 = await httpClient.get('/histories/?limit=100')
          const payload2 = res2?.data?.data ?? res2?.data
          const items2 = Array.isArray(payload2) ? payload2 : (payload2?.items ?? [])
          for (const it of (items2 || [])) {
            if (!it) continue
            if (it.report && (it.report.id === id || it.report_id === id)) {
              historyId = it.id
              break
            }
            // fallback: some payloads embed report deeper; stringify-check as last resort
            try {
              const s = JSON.stringify(it)
              if (s.includes(id)) {
                historyId = it.id
                break
              }
            } catch (jsonErr) { }
          }
        } catch (e) {
          console.debug('listing histories to search for report id failed', e)
        }
      }

      // 3) If we found a history id, delete it
      if (historyId) {
        await httpClient.delete(`/histories/${historyId}`)
        toast({ title: 'Deleted', description: 'Report deleted successfully', duration: 3000 })
        loadScans()
        return
      }

      // 4) As a fallback, try deleting the report resource itself (preferred path)
      try {
        await httpClient.delete(`/reports/${id}`)
        toast({ title: 'Deleted', description: 'Report resource deleted successfully', duration: 3000 })
        loadScans()
        return
      } catch (err: any) {
        // surface server error details for debugging (403/permission issues)
        console.error('Delete /reports/{id} failed', err?.response ?? err)
        const msg = err?.response?.data?.message || err?.message || 'Could not delete report'
        // 5) If report delete is not available/allowed, as a last attempt, try deleting the id as a history id
        try {
          await httpClient.delete(`/histories/${id}`)
          toast({ title: 'Deleted', description: 'Report resource deleted via history id', duration: 3000 })
          loadScans()
          return
        } catch (err2: any) {
          console.error('Delete /histories/{id} fallback failed', err2?.response ?? err2)
          const msg2 = err2?.response?.data?.message || err2?.message || msg
          toast({ title: 'Delete failed', description: msg2, duration: 4000 })
          return
        }
      }

    } catch (err: any) {
      console.error('Failed to delete report', err)
      toast({ title: 'Delete failed', description: err?.response?.data?.message || err?.message || 'Could not delete report', duration: 4000 })
    } finally {
      setAction(id, false)
      setConfirmDeleteReport(null)
    }
  }

  const loadHistoriesForReport = async (reportId: string) => {
    setHistoriesLoading(true)
    try {
      const res = await httpClient.get(`/histories/?report_id=${reportId}&limit=50`)
      const payload = res?.data?.data ?? res?.data
      const items = Array.isArray(payload) ? payload : (payload?.items ?? [])
      setHistories(items || [])
    } catch (err: any) {
      console.error('Failed to load histories for report', err)
      toast({ title: 'Load failed', description: 'Could not fetch histories for report', duration: 4000 })
      setHistories([])
    } finally {
      setHistoriesLoading(false)
    }
  }

  const openInspect = (reportId: string) => {
    setConfirmInspectReport({ id: reportId })
    loadHistoriesForReport(reportId)
    loadReportDetails(reportId)
    loadFeedback(reportId)
  }

  const loadReportDetails = async (reportId: string) => {
    if (!reportId) return
    setReportLoading(true)
    try {
      // try dedicated endpoint
      try {
        const r = await httpClient.get(`/reports/${reportId}`)
        const payload = r?.data?.data ?? r?.data
        setReportDetails(payload ?? r?.data ?? null)
        return
      } catch (e) {
        // ignore and fallthrough to list scan lookup
      }

      // fallback: check already loaded reports/scans
      const found = scans.find((it: any) => it?.id === reportId)
      if (found) {
        setReportDetails(found)
        return
      }

      // final fallback: fetch all reports and find
      const listRes = await httpClient.get('/reports')
      const listPayload = listRes?.data?.data ?? listRes?.data
      const items = Array.isArray(listPayload) ? listPayload : (listPayload?.items ?? [])
      const f = (items || []).find((it: any) => it?.id === reportId) ?? null
      setReportDetails(f)
    } catch (err: any) {
      console.error('Failed to load report details', err)
      setReportDetails(null)
    } finally {
      setReportLoading(false)
    }
  }

  const deleteReportResource = async (reportId: string) => {
    if (!reportId) return
    try {
      setAction(reportId, true)
      await httpClient.delete(`/reports/${reportId}`)
      toast({ title: 'Deleted', description: 'Report deleted successfully', duration: 3000 })
      loadScans()
      setConfirmInspectReport(null)
      setReportDetails(null)
      setHistories([])
    } catch (err: any) {
      console.error('Failed to delete report resource', err?.response ?? err)
      const msg = err?.response?.data?.message || err?.message || 'Could not delete report'
      toast({ title: 'Delete failed', description: msg, duration: 5000 })
    } finally {
      setAction(reportId, false)
    }
  }

  const deleteHistory = async (historyId: string) => {
    try {
      setAction(historyId, true)
      await httpClient.delete(`/histories/${historyId}`)
      toast({ title: 'Deleted', description: 'History entry deleted', duration: 3000 })
      // refresh lists
      loadScans()
      if (confirmInspectReport?.id) loadHistoriesForReport(confirmInspectReport.id)
    } catch (err: any) {
      console.error('Failed to delete history', err)
      const msg = err?.response?.data?.message || err?.message || 'Could not delete history'
      toast({ title: 'Delete failed', description: msg, duration: 5000 })
    } finally {
      setAction(historyId, false)
    }
  }

  const loadFeedback = async (reportId: string) => {
    if (!reportId) return
    if (feedbackByReport[reportId] && feedbackByReport[reportId].length > 0) return
    setLoadingFeedback(prev => ({ ...prev, [reportId]: true }))
    try {
      const res = await httpClient.get(`/feedbacks/report/${reportId}`)
      const payload = res?.data?.data ?? res?.data
      const items = Array.isArray(payload) ? payload : (payload?.items ?? [])
      setFeedbackByReport(prev => ({ ...prev, [reportId]: items || [] }))
    } catch (err: any) {
      console.error('Failed to load feedback for report', reportId, err)
      setFeedbackByReport(prev => ({ ...prev, [reportId]: [] }))
    } finally {
      setLoadingFeedback(prev => ({ ...prev, [reportId]: false }))
    }
  }

  const openEdit = (u: UserItem) => {
    setEditingUser(u)
    setForm({ name: u.name ?? '', email: u.email ?? '', password: '', confirm_password: '', user_type: u.user_type ?? 'user' })
  }

  const validateNewUser = () => {
    const errors: string[] = []
    const name = (form.name || '').trim()
    const email = (form.email || '').trim()
    const password = form.password || ''
    const confirm = form.confirm_password || ''
    const userType = form.user_type

    if (!name) errors.push('Name is required')
    if (name && name.length < 3) errors.push('Name must be at least 3 characters long')
    if (name && name.length > 100) errors.push('Name cannot exceed 100 characters')

    const emailRegex = /[^\s@]+@[^\s@]+\.[^\s@]+/
    if (!email) errors.push('Email is required')
    if (email && !emailRegex.test(email)) errors.push('Please provide a valid email address')

    if (!password) errors.push('Password is required')
    if (password && password.length < 8) errors.push('Password must be at least 8 characters long')

    if (!confirm) errors.push('Confirm password is required')
    if (confirm && password !== confirm) errors.push('Confirm password must match password')

    if (!userType) errors.push('User type is required')
    if (userType && !['user','expert'].includes(userType)) errors.push('User type must be either user or expert')

    return errors
  }

  const submitNewUser = async () => {
    // Client-side validations to mirror backend DTO
    const errors = validateNewUser()
    if (errors.length) {
      toast({ title: 'Validation error', description: errors.join('\n'), duration: 5000 })
      return
    }
    try {
      const res = await httpClient.post('/auth/register', form)
      const msg = res?.data?.message || 'User registered successfully'
      toast({ title: 'User added', description: msg, duration: 3000 })
      setShowAdd(false)
      setForm({ name: '', email: '', password: '', confirm_password: '', user_type: 'user' })
      loadUsers()
    } catch (err: any) {
      console.error('Failed to add user', err)
      toast({ title: 'Add failed', description: err?.response?.data?.message || 'Could not add user', duration: 4000 })
    }
  }

  const submitEdit = async () => {
    if (!editingUser) return
    try {
      setAction(editingUser.id, true)
      // Use PUT and payloads aligned with UpdateUserDto / UpdateExpertDto
      if (editingUser.user_type === 'expert') {
        await httpClient.put(`/expert/${editingUser.id}`, {
          name: form.name,
          email: form.email,
        })
      } else {
        await httpClient.put(`/user/${editingUser.id}`, {
          name: form.name,
          email: form.email,
        })
      }
      toast({ title: 'Updated', description: `${editingUser.user_type === 'expert' ? 'Expert' : 'User'} updated`, duration: 3000 })
      setEditingUser(null)
      loadUsers()
    } catch (err: any) {
      console.error('Failed to update user', err)
      toast({ title: 'Update failed', description: err?.response?.data?.message || 'Could not update user', duration: 4000 })
    } finally {
      setAction(editingUser.id, false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Admin Navigation Header */}
      <nav className="bg-white/95 backdrop-blur-sm border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">BT</span>
            </div>
            <span className="font-bold text-lg text-slate-800">BrainDetect Admin</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-100 transition">
                <Avatar>
                  <AvatarFallback>{currentUser?.name?.[0] ?? 'A'}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{currentUser?.name ?? 'Admin'}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onSelect={() => { logout(); router.push('/'); }}
                className="text-red-600 hover:text-red-700"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto space-y-8 p-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-linear-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent mb-2">
            Admin Dashboard
          </h1>
          <p className="text-slate-600 text-lg">
            Comprehensive overview of users, predictions, and system analytics
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-linear-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalUsers}</div>
              <p className="text-blue-100 text-sm mt-1">Registered accounts</p>
            </CardContent>
          </Card>

          <Card className="bg-linear-to-r from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                Active Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.activeUsers}</div>
              <p className="text-green-100 text-sm mt-1">Currently active</p>
            </CardContent>
          </Card>

          <Card className="bg-linear-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <Stethoscope className="h-4 w-4" />
                Experts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.experts}</div>
              <p className="text-purple-100 text-sm mt-1">Medical professionals</p>
            </CardContent>
          </Card>

          <Card className="bg-linear-to-r from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Total Scans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalScans}</div>
              <p className="text-orange-100 text-sm mt-1">Predictions generated</p>
            </CardContent>
          </Card>
        </div>

        {/* User Management Section */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-slate-800">User Management</CardTitle>
                <p className="text-slate-600 mt-1">Manage application users and experts</p>
              </div>
              <Button onClick={() => setShowAdd(true)} className="bg-blue-600 hover:bg-blue-700">
                <Users className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  className="pl-10"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search users by name or email..."
                />
              </div>
            </div>

            {loading && <p className="text-center py-8">Loading users...</p>}

            {!loading && (
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">User</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filtered.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-linear-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                              {u.name?.[0] ?? 'U'}
                            </div>
                            <div>
                              <div className="font-medium text-slate-900">{u.name}</div>
                              <div className="text-xs text-slate-500">
                                Joined {new Date(u.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700">{u.email}</td>
                        <td className="px-6 py-4">
                          <Badge variant={u.user_type === 'expert' ? 'default' : 'secondary'}>
                            {u.is_admin ? 'Admin' : u.user_type ?? 'user'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={u.is_active ? 'default' : 'destructive'}>
                            {u.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant={u.is_active ? 'outline' : 'default'}
                              onClick={() => toggleActive(u, !u.is_active)}
                              disabled={!!actionLoading[u.id]}
                            >
                              {actionLoading[u.id] ? '...' : (u.is_active ? 'Deactivate' : 'Activate')}
                            </Button>
                            {!u.is_admin && (
                              <>
                                <Button size="sm" variant="outline" onClick={() => openEdit(u)}>
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => setConfirmDelete({ id: u.id, user_type: u.user_type })}
                                >
                                  Delete
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Predictions Report Section */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-slate-800">Predictions Report</CardTitle>
                <p className="text-slate-600 mt-1">Recent medical scan predictions and analytics</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-900">{stats.recentScans}</div>
                  <div className="text-sm text-slate-500">This week</div>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {scansLoading && <p className="text-center py-8">Loading predictions...</p>}

            {!scansLoading && scans.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500">No predictions available</p>
              </div>
            )}

            {!scansLoading && scans.length > 0 && (
              <div className="space-y-4">
                {scans.slice(0, 10).map((s) => {
                  const scanResult = (s as any).result ?? (s as any).data ?? null
                  const prediction = scanResult?.model_prediction ?? scanResult ?? (s as any).model_prediction ?? null
                  const imageSrc = prediction?.output_image_url ?? scanResult?.image_url ?? (s as any).image_url ?? null

                  // Resolve user info: scans may embed `user` or reference `user_id`
                  const scanUser = (s as any).user ?? users.find(u => u.id === (s as any).user_id || (scanResult && scanResult.user_id));

                  return (
                    <div key={s.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                          {imageSrc ? (
                            <img
                              src={imageSrc}
                              alt={s.filename ?? `Scan ${s.id}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <FileText className="h-6 w-6" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-slate-900 truncate">
                                {s.filename ?? `Scan ${s.id}`}
                              </h4>
                              <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {s.uploaded_at ? new Date(s.uploaded_at).toLocaleDateString() : '—'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Eye className="h-3 w-3" />
                                  {prediction?.tumor_type ?? 'Pending'}
                                </span>
                              </div>
                              {scanUser && (
                                <div className="mt-3 flex items-center gap-3 text-sm text-slate-700">
                                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-medium">
                                    {scanUser.name?.[0] ?? scanUser.email?.[0] ?? 'U'}
                                  </div>
                                  <div className="leading-tight">
                                    <div className="font-medium text-slate-900">{scanUser.name ?? 'Unknown'}</div>
                                    <div className="text-xs text-slate-500">{scanUser.email ?? scanUser.phone ?? ''}</div>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <Badge variant={prediction?.tumor_type === 'none' ? 'secondary' : 'destructive'}>
                                {prediction?.tumor_type ?? 'Detected'}
                              </Badge>
                              <div className="flex flex-col items-end gap-2">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => openInspect(s.id)}
                                  disabled={!!actionLoading[s.id]}
                                >
                                  {actionLoading[s.id] ? '...' : 'Inspect'}
                                </Button>
                              </div>
                            </div>
                          </div>

                          {prediction?.description && (
                            <div className="mt-2">
                              <p className="text-sm text-slate-600">{prediction.description}</p>

                              <div className="mt-3 text-xs text-slate-500">
                                <div>Generated: {s.generated_at ? new Date(s.generated_at).toLocaleString() : (s.created_at ? new Date(s.created_at).toLocaleString() : (prediction?.created_at ? new Date(prediction.created_at).toLocaleString() : '—'))}</div>
                                <div>Report id: <span className="font-mono text-xs">{s.id}</span></div>
                              </div>

                              {prediction?.confidence_score != null && (
                                <div className="mt-2">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600">Confidence</span>
                                    <span className="font-medium">{(prediction.confidence_score * 100).toFixed(1)}%</span>
                                  </div>
                                  <div className="w-full bg-slate-200 rounded-full h-2 mt-1">
                                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${prediction.confidence_score * 100}%` }} />
                                  </div>
                                </div>
                              )}

                              {/* Feedbacks section */}
                              <div className="mt-3">
                                <div className="text-sm font-medium text-slate-700 mb-1">Feedback</div>
                                {loadingFeedback[s.id] && <div className="text-xs text-slate-500">Loading feedback...</div>}
                                {(!loadingFeedback[s.id] && (!feedbackByReport[s.id] || feedbackByReport[s.id].length === 0)) && (
                                  <div className="text-xs text-slate-500">No feedback available</div>
                                )}
                                {feedbackByReport[s.id] && feedbackByReport[s.id].length > 0 && (
                                  <div className="space-y-2">
                                    {feedbackByReport[s.id].map((f: any) => (
                                      <div key={f.id} className="border rounded p-2 bg-slate-50">
                                        <div className="text-sm text-slate-800">{f.feedback_text}</div>
                                        <div className="text-xs text-slate-500 mt-1">By: {f.expert?.name ?? f.expert?.email ?? 'Expert' } ({f.expert?.email ?? '-'})</div>
                                        <div className="text-xs text-slate-400">Verified: {f.verified_at ? new Date(f.verified_at).toLocaleString() : 'No'}</div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Confirm delete dialog */}
        {confirmDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl">
              <h3 className="text-lg font-semibold mb-3 text-slate-900">Confirm delete</h3>
              <p className="text-sm text-slate-600 mb-4">
                Are you sure you want to permanently delete this user? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setConfirmDelete(null)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => deleteUser(confirmDelete.id, confirmDelete.user_type)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Confirm delete dialog for reports */}
        {confirmDeleteReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl">
              <h3 className="text-lg font-semibold mb-3 text-slate-900">Confirm delete report</h3>
              <p className="text-sm text-slate-600 mb-4">
                Are you sure you want to permanently delete this report? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setConfirmDeleteReport(null)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => deleteReport(confirmDeleteReport.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Inspect report modal: show full report, prediction, scan, user, feedbacks, and histories */}
        {confirmInspectReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full shadow-2xl">
              <div className="flex items-start gap-4">
                <div className="w-48 h-48 bg-slate-100 rounded overflow-hidden flex items-center justify-center">
                  {reportLoading && <div className="text-sm text-slate-500">Loading...</div>}
                  {!reportLoading && reportDetails && (
                    <img src={reportDetails.prediction?.output_image_url ?? reportDetails.scan?.image_url ?? ''} alt="output" className="w-full h-full object-cover" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">Report: <span className="font-mono text-xs">{confirmInspectReport.id}</span></h3>
                      <div className="text-sm text-slate-500">Generated: {reportDetails?.generated_at ? new Date(reportDetails.generated_at).toLocaleString() : reportDetails?.created_at ? new Date(reportDetails.created_at).toLocaleString() : '—'}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">Verified: {reportDetails?.is_verified ? 'Yes' : 'No'}</div>
                      <div className="text-sm">Prediction: <span className="font-medium">{reportDetails?.prediction?.tumor_type ?? '-'}</span></div>
                    </div>
                  </div>

                  <div className="mt-3 text-sm text-slate-700">
                    <div className="font-medium">Prediction Details</div>
                    <div className="text-xs text-slate-600 mt-1">{reportDetails?.prediction?.description ?? '-'}</div>
                    {reportDetails?.prediction?.confidence_score != null && (
                      <div className="mt-2 text-xs text-slate-600">Confidence: {(reportDetails.prediction.confidence_score * 100).toFixed(1)}%</div>
                    )}
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium">User</div>
                      <div className="text-xs text-slate-600">{reportDetails?.user?.name ?? reportDetails?.user?.email ?? '-'}</div>
                      <div className="text-xs text-slate-500">Email: {reportDetails?.user?.email ?? '-'}</div>
                      <div className="text-xs text-slate-500">Phone: {reportDetails?.user?.phone ?? '-'}</div>
                    </div>
                    <div>
                      <div className="font-medium">Scan</div>
                      <div className="text-xs text-slate-600">Scan id: <span className="font-mono text-xs">{reportDetails?.scan?.id ?? '-'}</span></div>
                      <div className="text-xs text-slate-500">Uploaded: {reportDetails?.scan?.uploaded_at ? new Date(reportDetails.scan.uploaded_at).toLocaleString() : '-'}</div>
                      <div className="text-xs text-slate-500">Image: <a className="text-blue-600 underline" href={reportDetails?.scan?.image_url} target="_blank" rel="noreferrer">Open</a></div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="font-medium text-sm">Feedbacks</div>
                    <div className="mt-2">
                      {loadingFeedback[confirmInspectReport.id] && <div className="text-xs text-slate-500">Loading feedback...</div>}
                      {(!loadingFeedback[confirmInspectReport.id] && (!feedbackByReport[confirmInspectReport.id] || feedbackByReport[confirmInspectReport.id].length === 0)) && (
                        <div className="text-xs text-slate-500">No feedback available</div>
                      )}
                      {feedbackByReport[confirmInspectReport.id] && feedbackByReport[confirmInspectReport.id].length > 0 && (
                        <div className="space-y-2 mt-2">
                          {feedbackByReport[confirmInspectReport.id].map((f: any) => (
                            <div key={f.id} className="border rounded p-2 bg-slate-50">
                              <div className="text-sm text-slate-800">{f.feedback_text}</div>
                              <div className="text-xs text-slate-500">By: {f.expert?.name ?? f.expert?.email ?? '-' } ({f.expert?.email ?? '-'})</div>
                              <div className="text-xs text-slate-400">Verified: {f.verified_at ? new Date(f.verified_at).toLocaleString() : 'No'}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <Button variant="outline" onClick={() => { setConfirmInspectReport(null); setReportDetails(null); setHistories([]) }}>Close</Button>
                    <Button variant="destructive" onClick={() => deleteReportResource(confirmInspectReport.id)}>Delete Report</Button>
                    <Button variant="outline" onClick={() => loadHistoriesForReport(confirmInspectReport.id)}>Refresh Histories</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit modal */}
        {(showAdd || editingUser) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  {editingUser ? 'Edit User' : 'Add User'}
                </h3>
                <button
                  onClick={() => { setShowAdd(false); setEditingUser(null); }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <XIcon />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-slate-700">Name</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-slate-700">Email</Label>
                  <Input
                    value={form.email}
                    onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                {!editingUser && (
                  <>
                    <div>
                      <Label className="text-slate-700">Password</Label>
                      <Input
                        type="password"
                        value={form.password}
                        onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-700">Confirm Password</Label>
                      <Input
                        type="password"
                        value={form.confirm_password}
                        onChange={(e) => setForm(prev => ({ ...prev, confirm_password: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-700">User Type</Label>
                      <Select
                        value={form.user_type}
                        onValueChange={(v) => setForm(prev => ({ ...prev, user_type: v as 'user' | 'expert' }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select user type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => { setShowAdd(false); setEditingUser(null); }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => editingUser ? submitEdit() : submitNewUser()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {editingUser ? 'Save' : 'Create'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
