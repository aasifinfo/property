"use client";

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_CONFIG, API_CONFIG } from "@/config";

// Initialize Supabase client
let supabaseClient: SupabaseClient | undefined;

if (SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
  supabaseClient = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
}

// Export the Supabase client
export const supabase = supabaseClient!;

// API client for backend communication
export const api = {
  baseUrl: API_CONFIG.baseUrl,
  
  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Get auth token if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };
    
    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`;
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