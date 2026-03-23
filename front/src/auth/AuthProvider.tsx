"use client";

import { useState, useCallback, ReactNode } from "react";
import { AuthContext, AuthContextType } from "./authContext";
import { AuthUser } from "./types";
import { useAuthInit } from "./useAuth";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const isAuthenticated = !loading && user !== null;
  const isAnonymous = user?.isAnonymous ?? false;

  const contextValue: AuthContextType = {
    user,
    loading,
    error,
    isAuthenticated,
    isAnonymous,
    setUser: useCallback((nextUser: AuthUser | null) => setUser(nextUser), []),
    setLoading: useCallback((nextLoading: boolean) => setLoading(nextLoading), []),
    setError: useCallback((nextError: Error | null) => setError(nextError), []),
  };

  useAuthInit(contextValue.setUser, contextValue.setLoading, contextValue.setError);

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

