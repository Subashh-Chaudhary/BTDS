"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { httpClient } from "@/lib/http-client";
import { useAuthStore } from "@/lib/store/auth.store";
import {
  X as XIcon,
  Search,
  Users,
  UserCheck,
  Stethoscope,
  FileText,
  TrendingUp,
  Eye,
  Calendar,
  LogOut,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type UserItem = any;
type ScanItem = any;

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [scans, setScans] = useState<ScanItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [scansLoading, setScansLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>(
    {}
  );
  const [confirmDelete, setConfirmDelete] = useState<{
    id: string;
    user_type?: string;
  } | null>(null);
  const [query, setQuery] = useState("");
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm_password: "",
    user_type: "user",
  });
  const currentUser = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

  // Stats calculations
  const stats = useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter((u) => u.is_active).length;
    const experts = users.filter((u) => u.user_type === "expert").length;
    const totalScans = scans.length;
    const recentScans = scans.filter((s) => {
      const uploadedAt = new Date(s.uploaded_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return uploadedAt >= weekAgo;
    }).length;

    return { totalUsers, activeUsers, experts, totalScans, recentScans };
  }, [users, scans]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // Fetch both users and experts and merge them into a single list
      const [usersRes, expertsRes] = await Promise.allSettled([
        httpClient.get("/users"),
        httpClient.get("/experts"),
      ]);

      const extractItems = (res: any) => {
        const r = res?.value ?? res?.reason ?? res;
        const data = r?.data?.data ?? r?.data;
        return data?.items ?? (Array.isArray(r?.data) ? r.data : []);
      };

      const userItems =
        usersRes.status === "fulfilled" ? extractItems(usersRes) : [];
      const expertItems =
        expertsRes.status === "fulfilled" ? extractItems(expertsRes) : [];

      // Normalize and tag items so we know which endpoint to call on actions
      const normalizedUsers = (userItems || []).map((u: any) => ({
        ...(u || {}),
        user_type: u?.user_type ?? "user",
      }));
      const normalizedExperts = (expertItems || []).map((e: any) => ({
        ...(e || {}),
        user_type: "expert",
      }));

      // Merge and deduplicate by id (users + experts may not overlap)
      const merged = [...normalizedUsers, ...normalizedExperts];
      const byId: Record<string, any> = {};
      for (const item of merged) {
        byId[item.id] = { ...byId[item.id], ...item };
      }

      setUsers(Object.values(byId));
    } catch (err: any) {
      console.error("Failed to load users/experts", err);
      toast({
        title: "Load failed",
        description: "Could not fetch users or experts",
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadScans = async () => {
    setScansLoading(true);
    try {
      const res = await httpClient.get("/scans");
      const data = res?.data?.data ?? res?.data;
      if (Array.isArray(data)) {
        setScans(data);
      } else if (Array.isArray(res?.data)) {
        setScans(res.data);
      } else {
        setScans([]);
      }
    } catch (err: any) {
      console.error("Failed to load scans", err);
      toast({
        title: "Load failed",
        description: "Could not fetch scans",
        duration: 4000,
      });
    } finally {
      setScansLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    loadScans();
  }, []);

  const filtered = useMemo(() => {
    if (!query) return users;
    return users.filter(
      (u) =>
        (u.name || "").toLowerCase().includes(query.toLowerCase()) ||
        (u.email || "").toLowerCase().includes(query.toLowerCase())
    );
  }, [users, query]);

  const setAction = (id: string, v: boolean) =>
    setActionLoading((prev) => ({ ...prev, [id]: v }));

  const toggleActive = async (user: UserItem, value: boolean) => {
    try {
      const id = user.id;
      setAction(id, true);
      // Update activation according to DTO/endpoints
      if (user.user_type === "expert") {
        await httpClient.put(`/expert/${id}`, { is_active: value });
      } else {
        await httpClient.put(`/user/${id}`, { is_active: value });
      }
      toast({
        title: value ? "Activated" : "Deactivated",
        description: "User status updated",
        duration: 3000,
      });
      loadUsers();
    } catch (err: any) {
      console.error("Failed to update user", err);
      toast({
        title: "Update failed",
        description: "Could not update user",
        duration: 4000,
      });
    } finally {
      setAction(user.id, false);
    }
  };

  const deleteUser = async (id: string, userType?: string) => {
    try {
      setAction(id, true);
      // Route deletion by user_type per API (experts -> /expert/:id, users -> /user/:id)
      const path = userType === "expert" ? `/expert/${id}` : `/user/${id}`;
      await httpClient.delete(path);
      toast({
        title: "Deleted",
        description: `${
          userType === "expert" ? "Expert" : "User"
        } deleted successfully`,
        duration: 3000,
      });
      loadUsers();
    } catch (err: any) {
      console.error("Failed to delete user", err);
      toast({
        title: "Delete failed",
        description: "Could not delete user",
        duration: 4000,
      });
    } finally {
      setAction(id, false);
      setConfirmDelete(null);
    }
  };

  const openEdit = (u: UserItem) => {
    setEditingUser(u);
    setForm({
      name: u.name ?? "",
      email: u.email ?? "",
      password: "",
      confirm_password: "",
      user_type: u.user_type ?? "user",
    });
  };

  const validateNewUser = () => {
    const errors: string[] = [];
    const name = (form.name || "").trim();
    const email = (form.email || "").trim();
    const password = form.password || "";
    const confirm = form.confirm_password || "";
    const userType = form.user_type;

    if (!name) errors.push("Name is required");
    if (name && name.length < 3)
      errors.push("Name must be at least 3 characters long");
    if (name && name.length > 100)
      errors.push("Name cannot exceed 100 characters");

    const emailRegex = /[^\s@]+@[^\s@]+\.[^\s@]+/;
    if (!email) errors.push("Email is required");
    if (email && !emailRegex.test(email))
      errors.push("Please provide a valid email address");

    if (!password) errors.push("Password is required");
    if (password && password.length < 8)
      errors.push("Password must be at least 8 characters long");

    if (!confirm) errors.push("Confirm password is required");
    if (confirm && password !== confirm)
      errors.push("Confirm password must match password");

    if (!userType) errors.push("User type is required");
    if (userType && !["user", "expert"].includes(userType))
      errors.push("User type must be either user or expert");

    return errors;
  };

  const submitNewUser = async () => {
    // Client-side validations to mirror backend DTO
    const errors = validateNewUser();
    if (errors.length) {
      toast({
        title: "Validation error",
        description: errors.join("\n"),
        duration: 5000,
      });
      return;
    }
    try {
      const res = await httpClient.post("/auth/register", form);
      const msg = res?.data?.message || "User registered successfully";
      toast({ title: "User added", description: msg, duration: 3000 });
      setShowAdd(false);
      setForm({
        name: "",
        email: "",
        password: "",
        confirm_password: "",
        user_type: "user",
      });
      loadUsers();
    } catch (err: any) {
      console.error("Failed to add user", err);
      toast({
        title: "Add failed",
        description: err?.response?.data?.message || "Could not add user",
        duration: 4000,
      });
    }
  };

  const submitEdit = async () => {
    if (!editingUser) return;
    try {
      setAction(editingUser.id, true);
      // Use PUT and payloads aligned with UpdateUserDto / UpdateExpertDto
      if (editingUser.user_type === "expert") {
        await httpClient.put(`/expert/${editingUser.id}`, {
          name: form.name,
          email: form.email,
        });
      } else {
        await httpClient.put(`/user/${editingUser.id}`, {
          name: form.name,
          email: form.email,
        });
      }
      toast({
        title: "Updated",
        description: `${
          editingUser.user_type === "expert" ? "Expert" : "User"
        } updated`,
        duration: 3000,
      });
      setEditingUser(null);
      loadUsers();
    } catch (err: any) {
      console.error("Failed to update user", err);
      toast({
        title: "Update failed",
        description: err?.response?.data?.message || "Could not update user",
        duration: 4000,
      });
    } finally {
      setAction(editingUser.id, false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Admin Navigation Header */}
      <nav className="bg-white/95 backdrop-blur-sm border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">DD</span>
            </div>
            <span className="font-bold text-lg text-slate-800">
              Diabetes Detection System Admin
            </span>
          </div> */}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-100 transition">
                <Avatar>
                  <AvatarFallback>
                    {currentUser?.name?.[0] ?? "A"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">
                  {currentUser?.name ?? "Admin"}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onSelect={() => {
                  logout();
                  router.push("/");
                }}
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
              <p className="text-purple-100 text-sm mt-1">
                Medical professionals
              </p>
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
              <p className="text-orange-100 text-sm mt-1">
                Predictions generated
              </p>
            </CardContent>
          </Card>
        </div>

        {/* User Management Section */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-slate-800">
                  User Management
                </CardTitle>
                <p className="text-slate-600 mt-1">
                  Manage application users and experts
                </p>
              </div>
              <Button
                onClick={() => setShowAdd(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
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
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                        User
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                        Role
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filtered.map((u) => (
                      <tr
                        key={u.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-linear-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                              {u.name?.[0] ?? "U"}
                            </div>
                            <div>
                              <div className="font-medium text-slate-900">
                                {u.name}
                              </div>
                              <div className="text-xs text-slate-500">
                                Joined{" "}
                                {new Date(u.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700">
                          {u.email}
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant={
                              u.user_type === "expert" ? "default" : "secondary"
                            }
                          >
                            {u.is_admin ? "Admin" : u.user_type ?? "user"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant={u.is_active ? "default" : "destructive"}
                          >
                            {u.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant={u.is_active ? "outline" : "default"}
                              onClick={() => toggleActive(u, !u.is_active)}
                              disabled={!!actionLoading[u.id]}
                            >
                              {actionLoading[u.id]
                                ? "..."
                                : u.is_active
                                ? "Deactivate"
                                : "Activate"}
                            </Button>
                            {!u.is_admin && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openEdit(u)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() =>
                                    setConfirmDelete({
                                      id: u.id,
                                      user_type: u.user_type,
                                    })
                                  }
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
                <CardTitle className="text-2xl font-bold text-slate-800">
                  Predictions Report
                </CardTitle>
                <p className="text-slate-600 mt-1">
                  Recent medical scan predictions and analytics
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-900">
                    {stats.recentScans}
                  </div>
                  <div className="text-sm text-slate-500">This week</div>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {scansLoading && (
              <p className="text-center py-8">Loading predictions...</p>
            )}

            {!scansLoading && scans.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500">No predictions available</p>
              </div>
            )}

            {!scansLoading && scans.length > 0 && (
              <div className="space-y-4">
                {scans.slice(0, 10).map((s) => {
                  const scanResult =
                    (s as any).result ?? (s as any).data ?? null;
                  const prediction =
                    scanResult?.model_prediction ??
                    scanResult ??
                    (s as any).model_prediction ??
                    null;
                  const imageSrc =
                    prediction?.output_image_url ??
                    scanResult?.image_url ??
                    (s as any).image_url ??
                    null;

                  return (
                    <div
                      key={s.id}
                      className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
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
                                  {s.uploaded_at
                                    ? new Date(
                                        s.uploaded_at
                                      ).toLocaleDateString()
                                    : "—"}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Eye className="h-3 w-3" />
                                  {prediction?.tumor_type ?? "Pending"}
                                </span>
                              </div>
                            </div>
                            <Badge
                              variant={
                                prediction?.tumor_type === "none"
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              {prediction?.tumor_type ?? "Analyzing"}
                            </Badge>
                          </div>

                          {prediction?.description && (
                            <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                              {prediction.description}
                            </p>
                          )}

                          {prediction?.confidence_score != null && (
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-600">
                                  Confidence
                                </span>
                                <span className="font-medium">
                                  {(prediction.confidence_score * 100).toFixed(
                                    1
                                  )}
                                  %
                                </span>
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-2 mt-1">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{
                                    width: `${
                                      prediction.confidence_score * 100
                                    }%`,
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Confirm delete dialog */}
        {confirmDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl">
              <h3 className="text-lg font-semibold mb-3 text-slate-900">
                Confirm delete
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                Are you sure you want to permanently delete this user? This
                action cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setConfirmDelete(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() =>
                    deleteUser(confirmDelete.id, confirmDelete.user_type)
                  }
                >
                  Delete
                </Button>
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
                  {editingUser ? "Edit User" : "Add User"}
                </h3>
                <button
                  onClick={() => {
                    setShowAdd(false);
                    setEditingUser(null);
                  }}
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
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-slate-700">Email</Label>
                  <Input
                    value={form.email}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, email: e.target.value }))
                    }
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
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            password: e.target.value,
                          }))
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-700">Confirm Password</Label>
                      <Input
                        type="password"
                        value={form.confirm_password}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            confirm_password: e.target.value,
                          }))
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-700">User Type</Label>
                      <Select
                        value={form.user_type}
                        onValueChange={(v) =>
                          setForm((prev) => ({
                            ...prev,
                            user_type: v as "user" | "expert",
                          }))
                        }
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
                    onClick={() => {
                      setShowAdd(false);
                      setEditingUser(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() =>
                      editingUser ? submitEdit() : submitNewUser()
                    }
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {editingUser ? "Save" : "Create"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
