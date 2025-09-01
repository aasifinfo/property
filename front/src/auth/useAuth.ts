"use client";

import { useEffect, useContext } from "react";
import { supabase } from "@/lib/supabase";
import { AuthContext } from "./authContext";
import { AuthUser } from "./types";

// Hook to initialize auth listener
export function useAuthInit(
  setUser: (user: AuthUser | null) => void,
  setLoading: (loading: boolean) => void,
  setError: (error: Error | null) => void
) {
  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          setError(error);
          setLoading(false);
          return;
        }

        if (session?.user) {
          const authUser: AuthUser = {
            uid: session.user.id,
            email: session.user.email,
            displayName: session.user.user_metadata?.display_name || session.user.user_metadata?.full_name,
            photoURL: session.user.user_metadata?.avatar_url,
            emailVerified: session.user.email_confirmed_at !== null,
            isAnonymous: session.user.is_anonymous || false,
          };
          setUser(authUser);
        } else {
          setUser(null);
        }
        setLoading(false);
      } catch (error) {
        console.error("Auth initialization error:", error);
        setError(error as Error);
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event);
        
        if (session?.user) {
          const authUser: AuthUser = {
            uid: session.user.id,
            email: session.user.email,
            displayName: session.user.user_metadata?.display_name || session.user.user_metadata?.full_name,
            photoURL: session.user.user_metadata?.avatar_url,
            emailVerified: session.user.email_confirmed_at !== null,
            isAnonymous: session.user.is_anonymous || false,
          };
          setUser(authUser);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setLoading, setError]);
}

// Hook to use auth state from context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}