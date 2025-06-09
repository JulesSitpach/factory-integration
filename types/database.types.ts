/**
 * TypeScript definitions for Supabase Database Schema
 * Generated based on the SQL schema in migrations/00001_initial_schema.sql
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
  factory_app: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          full_name: string | null
          role: Database['factory_app']['Enums']['user_role']
          department: string | null
          employee_id: string | null
          preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          role?: Database['factory_app']['Enums']['user_role']
          department?: string | null
          employee_id?: string | null
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          role?: Database['factory_app']['Enums']['user_role']
          department?: string | null
          employee_id?: string | null
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      cost_calculations: {
        Row: {
          id: string
          user_id: string | null
          materials: number
          labor: number
          overhead: number
          total_cost: number
          name: string | null
          description: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          materials: number
          labor: number
          overhead: number
          total_cost: number
          name?: string | null
          description?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          materials?: number
          labor?: number
          overhead?: number
          total_cost?: number
          name?: string | null
          description?: string | null
          metadata?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cost_calculations_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      integration_configs: {
        Row: {
          id: string
          name: string
          description: string | null
          integration_type: Database['factory_app']['Enums']['integration_type']
          config: Json
          credentials: Json
          status: Database['factory_app']['Enums']['integration_status']
          last_connected_at: string | null
          created_by: string | null
          updated_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          integration_type: Database['factory_app']['Enums']['integration_type']
          config: Json
          credentials?: Json
          status?: Database['factory_app']['Enums']['integration_status']
          last_connected_at?: string | null
          created_by?: string | null
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          integration_type?: Database['factory_app']['Enums']['integration_type']
          config?: Json
          credentials?: Json
          status?: Database['factory_app']['Enums']['integration_status']
          last_connected_at?: string | null
          created_by?: string | null
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_configs_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_configs_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      data_mappings: {
        Row: {
          id: string
          integration_id: string
          name: string
          description: string | null
          source_path: string
          target_path: string
          transformation_logic: Json
          is_active: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          integration_id: string
          name: string
          description?: string | null
          source_path: string
          target_path: string
          transformation_logic?: Json
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          integration_id?: string
          name?: string
          description?: string | null
          source_path?: string
          target_path?: string
          transformation_logic?: Json
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_mappings_integration_id_fkey"
            columns: ["integration_id"]
            referencedRelation: "integration_configs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_mappings_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      integration_jobs: {
        Row: {
          id: string
          integration_id: string
          job_type: string
          status: Database['factory_app']['Enums']['job_status']
          payload: Json | null
          result: Json | null
          error_message: string | null
          started_at: string | null
          completed_at: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          integration_id: string
          job_type: string
          status?: Database['factory_app']['Enums']['job_status']
          payload?: Json | null
          result?: Json | null
          error_message?: string | null
          started_at?: string | null
          completed_at?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          integration_id?: string
          job_type?: string
          status?: Database['factory_app']['Enums']['job_status']
          payload?: Json | null
          result?: Json | null
          error_message?: string | null
          started_at?: string | null
          completed_at?: string | null
          created_by?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_jobs_integration_id_fkey"
            columns: ["integration_id"]
            referencedRelation: "integration_configs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_jobs_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      audit_log: {
        Row: {
          id: string
          user_id: string | null
          action: string
          entity_type: string
          entity_id: string | null
          old_values: Json | null
          new_values: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          entity_type: string
          entity_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          entity_type?: string
          entity_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      active_integrations: {
        Row: {
          id: string
          name: string
          description: string | null
          integration_type: Database['factory_app']['Enums']['integration_type']
          status: Database['factory_app']['Enums']['integration_status']
          last_connected_at: string | null
          created_at: string
          updated_at: string
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_total_cost: {
        Args: {
          p_materials: number
          p_labor: number
          p_overhead: number
        }
        Returns: number
      }
      create_audit_log: {
        Args: {
          p_user_id: string
          p_action: string
          p_entity_type: string
          p_entity_id: string
          p_old_values?: Json
          p_new_values?: Json
        }
        Returns: string
      }
      set_updated_at: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
    }
    Enums: {
      user_role: 'admin' | 'engineer' | 'operator' | 'viewer'
      integration_type: 'erp' | 'mes' | 'scada' | 'iot' | 'database' | 'api' | 'file' | 'custom'
      integration_status: 'active' | 'inactive' | 'error' | 'configuring'
      job_status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
    }
  }
}

// Helper types for Supabase functions
export type DbResult<T> = T extends PromiseLike<infer U> ? U : never
export type DbResultOk<T> = T extends PromiseLike<{ data: infer U }> ? Exclude<U, null> : never
export type DbResultErr = Error

// Enum helper types
export type UserRole = Database['factory_app']['Enums']['user_role']
export type IntegrationType = Database['factory_app']['Enums']['integration_type']
export type IntegrationStatus = Database['factory_app']['Enums']['integration_status']
export type JobStatus = Database['factory_app']['Enums']['job_status']

// Table row types
export type UserProfile = Database['factory_app']['Tables']['user_profiles']['Row']
export type CostCalculation = Database['factory_app']['Tables']['cost_calculations']['Row']
export type IntegrationConfig = Database['factory_app']['Tables']['integration_configs']['Row']
export type DataMapping = Database['factory_app']['Tables']['data_mappings']['Row']
export type IntegrationJob = Database['factory_app']['Tables']['integration_jobs']['Row']
export type AuditLog = Database['factory_app']['Tables']['audit_log']['Row']

// View row types
export type ActiveIntegration = Database['factory_app']['Views']['active_integrations']['Row']
