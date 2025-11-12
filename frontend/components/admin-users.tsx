"use client"

import React, { useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { httpClient } from '@/lib/http-client'
import { useAuthStore } from '@/lib/store/auth.store'
import { X as XIcon, Search } from 'lucide-react'

type UserItem = any

export default function AdminUsers() {
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({})
  const [confirmDelete, setConfirmDelete] = useState<{ id: string, user_type?: string } | null>(null)
  const [query, setQuery] = useState('')
  const [editingUser, setEditingUser] = useState<UserItem | null>(null)
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm_password: '', user_type: 'user' })
  const currentUser = useAuthStore((s) => s.user)

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

  useEffect(() => { loadUsers() }, [])

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
      if (user.user_type === 'expert') {
        await httpClient.put(`/expert/${id}`, { is_active: value })
      } else {
        await httpClient.put(`/user/${id}`, { is_active: value })
      }
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
    <section className="py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">User Management</h2>
            <p className="text-sm text-muted-foreground">Manage application users — activate, edit, or remove accounts.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2 text-muted-foreground" />
              <Input className="pl-10" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search users by name or email" />
            </div>
            <Button onClick={() => setShowAdd(true)}>Add User</Button>
          </div>
        </div>

        {loading && <p>Loading users...</p>}

        <div className="overflow-x-auto bg-card rounded-md border border-border">
          <table className="w-full table-auto">
            <thead>
              <tr className="text-left text-sm text-muted-foreground">
                <th className="p-3">User</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} className="border-t border-border">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">{u.name?.[0] ?? 'U'}</div>
                      <div>
                        <div className="font-medium">{u.name}</div>
                        <div className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-sm">{u.email}</td>
                  <td className="p-3 text-sm">{u.is_admin ? 'Admin' : u.user_type ?? 'user'}</td>
                  <td className="p-3 text-sm">{u.is_active ? <span className="text-green-500">Active</span> : <span className="text-red-500">Inactive</span>}</td>
                  <td className="p-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant={u.is_active ? 'ghost' : 'outline'} onClick={() => toggleActive(u, !u.is_active)} disabled={!!actionLoading[u.id]}>
                        {actionLoading[u.id] ? '...' : (u.is_active ? 'Deactivate' : 'Activate')}
                      </Button>
                      {!u.is_admin && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => openEdit(u)}>Edit</Button>
                          <Button size="sm" variant="destructive" onClick={() => setConfirmDelete({ id: u.id, user_type: u.user_type })}>Delete</Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Confirm delete dialog */}
        {confirmDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="bg-background rounded-md p-6 max-w-md w-full">
              <h3 className="text-lg font-medium mb-3">Confirm delete</h3>
              <p className="text-sm text-muted-foreground mb-4">Are you sure you want to permanently delete this user? This action cannot be undone.</p>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setConfirmDelete(null)}>Cancel</Button>
                <Button variant="destructive" onClick={() => deleteUser(confirmDelete.id, confirmDelete.user_type)}>Delete</Button>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit modal */}
        {(showAdd || editingUser) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="bg-background rounded-md p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">{editingUser ? 'Edit User' : 'Add User'}</h3>
                <button onClick={() => { setShowAdd(false); setEditingUser(null); }}><XIcon /></button>
              </div>

              <div className="space-y-3">
                <div>
                  <Label>Name</Label>
                  <Input value={form.name} onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={form.email} onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))} />
                </div>
                {!editingUser && (
                  <>
                    <div>
                      <Label>Password</Label>
                      <Input type="password" value={form.password} onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))} />
                    </div>
                    <div>
                      <Label>Confirm Password</Label>
                      <Input type="password" value={form.confirm_password} onChange={(e) => setForm(prev => ({ ...prev, confirm_password: e.target.value }))} />
                    </div>
                    <div>
                      <Label>User Type</Label>
                      <Select value={form.user_type} onValueChange={(v) => setForm(prev => ({ ...prev, user_type: v as 'user' | 'expert' }))}>
                        <SelectTrigger>
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

                <div className="flex justify-end gap-2">
                  <Button variant="ghost" onClick={() => { setShowAdd(false); setEditingUser(null); }}>Cancel</Button>
                  <Button onClick={() => editingUser ? submitEdit() : submitNewUser()}>{editingUser ? 'Save' : 'Create'}</Button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  )
}
