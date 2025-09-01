"use client";

import { supabase, api } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

// Auth operations
export const authOperations = {
  // Sign in with email and password
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return data.user;
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    }
  },

  // Sign up with email and password
  async signUp(email: string, password: string, displayName?: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
        },
      });

      if (error) throw error;

      // User profile will be automatically created by Supabase
      // Additional user data can be stored in a profiles table
      if (data.user && displayName) {
        await this.updateProfile(data.user, { displayName });
      }

      return data.user;
    } catch (error) {
      console.error("Sign up error:", error);
      throw error;
    }
  },

  // Sign in with Google
  async signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Google sign in error:", error);
      throw error;
    }
  },

  // Sign in anonymously (if supported by your setup)
  async signInAnonymously() {
    try {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      return data.user;
    } catch (error) {
      console.error("Anonymous sign in error:", error);
      throw error;
    }
  },

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  },

  // Send password reset email
  async sendPasswordResetEmail(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
    } catch (error) {
      console.error("Password reset error:", error);
      throw error;
    }
  },

  // Update user profile
  async updateProfile(user: User, profile: { displayName?: string; photoURL?: string }) {
    try {
      // Update auth metadata
      const updates: any = {};
      if (profile.displayName) updates.display_name = profile.displayName;
      if (profile.photoURL) updates.avatar_url = profile.photoURL;

      const { error } = await supabase.auth.updateUser({
        data: updates,
      });

      if (error) throw error;

      // Update profiles table if you have one
      // await api.put(`/profile`, profile);
    } catch (error) {
      console.error("Profile update error:", error);
      throw error;
    }
  },

  // Resend email confirmation
  async resendEmailConfirmation(email: string) {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      if (error) throw error;
    } catch (error) {
      console.error("Email verification error:", error);
      throw error;
    }
  },

  // Get current session
  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    } catch (error) {
      console.error("Get session error:", error);
      throw error;
    }
  },

  // Get current user
  async getUser() {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return data.user;
    } catch (error) {
      console.error("Get user error:", error);
      throw error;
    }
  },
};