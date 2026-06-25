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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity: string | null
          entity_id: string | null
          id: number
          ip_address: string | null
          user_agent: string | null
          user_id: string | null
          username: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity?: string | null
          entity_id?: string | null
          id?: number
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
          username?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity?: string | null
          entity_id?: string | null
          id?: number
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
          username?: string | null
        }
        Relationships: []
      }
      details: {
        Row: {
          created_at: string | null
          document_id: number
          fraude_id: number
          id: number
          nationalite_id: number
          num_document_faux: string
          type_fraude_id: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          document_id: number
          fraude_id: number
          id?: never
          nationalite_id: number
          num_document_faux: string
          type_fraude_id: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          document_id?: number
          fraude_id?: number
          id?: never
          nationalite_id?: number
          num_document_faux?: string
          type_fraude_id?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "details_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "details_fraude_id_fkey"
            columns: ["fraude_id"]
            isOneToOne: false
            referencedRelation: "fraudes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "details_nationalite_id_fkey"
            columns: ["nationalite_id"]
            isOneToOne: false
            referencedRelation: "nationalites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "details_type_fraude_id_fkey"
            columns: ["type_fraude_id"]
            isOneToOne: false
            referencedRelation: "type_fraudes"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          id: number
          label: string
        }
        Insert: {
          id?: never
          label: string
        }
        Update: {
          id?: never
          label?: string
        }
        Relationships: []
      }
      fraudes: {
        Row: {
          created_at: string | null
          date_fraude: string | null
          date_naiss_fraudeur: string | null
          desc_fraude: string | null
          genre_fraudeur: string
          id: number
          lieu_fraude: string
          nationalite_id: number
          nom_fraudeur: string
          prenom_fraudeur: string
          provenance_destination: string
          societe_id: number
          updated_at: string | null
          user_id: string
          vol_id: number
          zone: string
        }
        Insert: {
          created_at?: string | null
          date_fraude?: string | null
          date_naiss_fraudeur?: string | null
          desc_fraude?: string | null
          genre_fraudeur?: string
          id?: never
          lieu_fraude: string
          nationalite_id: number
          nom_fraudeur: string
          prenom_fraudeur: string
          provenance_destination: string
          societe_id: number
          updated_at?: string | null
          user_id: string
          vol_id: number
          zone?: string
        }
        Update: {
          created_at?: string | null
          date_fraude?: string | null
          date_naiss_fraudeur?: string | null
          desc_fraude?: string | null
          genre_fraudeur?: string
          id?: never
          lieu_fraude?: string
          nationalite_id?: number
          nom_fraudeur?: string
          prenom_fraudeur?: string
          provenance_destination?: string
          societe_id?: number
          updated_at?: string | null
          user_id?: string
          vol_id?: number
          zone?: string
        }
        Relationships: [
          {
            foreignKeyName: "fraudes_nationalite_id_fkey"
            columns: ["nationalite_id"]
            isOneToOne: false
            referencedRelation: "nationalites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fraudes_societe_id_fkey"
            columns: ["societe_id"]
            isOneToOne: false
            referencedRelation: "societes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fraudes_vol_id_fkey"
            columns: ["vol_id"]
            isOneToOne: false
            referencedRelation: "vols"
            referencedColumns: ["id"]
          },
        ]
      }
      login_attempts: {
        Row: {
          failed_count: number
          last_attempt_at: string
          locked_until: string | null
          updated_at: string
          username: string
        }
        Insert: {
          failed_count?: number
          last_attempt_at?: string
          locked_until?: string | null
          updated_at?: string
          username: string
        }
        Update: {
          failed_count?: number
          last_attempt_at?: string
          locked_until?: string | null
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      nationalites: {
        Row: {
          id: number
          label: string
        }
        Insert: {
          id?: never
          label: string
        }
        Update: {
          id?: never
          label?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string
          role: string
          updated_at: string | null
          username: string
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id: string
          role?: string
          updated_at?: string | null
          username: string
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      roles: {
        Row: {
          created_at: string | null
          desc_role: string
          id: number
          nom_role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          desc_role: string
          id?: never
          nom_role: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          desc_role?: string
          id?: never
          nom_role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      service_parents: {
        Row: {
          adresse_service_parent: string | null
          contact_chef_service_parent: string
          contact_service_parent: string | null
          created_at: string | null
          desc_service_parent: string
          fonction_chef_service_parent: string
          grade_chef_service_parent: string
          id: number
          nom_chef_service_parent: string
          nom_service_parent: string
          sigle_service_parent: string
          statut_chef_service_parent: string
          updated_at: string | null
        }
        Insert: {
          adresse_service_parent?: string | null
          contact_chef_service_parent: string
          contact_service_parent?: string | null
          created_at?: string | null
          desc_service_parent: string
          fonction_chef_service_parent: string
          grade_chef_service_parent: string
          id?: never
          nom_chef_service_parent: string
          nom_service_parent: string
          sigle_service_parent: string
          statut_chef_service_parent: string
          updated_at?: string | null
        }
        Update: {
          adresse_service_parent?: string | null
          contact_chef_service_parent?: string
          contact_service_parent?: string | null
          created_at?: string | null
          desc_service_parent?: string
          fonction_chef_service_parent?: string
          grade_chef_service_parent?: string
          id?: never
          nom_chef_service_parent?: string
          nom_service_parent?: string
          sigle_service_parent?: string
          statut_chef_service_parent?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          adresse_service: string | null
          contact_chef_service: string
          contact_service: string | null
          created_at: string | null
          desc_service: string
          fonction_chef_service: string
          grade_chef_service: string
          id: number
          nom_chef_service: string
          nom_service: string
          service_parent_id: number
          sigle_service: string
          statut_chef_service: string
          updated_at: string | null
        }
        Insert: {
          adresse_service?: string | null
          contact_chef_service: string
          contact_service?: string | null
          created_at?: string | null
          desc_service: string
          fonction_chef_service: string
          grade_chef_service: string
          id?: never
          nom_chef_service: string
          nom_service: string
          service_parent_id: number
          sigle_service: string
          statut_chef_service: string
          updated_at?: string | null
        }
        Update: {
          adresse_service?: string | null
          contact_chef_service?: string
          contact_service?: string | null
          created_at?: string | null
          desc_service?: string
          fonction_chef_service?: string
          grade_chef_service?: string
          id?: never
          nom_chef_service?: string
          nom_service?: string
          service_parent_id?: number
          sigle_service?: string
          statut_chef_service?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_service_parent_id_fkey"
            columns: ["service_parent_id"]
            isOneToOne: false
            referencedRelation: "service_parents"
            referencedColumns: ["id"]
          },
        ]
      }
      societes: {
        Row: {
          id: number
          label: string
        }
        Insert: {
          id?: never
          label: string
        }
        Update: {
          id?: never
          label?: string
        }
        Relationships: []
      }
      type_fraudes: {
        Row: {
          id: number
          label: string
        }
        Insert: {
          id?: never
          label: string
        }
        Update: {
          id?: never
          label?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          active: boolean
          auth_user_id: string | null
          avatar_url: string | null
          contact: string | null
          created_at: string
          email: string
          force_password_change: boolean
          id: number
          nom: string
          password_last_changed: string
          prenom: string
          role_id: number | null
          service_id: number | null
          updated_at: string
          username: string
        }
        Insert: {
          active?: boolean
          auth_user_id?: string | null
          avatar_url?: string | null
          contact?: string | null
          created_at?: string
          email: string
          force_password_change?: boolean
          id?: number
          nom: string
          password_last_changed?: string
          prenom: string
          role_id?: number | null
          service_id?: number | null
          updated_at?: string
          username: string
        }
        Update: {
          active?: boolean
          auth_user_id?: string | null
          avatar_url?: string | null
          contact?: string | null
          created_at?: string
          email?: string
          force_password_change?: boolean
          id?: number
          nom?: string
          password_last_changed?: string
          prenom?: string
          role_id?: number | null
          service_id?: number | null
          updated_at?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      vols: {
        Row: {
          destination: string
          id: number
          numero: string
        }
        Insert: {
          destination: string
          id?: never
          numero: string
        }
        Update: {
          destination?: string
          id?: never
          numero?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
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
