import { create } from 'zustand';
import { httpClient } from '@/lib/http-client';
import { AuthResponse, AuthStore, LoginData, RegisterData } from '@/lib/types/auth.types';

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('token') : false,

  initializeAuth: async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      try {
        const response = await httpClient.get<{ user: AuthResponse['user'] }>('/auth/me');
        set({
          user: response.data.user,
          token,
          isAuthenticated: true,
        });
      } catch (error) {
        localStorage.removeItem('token');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      }
    }
  },

  login: async (data: LoginData) => {
    try {
      // Clear any existing auth data
      localStorage.removeItem('token');
      set({ user: null, token: null, isAuthenticated: false });

      console.log('Attempting login with:', { email: data.email });
      const response = await httpClient.post('/auth/login', data);
      
      // Log the full response for debugging
      console.log('Raw server response:', response.data);

      // Check if the response has a token with a different key name
      const token = response.data.access_token || response.data.token || response.data.accessToken;
      const userData = response.data.user || response.data.userData || response.data;

      if (!token) {
        console.error('Response structure:', response.data);
        throw new Error('Invalid response from server - no token received');
      }

      if (!userData) {
        console.error('User data not found in response:', response.data);
        throw new Error('Invalid response from server - no user data received');
      }

      // Create a normalized user object
      const normalizedUser = {
        id: userData.id || userData._id || userData.userId,
        name: userData.name || userData.username || userData.displayName,
        email: userData.email,
        role: userData.role || userData.user_type || 'farmer',
        phone: userData.phone,
        address: userData.address,
        avatar: userData.avatar || userData.profilePicture,
        is_admin: userData.is_admin || userData.isAdmin || false,
        is_verified: userData.is_verified || userData.isVerified || false
      };

      console.log('Normalized user data:', normalizedUser);

      if (!normalizedUser.id || !normalizedUser.email) {
        console.error('Invalid user data structure:', userData);
        throw new Error('Invalid user data structure received from server');
      }

      // Save token to localStorage
      localStorage.setItem('token', token);
      
      // Update store
      set({
        user: normalizedUser,
        token: token,
        isAuthenticated: true,
      });
      
      // Verify the store was updated
      const currentState = useAuthStore.getState();
      console.log('Auth store state after update:', { 
        hasUser: !!currentState.user,
        isAuthenticated: currentState.isAuthenticated,
        hasToken: !!currentState.token,
        userData: currentState.user
      });

    } catch (error: any) {
      console.error('Login error in store:', {
        error,
        response: error.response?.data,
        status: error.response?.status,
        message: error.message,
        fullError: error
      });
      throw error;
    }
  },

  register: async (data: RegisterData) => {
    try {
      const response = await httpClient.post<AuthResponse>('/auth/register', data);
      const { user, access_token } = response.data;
      
      // Save token to localStorage
      localStorage.setItem('token', access_token);
      
      // Update store
      set({
        user,
        token: access_token,
        isAuthenticated: true,
      });
    } catch (error) {
      throw error;
    }
  },

  logout: () => {
    // Clear localStorage
    localStorage.removeItem('token');
    
    // Reset store
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },
}));