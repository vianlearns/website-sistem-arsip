import api from '@/lib/api';

interface LoginResponse {
  id: string;
  username: string;
  name: string;
  isAdmin: boolean;
  token: string;
}

const AuthService = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await api.post('/auth/login', { username, password });
      
      // Store token in localStorage
      if (response.data.token) {
        localStorage.setItem('dinus-token', response.data.token);
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('dinus-token');
    localStorage.removeItem('dinus-user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('dinus-user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },
};

export default AuthService;