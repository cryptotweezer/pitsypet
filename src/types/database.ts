export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      active_symptoms: {
        Row: {
          created_at: string
          deleted_at: string | null
          detected_at: string
          name: string
          notes: string | null
          pet_id: string
          resolved_at: string | null
          severity: string | null
          source: string
          status: string
          symptom_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          detected_at?: string
          name: string
          notes?: string | null
          pet_id: string
          resolved_at?: string | null
          severity?: string | null
          source?: string
          status?: string
          symptom_id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          detected_at?: string
          name?: string
          notes?: string | null
          pet_id?: string
          resolved_at?: string | null
          severity?: string | null
          source?: string
          status?: string
          symptom_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "active_symptoms_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["pet_id"]
          },
        ]
      }
      appointments: {
        Row: {
          appointment_id: string
          created_at: string
          deleted_at: string | null
          doctor_name: string | null
          notes: string | null
          outcome: string | null
          pet_id: string
          reason: string | null
          scheduled_at: string
          title: string
          updated_at: string
          user_id: string
          vet_contact_id: string | null
        }
        Insert: {
          appointment_id?: string
          created_at?: string
          deleted_at?: string | null
          doctor_name?: string | null
          notes?: string | null
          outcome?: string | null
          pet_id: string
          reason?: string | null
          scheduled_at: string
          title: string
          updated_at?: string
          user_id: string
          vet_contact_id?: string | null
        }
        Update: {
          appointment_id?: string
          created_at?: string
          deleted_at?: string | null
          doctor_name?: string | null
          notes?: string | null
          outcome?: string | null
          pet_id?: string
          reason?: string | null
          scheduled_at?: string
          title?: string
          updated_at?: string
          user_id?: string
          vet_contact_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["pet_id"]
          },
          {
            foreignKeyName: "appointments_vet_contact_id_fkey"
            columns: ["vet_contact_id"]
            isOneToOne: false
            referencedRelation: "vet_contacts"
            referencedColumns: ["vet_contact_id"]
          },
        ]
      }
      assessments: {
        Row: {
          about_symptoms: string | null
          assessment_id: string
          clinical_reasoning: string | null
          completed_at: string | null
          confidence_score: number | null
          conversation_log: Json
          created_at: string
          deleted_at: string | null
          extracted_symptoms: Json
          fallback_used: boolean
          follow_ups: Json
          model_version: string | null
          pet_id: string
          primary_concern: string | null
          processing_time_ms: number | null
          rag_chunks_used: Json
          recommended_action: string | null
          red_flags: Json
          risk_classification: string | null
          tokens_used: number
          user_id: string
          user_saved: boolean
        }
        Insert: {
          about_symptoms?: string | null
          assessment_id?: string
          clinical_reasoning?: string | null
          completed_at?: string | null
          confidence_score?: number | null
          conversation_log?: Json
          created_at?: string
          deleted_at?: string | null
          extracted_symptoms?: Json
          fallback_used?: boolean
          follow_ups?: Json
          model_version?: string | null
          pet_id: string
          primary_concern?: string | null
          processing_time_ms?: number | null
          rag_chunks_used?: Json
          recommended_action?: string | null
          red_flags?: Json
          risk_classification?: string | null
          tokens_used?: number
          user_id: string
          user_saved?: boolean
        }
        Update: {
          about_symptoms?: string | null
          assessment_id?: string
          clinical_reasoning?: string | null
          completed_at?: string | null
          confidence_score?: number | null
          conversation_log?: Json
          created_at?: string
          deleted_at?: string | null
          extracted_symptoms?: Json
          fallback_used?: boolean
          follow_ups?: Json
          model_version?: string | null
          pet_id?: string
          primary_concern?: string | null
          processing_time_ms?: number | null
          rag_chunks_used?: Json
          recommended_action?: string | null
          red_flags?: Json
          risk_classification?: string | null
          tokens_used?: number
          user_id?: string
          user_saved?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "assessments_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["pet_id"]
          },
        ]
      }
      breeds: {
        Row: {
          id: number
          name: string
          species: string
        }
        Insert: {
          id?: number
          name: string
          species: string
        }
        Update: {
          id?: number
          name?: string
          species?: string
        }
        Relationships: []
      }
      emergency_contacts: {
        Row: {
          address: string | null
          contact_id: string
          created_at: string
          is_24h: boolean
          name: string
          phone: string
          state: string
          website: string | null
        }
        Insert: {
          address?: string | null
          contact_id?: string
          created_at?: string
          is_24h?: boolean
          name: string
          phone: string
          state: string
          website?: string | null
        }
        Update: {
          address?: string | null
          contact_id?: string
          created_at?: string
          is_24h?: boolean
          name?: string
          phone?: string
          state?: string
          website?: string | null
        }
        Relationships: []
      }
      first_aid_recommendations: {
        Row: {
          age_range: string
          created_at: string
          recommendation_id: string
          recommendation_text: string
          risk_level: string
          symptom_name: string
        }
        Insert: {
          age_range?: string
          created_at?: string
          recommendation_id?: string
          recommendation_text: string
          risk_level?: string
          symptom_name: string
        }
        Update: {
          age_range?: string
          created_at?: string
          recommendation_id?: string
          recommendation_text?: string
          risk_level?: string
          symptom_name?: string
        }
        Relationships: []
      }
      knowledge_processing_audit: {
        Row: {
          audit_id: string
          document_type: string | null
          processing_date: string
          source_title: string
          total_chunks: number | null
          validation_status: string
        }
        Insert: {
          audit_id?: string
          document_type?: string | null
          processing_date?: string
          source_title: string
          total_chunks?: number | null
          validation_status?: string
        }
        Update: {
          audit_id?: string
          document_type?: string | null
          processing_date?: string
          source_title?: string
          total_chunks?: number | null
          validation_status?: string
        }
        Relationships: []
      }
      medications: {
        Row: {
          active: boolean
          created_at: string
          deleted_at: string | null
          dosage: string | null
          dosage_unit: string | null
          ended_at: string | null
          frequency: string | null
          medication_id: string
          name: string
          notes: string | null
          pet_id: string
          prescribed_by: string | null
          quantity: string | null
          started_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          deleted_at?: string | null
          dosage?: string | null
          dosage_unit?: string | null
          ended_at?: string | null
          frequency?: string | null
          medication_id?: string
          name: string
          notes?: string | null
          pet_id: string
          prescribed_by?: string | null
          quantity?: string | null
          started_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          deleted_at?: string | null
          dosage?: string | null
          dosage_unit?: string | null
          ended_at?: string | null
          frequency?: string | null
          medication_id?: string
          name?: string
          notes?: string | null
          pet_id?: string
          prescribed_by?: string | null
          quantity?: string | null
          started_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medications_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["pet_id"]
          },
        ]
      }
      pets: {
        Row: {
          age_months: number | null
          age_years: number
          breed: string
          created_at: string
          deleted_at: string | null
          medical_conditions: Json
          pet_id: string
          pet_name: string
          slug: string
          species: string
          updated_at: string
          user_id: string
          weight_kg: number
        }
        Insert: {
          age_months?: number | null
          age_years: number
          breed: string
          created_at?: string
          deleted_at?: string | null
          medical_conditions?: Json
          pet_id?: string
          pet_name: string
          slug: string
          species: string
          updated_at?: string
          user_id: string
          weight_kg: number
        }
        Update: {
          age_months?: number | null
          age_years?: number
          breed?: string
          created_at?: string
          deleted_at?: string | null
          medical_conditions?: Json
          pet_id?: string
          pet_name?: string
          slug?: string
          species?: string
          updated_at?: string
          user_id?: string
          weight_kg?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          name: string | null
          state: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          name?: string | null
          state?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string | null
          state?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      vet_contacts: {
        Row: {
          address: string | null
          clinic_name: string | null
          created_at: string
          deleted_at: string | null
          email: string | null
          notes: string | null
          phone: string | null
          service_hours: Json
          updated_at: string
          user_id: string
          vet_contact_id: string
        }
        Insert: {
          address?: string | null
          clinic_name?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          notes?: string | null
          phone?: string | null
          service_hours?: Json
          updated_at?: string
          user_id: string
          vet_contact_id?: string
        }
        Update: {
          address?: string | null
          clinic_name?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          notes?: string | null
          phone?: string | null
          service_hours?: Json
          updated_at?: string
          user_id?: string
          vet_contact_id?: string
        }
        Relationships: []
      }
      vet_doctors: {
        Row: {
          created_at: string
          deleted_at: string | null
          doctor_id: string
          email: string | null
          name: string
          notes: string | null
          phone: string | null
          specialty: string | null
          updated_at: string
          user_id: string
          vet_contact_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          doctor_id?: string
          email?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          specialty?: string | null
          updated_at?: string
          user_id: string
          vet_contact_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          doctor_id?: string
          email?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          specialty?: string | null
          updated_at?: string
          user_id?: string
          vet_contact_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vet_doctors_vet_contact_id_fkey"
            columns: ["vet_contact_id"]
            isOneToOne: false
            referencedRelation: "vet_contacts"
            referencedColumns: ["vet_contact_id"]
          },
        ]
      }
      veterinary_knowledge: {
        Row: {
          body_system: string | null
          breed_specific: boolean
          chunk_id: string
          created_at: string
          embedding: string | null
          metadata: Json
          source: string
          species: string
          text: string
          urgency_level: number
        }
        Insert: {
          body_system?: string | null
          breed_specific?: boolean
          chunk_id?: string
          created_at?: string
          embedding?: string | null
          metadata?: Json
          source: string
          species: string
          text: string
          urgency_level: number
        }
        Update: {
          body_system?: string | null
          breed_specific?: boolean
          chunk_id?: string
          created_at?: string
          embedding?: string | null
          metadata?: Json
          source?: string
          species?: string
          text?: string
          urgency_level?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      search_assessments: {
        Args: { match_count?: number; query_text: string }
        Returns: {
          assessment_id: string
          created_at: string
          pet_name: string
          primary_concern: string
          relevance: number
          risk_classification: string
        }[]
      }
      search_veterinary_knowledge: {
        Args: {
          match_count?: number
          match_species: string
          query_embedding: string
        }
        Returns: {
          body_system: string
          breed_specific: boolean
          chunk_id: string
          similarity: number
          source: string
          species: string
          text: string
          urgency_level: number
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
