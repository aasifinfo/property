import type { User } from "@supabase/supabase-js";

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  isAnonymous: boolean;
}

// Supabase auth user type
export type SupabaseAuthUser = User;

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: Error | null;
}