import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

console.log('API URL:', baseURL); // Debug log

export const httpClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add timeout
  timeout: 10000,
  // Add validation
  validateStatus: (status) => {
    // Follow axios default: treat 2xx as success. This ensures 401/403/4xx
    // responses are rejected and hit our response error handler which clears
    // auth state on unauthorized responses.
    return status >= 200 && status < 300;
  },
});

// Request interceptor
httpClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    // If token exists, add it to request headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
httpClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  async (error) => {
    // Log useful bits and the full error object. Some network/CORS errors
    // result in an Error with non-enumerable properties, so serialize
    // with Object.getOwnPropertyNames when possible.
    try {
      const serialized: any = {
        url: error?.config?.url,
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message,
        code: error?.code,
      }
      console.error('API Error:', serialized)
      console.error('API Error (full):', error)
      try {
        const names = Object.getOwnPropertyNames(error)
        const allProps = names.reduce<any>((acc, key) => {
          try {
            acc[key] = (error as any)[key]
          } catch (e) {
            acc[key] = '<unserializable>'
          }
          return acc
        }, {})
        console.error('API Error (props):', allProps)
      } catch (e) {
        // ignore serialization issues
      }
    } catch (logErr) {
      console.error('Failed to log API error', logErr, error)
    }

    // Handle 401 error (unauthorized)
    if (error.response?.status === 401) {
      // Clear localStorage and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.clear();
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);