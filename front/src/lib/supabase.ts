"use client";

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_CONFIG, API_CONFIG } from "@/config";

let supabaseClient: SupabaseClient | undefined;

if (SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
  supabaseClient = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
}

export const supabase = supabaseClient!;

export const api = {
  baseUrl: API_CONFIG.baseUrl,

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const { data: { session } } = await supabase.auth.getSession();

    const headers = new Headers(options.headers || {});
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    if (session?.access_token) {
      headers.set("Authorization", `Bearer ${session.access_token}`);
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  },

  get(endpoint: string) {
    return this.request(endpoint);
  },

  post(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  put(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete(endpoint: string) {
    return this.request(endpoint, {
      method: "DELETE",
    });
  },
};
