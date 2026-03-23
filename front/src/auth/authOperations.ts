"use client";

import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export const authOperations = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.user;
  },

  async signUp(email: string, password: string, displayName?: string) {
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
    if (data.user && displayName && data.session?.access_token) {
      await this.updateProfile(data.user, { displayName });
    }
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async sendPasswordResetEmail(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  },

  async updateProfile(user: User, profile: { displayName?: string; photoURL?: string }) {
    const updates: any = {};
    if (profile.displayName) updates.display_name = profile.displayName;
    if (profile.photoURL) updates.avatar_url = profile.photoURL;

    const { error } = await supabase.auth.updateUser({
      data: updates,
    });
    if (error) throw error;
  },

  async resendEmailConfirmation(email: string) {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });
    if (error) throw error;
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  async getUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  },
};

