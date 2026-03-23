"use client";

import { api } from "./supabase";

// Example API request/response types
export interface ExampleRequest {
  message: string;
}

export interface ExampleResponse {
  result: string;
}

// API functions wrapper for FastAPI backend calls
export const apiFunctions = {
  // Example API function
  exampleFunction: async (data: ExampleRequest): Promise<ExampleResponse> => {
    return await api.post("/api/example", data);
  },

  // User management functions
  users: {
    getProfile: async (userId: string) => {
      return await api.get(`/api/users/${userId}`);
    },
    
    updateProfile: async (userId: string, data: any) => {
      return await api.put(`/api/users/${userId}`, data);
    },
    
    deleteProfile: async (userId: string) => {
      return await api.delete(`/api/users/${userId}`);
    },
  },

  // Items management (example resource)
  items: {
    list: async () => {
      return await api.get("/api/items");
    },
    
    create: async (data: any) => {
      return await api.post("/api/items", data);
    },
    
    get: async (itemId: string) => {
      return await api.get(`/api/items/${itemId}`);
    },
    
    update: async (itemId: string, data: any) => {
      return await api.put(`/api/items/${itemId}`, data);
    },
    
    delete: async (itemId: string) => {
      return await api.delete(`/api/items/${itemId}`);
    },
  },

  // Health check
  healthCheck: async () => {
    return await api.get("/health");
  },
};

// Generic API function helper
export async function callAPI<TRequest, TResponse>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "POST",
  data?: TRequest
): Promise<TResponse> {
  switch (method) {
    case "GET":
      return await api.get(endpoint);
    case "POST":
      return await api.post(endpoint, data);
    case "PUT":
      return await api.put(endpoint, data);
    case "DELETE":
      return await api.delete(endpoint);
    default:
      throw new Error(`Unsupported method: ${method}`);
  }
}

// Backward compatibility helper for legacy function names
export async function callFunction<TRequest, TResponse>(
  functionName: string,
  data: TRequest
): Promise<TResponse> {
  // Map legacy function names to API endpoints
  const endpointMap: { [key: string]: string } = {
    exampleFunction: "/api/example",
    getUserProfile: "/api/users/profile",
    createItem: "/api/items",
    // Add more mappings as needed
  };
  
  const endpoint = endpointMap[functionName] || `/api/${functionName}`;
  return await callAPI<TRequest, TResponse>(endpoint, "POST", data);
}

// Export commonly used functions for easy access
export const { users, items, healthCheck } = apiFunctions;
