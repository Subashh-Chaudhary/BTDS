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

export default function ProfilePage() {
  const { user, isAuthenticated, token } = useAuthStore();
  const safeUser: any = user;
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
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
    // in a real app we'd upload the file and set avatar_url to returned url
    setProfileData(prev => ({ ...prev, avatar_url: url }));
  };

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
                  {previewAvatar || profileData.avatar_url ? (
                    <AvatarImage src={previewAvatar || profileData.avatar_url || '/placeholder-avatar.png'} alt={safeUser?.name} />
                  ) : (
                    <AvatarFallback>{safeUser?.name?.[0] ?? '?'}</AvatarFallback>
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

              <div className="w-full mt-2 text-left">
                <h3 className="text-sm font-medium text-slate-700">Address</h3>
                <p className="text-sm text-slate-500 mt-1">{safeUser?.address || 'No address provided.'}</p>
              </div>

              <div className="w-full grid grid-cols-2 gap-2 mt-2">
                <div className="text-left">
                  <div className="text-xs text-muted-foreground">Age</div>
                  <div className="font-medium">{safeUser?.age ?? '—'}</div>
                </div>
                <div className="text-left">
                  <div className="text-xs text-muted-foreground">Gender</div>
                  <div className="font-medium capitalize">{safeUser?.gender || '—'}</div>
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
                <Input id="name" name="name" value={isEditing ? profileData.name : safeUser?.name} onChange={handleChange} disabled={!isEditing} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={isEditing ? profileData.email : safeUser?.email} onChange={handleChange} disabled={!isEditing} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" type="tel" value={isEditing ? (profileData.phone ?? '') : (safeUser?.phone ?? '')} onChange={handleChange} disabled={!isEditing} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input id="age" name="age" type="number" value={isEditing ? (profileData.age ?? '') as any : (safeUser?.age ?? '') as any} onChange={handleNumberChange} disabled={!isEditing} />
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" value={isEditing ? (profileData.address ?? '') : (safeUser?.address ?? '')} onChange={handleChange} disabled={!isEditing} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Input id="gender" name="gender" value={isEditing ? (profileData.gender ?? '') : (safeUser?.gender ?? '')} onChange={handleChange} disabled={!isEditing} />
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