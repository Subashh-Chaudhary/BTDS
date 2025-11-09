  "use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/lib/store/auth.store";
import { useState, useEffect } from "react";
import { useToast } from '@/hooks/use-toast'
import { httpClient } from '@/lib/http-client'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const { user, isAuthenticated, token, initializeAuth } = useAuthStore();
  const safeUser: any = user;
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const router = useRouter()
  const [profileData, setProfileData] = useState({
    name: safeUser?.name || '',
    email: safeUser?.email || '',
    phone: safeUser?.phone || '',
    address: safeUser?.address || '',
    age: (safeUser?.age as number) || null,
    gender: safeUser?.gender || '',
    avatar_url: (safeUser?.avatar as string) || safeUser?.avatar_url || '',
    is_active: safeUser?.is_active ?? true,
    is_verified: safeUser?.is_verified ?? false,
  });

  // Keep local profileData in sync with store user updates (e.g. after login or save)
  useEffect(() => {
    setProfileData(prev => ({
      name: safeUser?.name ?? prev.name,
      email: safeUser?.email ?? prev.email,
      phone: safeUser?.phone ?? prev.phone,
      address: safeUser?.address ?? prev.address,
      age: (safeUser?.age as number) ?? prev.age,
      gender: safeUser?.gender ?? prev.gender,
      avatar_url: (safeUser?.avatar as string) || safeUser?.avatar_url || prev.avatar_url,
      is_active: safeUser?.is_active ?? prev.is_active,
      is_verified: safeUser?.is_verified ?? prev.is_verified,
    }))
  }, [safeUser?.id, safeUser?.name, safeUser?.email, safeUser?.phone, safeUser?.address, safeUser?.age, safeUser?.gender, safeUser?.avatar, safeUser?.avatar_url, safeUser?.is_active, safeUser?.is_verified])

  const handleEdit = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      // TODO: Implement save functionality
      // Call API to update user profile
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value === '' ? null : Number(value)
    }));
  };

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewAvatar(url);
    setSelectedFile(file);
    // in a real app we'd upload the file and set avatar_url to returned url
    setProfileData(prev => ({ ...prev, avatar_url: url }));
  };

  const uploadAvatar = async (file: File) => {
    try {
      const form = new FormData()
      form.append('id', safeUser?.id)
      form.append('file', file)

      const res = await httpClient.post('/profile/avatar', form, {
        // let axios/browser set multipart boundary
        headers: { 'Content-Type': undefined as unknown as string },
      })

      const body = res?.data
      const payload = body?.data ?? body

      // try multiple common keys for returned avatar URL
      const avatarUrl = payload?.avatar_url || payload?.url || payload?.data?.avatar_url || payload?.avatar
      if (avatarUrl) {
        setProfileData(prev => ({ ...prev, avatar_url: avatarUrl }))
        // refresh auth store from server so fields are consistent
        try {
          await initializeAuth?.()
        } catch (e) {
          // fallback: set avatar locally if refresh fails
          useAuthStore.setState((s: any) => ({ user: { ...(s.user || {}), avatar: avatarUrl, avatar_url: avatarUrl } }))
        }
        toast({ title: 'Avatar uploaded', description: 'Profile avatar updated', duration: 3000 })
        return avatarUrl
      }

      throw new Error('No avatar url returned')
    } catch (err: any) {
      console.error('Avatar upload failed', err)
      toast({ title: 'Upload failed', description: err?.message || 'Could not upload avatar', duration: 4000 })
      throw err
    }
  }

  const saveProfile = async () => {
    try {
      // If user selected an avatar file, upload first
      if (selectedFile) {
        await uploadAvatar(selectedFile)
        // revoke local preview object URL
        try { previewAvatar && URL.revokeObjectURL(previewAvatar) } catch(e) {}
        setSelectedFile(null)
      }

      const payload: any = {
        id: safeUser?.id,
        name: profileData.name,
        address: profileData.address,
        is_active: profileData.is_active,
        age: profileData.age,
        gender: profileData.gender,
      }

  const res = await httpClient.put('/profile', payload)
      const body = res?.data
      const data = body?.data ?? body

      // Update local store user from response if available, otherwise merge fields
      const current = useAuthStore.getState().user || {}
      // Refresh the auth store from server to pick up DB changes
      try {
        await initializeAuth?.()
      } catch (e) {
        // If refresh fails, still merge local changes into store so UI updates
        const merged = { ...(current as any), name: payload.name, address: payload.address, is_active: payload.is_active, age: payload.age, gender: payload.gender }
        useAuthStore.setState({ user: merged as any })
      }

      toast({ title: 'Profile saved', description: 'Your profile changes were saved', duration: 3000 })
      setIsEditing(false)
    } catch (err) {
      console.error('Save profile failed', err)
      toast({ title: 'Save failed', description: 'Unable to save profile. Try again.', duration: 4000 })
    }
  }

  console.log('Rendering ProfilePage', { isAuthenticated, user, profileData });
  useEffect(() => {
    const init = async () => {
      try {
        // Log auth state for debugging
        console.log('Auth State:', {
          isAuthenticated,
          hasToken: !!token,
          hasUser: !!user
        });
        
        setIsLoading(false);
      } catch (error) {
        console.error('Profile initialization error:', error);
        setIsLoading(false);
      }
    };
    
    init();
  }, [isAuthenticated, token, user]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <Card className="p-6">
          <p>Loading profile...</p>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-4">
        <Card className="p-6">
          <p>Please login to view your profile</p>
          <div className="mt-2 text-sm text-gray-500">
            Debug info: 
            <br />
            Authenticated: {isAuthenticated ? 'Yes' : 'No'}
            <br />
            Has token: {token ? 'Yes' : 'No'}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-4xl mx-auto p-6">
        <div className="flex items-start justify-between gap-6">
          {/* Left: profile summary */}
          <div className="w-1/3 bg-white/60 rounded-lg p-6 shadow-sm">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <Avatar className="w-28 h-28">
                  {previewAvatar ? (
                    <AvatarImage src={previewAvatar} alt={safeUser?.name || profileData.name} />
                  ) : (profileData.avatar_url || safeUser?.avatar || safeUser?.avatar_url) ? (
                    <AvatarImage src={profileData.avatar_url || safeUser?.avatar || safeUser?.avatar_url || '/placeholder-avatar.png'} alt={safeUser?.name || profileData.name} />
                  ) : (
                    <AvatarFallback>{(safeUser?.name || profileData.name)?.[0] ?? '?'}</AvatarFallback>
                  )}
                </Avatar>
                {isEditing && (
                  <label className="absolute -bottom-2 right-0 bg-white rounded-full p-1 shadow-md cursor-pointer text-sm">
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarFile} />
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-4.553A2 2 0 0018.553 4L14 8.553M3 21l6-6" /></svg>
                  </label>
                )}
              </div>

              <div>
                <h2 className="text-2xl font-semibold">{safeUser?.name}</h2>
                <p className="text-sm text-muted-foreground">{safeUser?.email}</p>
              </div>

              <div className="flex items-center gap-2">
                {safeUser?.is_admin && <Badge className="bg-blue-500">Admin</Badge>}
                <Badge className={safeUser?.is_verified ? 'bg-emerald-500' : 'bg-gray-400'}>
                  {safeUser?.is_verified ? 'Verified' : 'Unverified'}
                </Badge>
              </div>

              <div className="w-full mt-2 text-left space-y-2">
                <h3 className="text-sm font-medium text-slate-700">Contact</h3>
                <p className="text-sm text-slate-500">{safeUser?.phone || profileData.phone || 'No phone provided.'}</p>
                <h3 className="text-sm font-medium text-slate-700">Address</h3>
                <p className="text-sm text-slate-500">{safeUser?.address || profileData.address || 'No address provided.'}</p>
              </div>

              <div className="w-full grid grid-cols-2 gap-2 mt-2">
                <div className="text-left">
                  <div className="text-xs text-muted-foreground">Age</div>
                  <div className="font-medium">{(safeUser?.age ?? profileData.age) ?? '—'}</div>
                </div>
                <div className="text-left">
                  <div className="text-xs text-muted-foreground">Gender</div>
                  <div className="font-medium capitalize">{safeUser?.gender || profileData.gender || '—'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: editable details */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold">Profile</h1>
              <div className="flex items-center gap-2">
                <Button variant={isEditing ? 'ghost' : 'default'} onClick={() => setIsEditing(prev => !prev)}>
                  {isEditing ? 'Cancel' : 'Edit'}
                </Button>
                {isEditing ? (
                  <Button onClick={() => { console.log('Save', profileData); setIsEditing(false); }}>
                    Save Changes
                  </Button>
                ) : (
                  <Button onClick={async () => {
                    const email = safeUser?.email ?? ''
                    try {
                      if (navigator.clipboard && navigator.clipboard.writeText) {
                        await navigator.clipboard.writeText(email)
                      } else {
                        // fallback for older browsers
                        const el = document.createElement('textarea')
                        el.value = email
                        document.body.appendChild(el)
                        el.select()
                        document.execCommand('copy')
                        document.body.removeChild(el)
                      }
                      toast({ title: 'Copied', description: 'Email copied to clipboard', duration: 2000 })
                    } catch (err) {
                      console.error('Copy failed', err)
                      toast({ title: 'Copy failed', description: 'Could not copy email to clipboard', duration: 3000 })
                    }
                  }}>
                    Copy Email
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" value={isEditing ? profileData.name : (safeUser?.name ?? profileData.name)} onChange={handleChange} disabled={!isEditing} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={isEditing ? profileData.email : (safeUser?.email ?? profileData.email)} onChange={handleChange} disabled={!isEditing} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" type="tel" value={isEditing ? (profileData.phone ?? '') : (safeUser?.phone ?? profileData.phone ?? '')} onChange={handleChange} disabled={!isEditing} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input id="age" name="age" type="number" value={isEditing ? (profileData.age ?? '') as any : ((safeUser?.age ?? profileData.age) ?? '') as any} onChange={handleNumberChange} disabled={!isEditing} />
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" value={isEditing ? (profileData.address ?? '') : (safeUser?.address ?? profileData.address ?? '')} onChange={handleChange} disabled={!isEditing} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Input id="gender" name="gender" value={isEditing ? (profileData.gender ?? '') : (safeUser?.gender ?? profileData.gender ?? '')} onChange={handleChange} disabled={!isEditing} />
              </div>

              <div className="space-y-2">
                <Label>Account Status</Label>
                <div className="flex items-center gap-2"> 
                  <Badge className={safeUser?.is_verified ? 'bg-emerald-500' : 'bg-gray-400'}>{safeUser?.is_verified ? 'Verified' : 'Unverified'}</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}