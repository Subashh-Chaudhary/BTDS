import { create } from 'zustand';
import { httpClient } from '@/lib/http-client';
import { AuthResponse, AuthStore, LoginData, RegisterData } from '@/lib/types/auth.types';

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('token') : false,
  // `initialized` flips to true once we've checked localStorage and optionally
  // verified the token via /auth/me. Components should wait for this to avoid
  // rendering a transient authenticated UI when the token is invalid.
  initialized: false,

  initializeAuth: async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      try {
        const response = await httpClient.get<{ user: AuthResponse['user'] }>('/auth/me');

        // Ensure the response contains a user; if not, treat as invalid token.
        if (!response || response.status < 200 || response.status >= 300 || !response.data?.user) {
          console.warn('initializeAuth: /auth/me returned unexpected response', { status: response?.status, data: response?.data });
          // Clear invalid token and mark unauthenticated
          localStorage.removeItem('token');
          set({ user: null, token: null, isAuthenticated: false, initialized: true });
          return;
        }

        set({
          user: response.data.user,
          token,
          isAuthenticated: true,
          initialized: true,
        });
      } catch (error) {
        localStorage.removeItem('token');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          initialized: true,
        });
      }
    } else {
      // No token present, mark initialization complete so UI can show login/register
      set({ initialized: true });
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

      // Some backends nest the actual payload under `data.data` (see API logs).
      // Prefer the nested payload if present, otherwise fall back to top-level.
      const payload = response.data?.data ?? response.data;

      // Check if the payload has a token with a different key name
      let token: any =
        payload?.access_token ||
        payload?.token ||
        payload?.accessToken ||
        response.data?.access_token ||
        response.data?.token ||
        response.data?.accessToken;

      // Normalize token to a string. If the token is an object with a nested
      // string (e.g. { token: '...' }) prefer that. Otherwise fail early so we
      // don't persist an invalid value like "[object Object]" which breaks
      // subsequent auth checks and causes the UI to briefly show a logged-in
      // state for an invalid token.
      let tokenString: string | null = null;
      if (typeof token === 'string' && token.trim() !== '') {
        tokenString = token;
      } else if (typeof token === 'object' && token !== null) {
        tokenString = (token.token || token.accessToken) ?? null;
      } else if (typeof token === 'number') {
        tokenString = String(token);
      }

      if (!tokenString) {
        console.error('Login: received invalid token value from server', { token });
        throw new Error('Invalid token received from server');
      }

      // Try to find the user object in the nested payload or top-level
      const userData = payload?.user || payload?.userData || payload || response.data;

      if (!token) {
        console.error('Response structure (no token):', response.data);
        throw new Error('Invalid response from server - no token received');
      }

      if (!userData) {
        console.error('User data not found in response:', response.data);
        throw new Error('Invalid response from server - no user data received');
      }

      // Create a normalized user object (map common backend keys to a stable shape)
      const normalizedUser = {
        id: userData.id || userData._id || userData.userId,
        name: userData.name || userData.username || userData.displayName,
        email: userData.email,
        role: userData.role || userData.user_type || 'farmer',
        phone: userData.phone || userData.phone_number || null,
        address: userData.address || null,
        // Prefer explicit `avatar_url` then common alternatives
        avatar: userData.avatar || userData.profilePicture || userData.avatar_url || userData.profile_picture || null,
        avatar_url: userData.avatar_url || userData.avatar || userData.profilePicture || null,
        age: typeof userData.age === 'number' ? userData.age : (userData.age ? Number(userData.age) : null),
        gender: userData.gender || null,
        is_admin: userData.is_admin || userData.isAdmin || false,
        is_verified: userData.is_verified || userData.isVerified || false,
        is_active: typeof userData.is_active === 'boolean' ? userData.is_active : (userData.isActive ?? true),
        created_at: userData.created_at || userData.createdAt || null,
        updated_at: userData.updated_at || userData.updatedAt || null,
      };

      console.log('Normalized user data:', normalizedUser);

      if (!normalizedUser.id || !normalizedUser.email) {
        console.error('Invalid user data structure:', userData);
        throw new Error('Invalid user data structure received from server');
      }

      // Save token to localStorage (string only)
      localStorage.setItem('token', tokenString);
      
      // Update store with normalized string token
      set({
        user: normalizedUser,
        token: tokenString,
        isAuthenticated: true,
      });
      
      // Verify the store was updated
      const currentState = useAuthStore.getState();
      console.log('Auth store state after update:', { 
        hasUser: !!currentState.user,
        isAuthenticated: currentState.isAuthenticated,
        hasToken: !!currentState.token,
        tokenSample: currentState.token ? currentState.token.slice?.(0, 10) : null,
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
  const { user: regUser } = response.data;
  const regUserAny: any = regUser;
  // Try multiple common locations for the token
  const respDataAny: any = response.data as any;
  let access_token: any = respDataAny?.access_token ?? respDataAny?.token ?? respDataAny?.accessToken ?? null;

      // Normalize token to string (same rules as login)
      let tokenString: string | null = null;
      if (typeof access_token === 'string' && access_token.trim() !== '') {
        tokenString = access_token;
      } else if (typeof access_token === 'object' && access_token !== null) {
        tokenString = (access_token.token || access_token.accessToken) ?? null;
      } else if (typeof access_token === 'number') {
        tokenString = String(access_token);
      }

      if (!tokenString) {
        console.warn('Register: no token found in response; user created but not authenticated automatically', { response: response.data });
        // If there's no token, just set user but don't mark authenticated
        set({ user: regUser, token: null, isAuthenticated: false });
        return;
      }

      // Normalize registered user similarly to login
      const normalizedRegUser = {
        id: regUserAny?.id || regUserAny?._id || regUserAny?.userId,
        name: regUserAny?.name || regUserAny?.username || regUserAny?.displayName,
        email: regUserAny?.email,
        role: regUserAny?.role || regUserAny?.user_type || 'farmer',
        phone: regUserAny?.phone || regUserAny?.phone_number || null,
        address: regUserAny?.address || null,
        avatar: regUserAny?.avatar || regUserAny?.profilePicture || regUserAny?.avatar_url || null,
        avatar_url: regUserAny?.avatar_url || regUserAny?.avatar || regUserAny?.profilePicture || null,
        age: typeof regUserAny?.age === 'number' ? regUserAny.age : (regUserAny?.age ? Number(regUserAny.age) : null),
        gender: regUserAny?.gender || null,
        is_admin: regUserAny?.is_admin || regUserAny?.isAdmin || false,
        is_verified: regUserAny?.is_verified || regUserAny?.isVerified || false,
        is_active: typeof regUserAny?.is_active === 'boolean' ? regUserAny.is_active : (regUserAny?.isActive ?? true),
        created_at: regUserAny?.created_at || regUserAny?.createdAt || null,
        updated_at: regUserAny?.updated_at || regUserAny?.updatedAt || null,
      }

      // Save token and update store
      localStorage.setItem('token', tokenString);
      set({ user: normalizedRegUser, token: tokenString, isAuthenticated: true });
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