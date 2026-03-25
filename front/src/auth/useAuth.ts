"use client";

import { useContext, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { AuthContext } from "./authContext";
import { AuthUser } from "./types";
import { Agency, BrokerProfile, PlatformUser } from "@/lib/deal-types";

type SessionUser = {
  id: string;
  email?: string;
  email_confirmed_at?: string | null;
  is_anonymous?: boolean;
  user_metadata?: Record<string, any>;
};

type HydratedProfilePayload = {
  platformUser: PlatformUser | null;
  brokerProfile: BrokerProfile | null;
  agency: Agency | null;
};

const sleep = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

async function fetchHydratedProfile(accessToken: string): Promise<HydratedProfilePayload | null> {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await fetch("/api/public/overview?scope=auth-me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (response.ok) {
      return (await response.json()) as HydratedProfilePayload;
    }

    if ((response.status === 401 || response.status === 403) && attempt < 3) {
      await sleep(150);
      continue;
    }

    return null;
  }

  return null;
}

async function hydrateUser(user: SessionUser, accessToken?: string | null): Promise<AuthUser> {
  const metadata = user.user_metadata || {};

  const baseUser: AuthUser = {
    uid: user.id,
    email: user.email || null,
    displayName: metadata.display_name || metadata.full_name || null,
    photoURL: metadata.avatar_url || null,
    emailVerified: user.email_confirmed_at !== null,
    isAnonymous: user.is_anonymous || false,
    role: null,
    status: null,
    firstName: null,
    lastName: null,
    platformUser: null,
    brokerProfile: null,
    agency: null,
  };

  if (!accessToken) {
    return baseUser;
  }

  const payload = await fetchHydratedProfile(accessToken);
  const platformUser = payload?.platformUser ?? null;

  if (!platformUser) {
    return baseUser;
  }

  return {
    ...baseUser,
    displayName:
      baseUser.displayName ||
      [platformUser.first_name, platformUser.last_name].filter(Boolean).join(" ") ||
      baseUser.email,
    role: platformUser.role,
    status: platformUser.status,
    firstName: platformUser.first_name,
    lastName: platformUser.last_name,
    platformUser,
    brokerProfile: payload?.brokerProfile ?? null,
    agency: payload?.agency ?? null,
  };
}

export function useAuthInit(
  setUser: (user: AuthUser | null) => void,
  setLoading: (loading: boolean) => void,
  setError: (error: Error | null) => void
) {
  useEffect(() => {
    const syncSessionUser = async (sessionUser: SessionUser | null, accessToken?: string | null) => {
      try {
        if (sessionUser) {
          setUser(await hydrateUser(sessionUser, accessToken));
        } else {
          setUser(null);
        }
        setError(null);
      } catch (error) {
        setError(error as Error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          setError(error);
          setLoading(false);
          return;
        }

        await syncSessionUser(session?.user ?? null, session?.access_token ?? null);
      } catch (error) {
        setError(error as Error);
        setLoading(false);
      }
    };

    getInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoading(true);
      window.setTimeout(() => {
        void syncSessionUser(session?.user ?? null, session?.access_token ?? null);
      }, 0);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setLoading, setError]);
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
