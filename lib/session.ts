'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'citizen' | 'volunteer' | 'admin';
}

export interface SessionContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('sos-user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Erreur lors du chargement de la session:', error);
        localStorage.removeItem('sos-user');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (email && password.length >= 4) {
        const mockUser: User = {
          id: Math.floor(Math.random() * 1000),
          email,
          name: email.split('@')[0],
          role: 'citizen'
        };
        
        setUser(mockUser);
        localStorage.setItem('sos-user', JSON.stringify(mockUser));
        setIsLoading(false);
        return true;
      }
      
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sos-user');
  };

  const contextValue: SessionContextType = {
    user,
    login,
    logout,
    isLoading
  };

  return React.createElement(
    SessionContext.Provider,
    { value: contextValue },
    children
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession doit être utilisé dans un SessionProvider');
  }
  return context;
}
