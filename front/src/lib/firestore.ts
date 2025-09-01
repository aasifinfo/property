"use client";

import { supabase } from "./supabase";

// Example user profile type (matches Supabase profiles table)
export interface UserProfile {
  id: string;
  display_name?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

// Database operations using Supabase
export const databaseOperations = {
  // Profile operations
  profiles: {
    // Get profile by user ID
    async getById(userId: string): Promise<UserProfile | null> {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();
        
        if (error) {
          console.error("Error fetching profile:", error);
          return null;
        }
        
        return data;
      } catch (error) {
        console.error("Error fetching profile:", error);
        return null;
      }
    },

    // Create or update profile
    async upsert(userId: string, data: Partial<UserProfile>): Promise<UserProfile | null> {
      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .upsert({
            id: userId,
            ...data,
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();
        
        if (error) {
          console.error("Error upserting profile:", error);
          return null;
        }
        
        return profile;
      } catch (error) {
        console.error("Error upserting profile:", error);
        return null;
      }
    },

    // Update profile
    async update(userId: string, data: Partial<UserProfile>): Promise<UserProfile | null> {
      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId)
          .select()
          .single();
        
        if (error) {
          console.error("Error updating profile:", error);
          return null;
        }
        
        return profile;
      } catch (error) {
        console.error("Error updating profile:", error);
        return null;
      }
    },

    // Delete profile
    async delete(userId: string): Promise<boolean> {
      try {
        const { error } = await supabase
          .from("profiles")
          .delete()
          .eq("id", userId);
        
        if (error) {
          console.error("Error deleting profile:", error);
          return false;
        }
        
        return true;
      } catch (error) {
        console.error("Error deleting profile:", error);
        return false;
      }
    },

    // Get profiles with filtering
    async getByQuery(
      filters: { column: string; operator: string; value: any }[]
    ): Promise<UserProfile[]> {
      try {
        let query = supabase.from("profiles").select("*");
        
        filters.forEach((filter) => {
          query = query.filter(filter.column, filter.operator, filter.value);
        });
        
        const { data, error } = await query;
        
        if (error) {
          console.error("Error querying profiles:", error);
          return [];
        }
        
        return data || [];
      } catch (error) {
        console.error("Error querying profiles:", error);
        return [];
      }
    },
  },

  // Generic table operations
  async getRecords(table: string, filters?: { column: string; value: any }[]) {
    try {
      let query = supabase.from(table).select("*");
      
      if (filters) {
        filters.forEach((filter) => {
          query = query.eq(filter.column, filter.value);
        });
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error(`Error fetching ${table}:`, error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error(`Error fetching ${table}:`, error);
      return [];
    }
  },

  async createRecord(table: string, data: any) {
    try {
      const { data: record, error } = await supabase
        .from(table)
        .insert(data)
        .select()
        .single();
      
      if (error) {
        console.error(`Error creating ${table} record:`, error);
        return null;
      }
      
      return record;
    } catch (error) {
      console.error(`Error creating ${table} record:`, error);
      return null;
    }
  },

  async updateRecord(table: string, id: string, data: any) {
    try {
      const { data: record, error } = await supabase
        .from(table)
        .update(data)
        .eq("id", id)
        .select()
        .single();
      
      if (error) {
        console.error(`Error updating ${table} record:`, error);
        return null;
      }
      
      return record;
    } catch (error) {
      console.error(`Error updating ${table} record:`, error);
      return null;
    }
  },

  async deleteRecord(table: string, id: string) {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq("id", id);
      
      if (error) {
        console.error(`Error deleting ${table} record:`, error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error(`Error deleting ${table} record:`, error);
      return false;
    }
  },
};

// Backward compatibility - map old userOperations to new structure
export const userOperations = {
  getById: (uid: string) => databaseOperations.profiles.getById(uid),
  create: (uid: string, data: any) => databaseOperations.profiles.upsert(uid, data),
  update: (uid: string, data: any) => databaseOperations.profiles.update(uid, data),
  delete: (uid: string) => databaseOperations.profiles.delete(uid),
  getByQuery: (field: string, operator: string, value: any) => 
    databaseOperations.profiles.getByQuery([{ column: field, operator, value }]),
};