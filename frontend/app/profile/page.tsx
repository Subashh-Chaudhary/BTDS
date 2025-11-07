 'use client';

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/lib/store/auth.store";
import { useState, useEffect } from "react";

export default function ProfilePage() {
  const { user, isAuthenticated, token } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
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
      <Card className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Profile</h1>
          <Button onClick={handleEdit}>
            {isEditing ? 'Save Changes' : 'Edit Profile'}
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          <Avatar className="w-20 h-20">
            <img 
              src={user.avatar || '/placeholder-avatar.png'} 
              alt={user.name}
              className="w-full h-full object-cover"
            />
          </Avatar>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-semibold">{user.name}</h2>
              {user.is_admin && (
                <Badge variant="default" className="bg-blue-500">
                  Admin
                </Badge>
              )}
            </div>
            <Badge 
              variant={user.is_verified ? "default" : "secondary"}
              className={user.is_verified ? "bg-green-500" : "bg-gray-500"}
            >
              {user.is_verified ? "Verified" : "Unverified"}
            </Badge>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              value={isEditing ? profileData.name : user.name}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={isEditing ? profileData.email : user.email}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={isEditing ? profileData.phone : user.phone}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              value={isEditing ? profileData.address : user.address}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}