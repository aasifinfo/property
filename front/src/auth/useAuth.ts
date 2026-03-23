"use client";

import { useEffect, useContext } from "react";
import { supabase } from "@/lib/supabase";
import { AuthContext } from "./authContext";
import { AuthUser } from "./types";
import { Agency, BrokerProfile, PlatformUser } from "@/lib/deal-types";

async function hydrateUser(user: {
  id: string;
  email?: string;
  email_confirmed_at?: string | null;
  is_anonymous?: boolean;
  user_metadata?: Record<string, any>;
}): Promise<AuthUser> {
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

  const { data: platformUser } = await supabase
    .from("users")
    .select("id, email, first_name, last_name, phone, role, status, agency_id, created_at, updated_at")
    .eq("id", user.id)
    .maybeSingle();

  if (!platformUser) {
    return baseUser;
  }

  const typedPlatformUser = platformUser as PlatformUser;

  const { data: brokerProfile } = await supabase
    .from("broker_profiles")
    .select(
      "user_id, agency_id, rera_brn, covered_area_ids, speciality, experience_years, whatsapp_number, bio, application_status, application_submitted_at, approved_at"
    )
    .eq("user_id", user.id)
    .maybeSingle();

  let agency: Agency | null = null;
  if (typedPlatformUser.agency_id) {
    const { data } = await supabase
      .from("agencies")
      .select("id, name, rera_brn, status")
      .eq("id", typedPlatformUser.agency_id)
      .maybeSingle();
    agency = (data as Agency | null) ?? null;
  }

  return {
    ...baseUser,
    displayName:
      baseUser.displayName ||
      [typedPlatformUser.first_name, typedPlatformUser.last_name].filter(Boolean).join(" ") ||
      baseUser.email,
    role: typedPlatformUser.role,
    status: typedPlatformUser.status,
    firstName: typedPlatformUser.first_name,
    lastName: typedPlatformUser.last_name,
    platformUser: typedPlatformUser,
    brokerProfile: (brokerProfile as BrokerProfile | null) ?? null,
    agency,
  };
}

export function useAuthInit(
  setUser: (user: AuthUser | null) => void,
  setLoading: (loading: boolean) => void,
  setError: (error: Error | null) => void
) {
  useEffect(() => {
    const syncSessionUser = async (
      sessionUser: {
        id: string;
        email?: string;
        email_confirmed_at?: string | null;
        is_anonymous?: boolean;
        user_metadata?: Record<string, any>;
      } | null
    ) => {
      try {
        if (sessionUser) {
          setUser(await hydrateUser(sessionUser));
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

        await syncSessionUser(session?.user ?? null);
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
        void syncSessionUser(session?.user ?? null);
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

