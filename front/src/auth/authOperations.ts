"use client";

import { supabase } from "@/lib/supabase";
import { getDefaultRouteForUser } from "@/lib/route-access";
import type { User } from "@supabase/supabase-js";

type HydratedRoutePayload = {
  platformUser?: {
    role?: "broker" | "admin" | null;
    status?: "pending" | "approved" | "suspended" | "deactivated" | null;
  } | null;
};

const sleep = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

async function fetchResolvedRoute(accessToken: string, userId: string) {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await fetch("/api/public/overview?scope=auth-me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (response.ok) {
      const payload = (await response.json()) as HydratedRoutePayload;

      return getDefaultRouteForUser({
        uid: userId,
        email: null,
        displayName: null,
        photoURL: null,
        emailVerified: true,
        isAnonymous: false,
        role: payload.platformUser?.role ?? null,
        status: payload.platformUser?.status ?? null,
        firstName: null,
        lastName: null,
        platformUser: null,
        brokerProfile: null,
        agency: null,
      });
    }

    if ((response.status === 401 || response.status === 403) && attempt < 3) {
      await sleep(150);
      continue;
    }

    break;
  }

  return "/signin";
}

export const authOperations = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (!data.user || !data.session?.access_token) {
      throw new Error("Signed in but no user session was returned.");
    }
    return data;
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

  async resolvePostSignInRoute(accessToken: string, userId: string) {
    return fetchResolvedRoute(accessToken, userId);
  },
};
