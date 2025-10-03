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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      ai_playground_progress: {
        Row: {
          achievements: Json
          created_at: string
          id: string
          reflections: Json
          streak_count: number
          total_points: number
          updated_at: string
          user_id: string
          user_progress: Json
        }
        Insert: {
          achievements?: Json
          created_at?: string
          id?: string
          reflections?: Json
          streak_count?: number
          total_points?: number
          updated_at?: string
          user_id: string
          user_progress?: Json
        }
        Update: {
          achievements?: Json
          created_at?: string
          id?: string
          reflections?: Json
          streak_count?: number
          total_points?: number
          updated_at?: string
          user_id?: string
          user_progress?: Json
        }
        Relationships: []
      }
      bot_performance_metrics: {
        Row: {
          bot_id: string
          id: string
          metadata: Json | null
          metric_type: string
          metric_value: number
          recorded_at: string
          session_id: string | null
          user_id: string
        }
        Insert: {
          bot_id: string
          id?: string
          metadata?: Json | null
          metric_type: string
          metric_value: number
          recorded_at?: string
          session_id?: string | null
          user_id: string
        }
        Update: {
          bot_id?: string
          id?: string
          metadata?: Json | null
          metric_type?: string
          metric_value?: number
          recorded_at?: string
          session_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      conversation_messages: {
        Row: {
          confidence_score: number | null
          content: string
          conversation_id: string
          created_at: string
          id: string
          intent_matched: string | null
          language_detected: string | null
          message_type: string
          metadata: Json | null
          processing_time_ms: number | null
          user_id: string
          voice_enabled: boolean | null
        }
        Insert: {
          confidence_score?: number | null
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          intent_matched?: string | null
          language_detected?: string | null
          message_type: string
          metadata?: Json | null
          processing_time_ms?: number | null
          user_id: string
          voice_enabled?: boolean | null
        }
        Update: {
          confidence_score?: number | null
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          intent_matched?: string | null
          language_detected?: string | null
          message_type?: string
          metadata?: Json | null
          processing_time_ms?: number | null
          user_id?: string
          voice_enabled?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          average_confidence: number | null
          created_at: string
          id: string
          language_code: string | null
          metadata: Json | null
          session_id: string
          status: string | null
          title: string | null
          total_messages: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          average_confidence?: number | null
          created_at?: string
          id?: string
          language_code?: string | null
          metadata?: Json | null
          session_id: string
          status?: string | null
          title?: string | null
          total_messages?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          average_confidence?: number | null
          created_at?: string
          id?: string
          language_code?: string | null
          metadata?: Json | null
          session_id?: string
          status?: string | null
          title?: string | null
          total_messages?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          attempts: number
          bookmarked: boolean
          completed: boolean
          completed_at: string | null
          created_at: string
          current_panel: number
          id: string
          last_visited: string | null
          lesson_id: string
          score: number
          time_spent: number
          updated_at: string
          user_id: string
        }
        Insert: {
          attempts?: number
          bookmarked?: boolean
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          current_panel?: number
          id?: string
          last_visited?: string | null
          lesson_id: string
          score?: number
          time_spent?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          attempts?: number
          bookmarked?: boolean
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          current_panel?: number
          id?: string
          last_visited?: string | null
          lesson_id?: string
          score?: number
          time_spent?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          parent_email: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          parent_email?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          parent_email?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rate_limiting: {
        Row: {
          blocked_until: string | null
          created_at: string
          endpoint: string
          id: string
          ip_address: unknown | null
          request_count: number | null
          user_id: string | null
          window_start: string
        }
        Insert: {
          blocked_until?: string | null
          created_at?: string
          endpoint: string
          id?: string
          ip_address?: unknown | null
          request_count?: number | null
          user_id?: string | null
          window_start?: string
        }
        Update: {
          blocked_until?: string | null
          created_at?: string
          endpoint?: string
          id?: string
          ip_address?: unknown | null
          request_count?: number | null
          user_id?: string | null
          window_start?: string
        }
        Relationships: []
      }
      saved_projects: {
        Row: {
          created_at: string
          id: string
          project_data: Json
          project_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          project_data?: Json
          project_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          project_data?: Json
          project_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      treasure_code_batches: {
        Row: {
          batch_name: string
          created_at: string
          description: string | null
          expire_at: string
          id: string
          is_active: boolean
          issued_by: string | null
          total_codes: number
          updated_at: string
        }
        Insert: {
          batch_name: string
          created_at?: string
          description?: string | null
          expire_at: string
          id?: string
          is_active?: boolean
          issued_by?: string | null
          total_codes?: number
          updated_at?: string
        }
        Update: {
          batch_name?: string
          created_at?: string
          description?: string | null
          expire_at?: string
          id?: string
          is_active?: boolean
          issued_by?: string | null
          total_codes?: number
          updated_at?: string
        }
        Relationships: []
      }
      treasure_codes: {
        Row: {
          batch_id: string
          code: string
          created_at: string
          expire_at: string
          id: string
          is_active: boolean
          max_usage: number
          updated_at: string
          usage_count: number
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          batch_id: string
          code: string
          created_at?: string
          expire_at: string
          id?: string
          is_active?: boolean
          max_usage?: number
          updated_at?: string
          usage_count?: number
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          batch_id?: string
          code?: string
          created_at?: string
          expire_at?: string
          id?: string
          is_active?: boolean
          max_usage?: number
          updated_at?: string
          usage_count?: number
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "treasure_codes_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "treasure_code_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      user_analytics: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          page_url: string | null
          processed: boolean | null
          session_id: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          page_url?: string | null
          processed?: boolean | null
          session_id?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          page_url?: string | null
          processed?: boolean | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      voice_training_progress: {
        Row: {
          accuracy_score: number | null
          achievements: Json | null
          completed_phrases: number | null
          created_at: string
          exercise_id: string
          id: string
          language_code: string
          total_phrases: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          accuracy_score?: number | null
          achievements?: Json | null
          completed_phrases?: number | null
          created_at?: string
          exercise_id: string
          id?: string
          language_code?: string
          total_phrases?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          accuracy_score?: number | null
          achievements?: Json | null
          completed_phrases?: number | null
          created_at?: string
          exercise_id?: string
          id?: string
          language_code?: string
          total_phrases?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
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
  public: {
    Enums: {},
  },
} as const
