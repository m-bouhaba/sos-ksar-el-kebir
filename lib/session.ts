'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { logoutAction } from '@/actions/auth/logout';
import type { SessionResult } from '@/lib/auth/session';

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

function sessionResultToUser(session: SessionResult): User {
  const id = Number(session.user.id);
  return {
    id: Number.isNaN(id) ? 0 : id,
    email: session.user.email,
    name: session.user.email.split('@')[0] || 'User',
    role: session.user.role as 'citizen' | 'volunteer' | 'admin',
  };
}

export function SessionProvider({
  children,
  initialSession = null,
}: {
  children: ReactNode;
  /** Pass server session from getServerSession() so dashboard and useSession() see the logged-in user (Better Auth cookie session). */
  initialSession?: SessionResult | null;
}) {
  const [user, setUser] = useState<User | null>(() =>
    initialSession ? sessionResultToUser(initialSession) : null
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialSession) {
      setUser(sessionResultToUser(initialSession));
      return;
    }
    const savedUser = localStorage.getItem('sos-user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Erreur lors du chargement de la session:', error);
        localStorage.removeItem('sos-user');
      }
    }
  }, [initialSession]);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { loginWithCredentialsAction } = await import('@/actions/auth/loginWithCredentials');
      const result = await loginWithCredentialsAction(email, password);
      if (result.success) {
        setUser({
          id: 0,
          email,
          name: email.split('@')[0],
          role: 'citizen',
        });
        window.location.href = '/';
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
    logoutAction();
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
