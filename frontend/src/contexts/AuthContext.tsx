import React, { createContext, useContext, useState, useEffect } from 'react';
import AuthService from '@/services/auth.service';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  username: string;
  name: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  skipAuth: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  // Default to skipAuth = true to allow users to access without login
  const [skipAuth, setSkipAuth] = useState<boolean>(true);

  useEffect(() => {
    // Check if user is already logged in (localStorage)
    const savedUser = localStorage.getItem('dinus-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const { toast } = useToast();

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const userData = await AuthService.login(username, password);
      
      // Extract user data from response
      const user = {
        id: userData.id,
        username: userData.username,
        name: userData.name,
        isAdmin: userData.isAdmin
      };
      
      setUser(user);
      localStorage.setItem('dinus-user', JSON.stringify(user));
      return true;
    } catch (error) {
      toast({
        title: "Login Gagal",
        description: "Username atau password tidak valid",
        variant: "destructive"
      });
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    AuthService.logout();
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user || skipAuth,
      isAdmin: user?.isAdmin || false,
      skipAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};