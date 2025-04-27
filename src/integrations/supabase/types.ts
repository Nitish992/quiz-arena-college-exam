export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_credentials: {
        Row: {
          created_at: string | null
          email: string
          id: string
          password: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          password: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          password?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      education: {
        Row: {
          created_at: string | null
          current: boolean | null
          degree: string
          end_date: string | null
          id: string
          institution: string
          order_index: number
          percentage: number | null
          start_date: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current?: boolean | null
          degree: string
          end_date?: string | null
          id?: string
          institution: string
          order_index?: number
          percentage?: number | null
          start_date: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current?: boolean | null
          degree?: string
          end_date?: string | null
          id?: string
          institution?: string
          order_index?: number
          percentage?: number | null
          start_date?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      experiences: {
        Row: {
          company: string
          created_at: string | null
          current: boolean | null
          description: string[]
          end_date: string | null
          id: string
          order_index: number
          start_date: string
          title: string
          updated_at: string | null
        }
        Insert: {
          company: string
          created_at?: string | null
          current?: boolean | null
          description: string[]
          end_date?: string | null
          id?: string
          order_index?: number
          start_date: string
          title: string
          updated_at?: string | null
        }
        Update: {
          company?: string
          created_at?: string | null
          current?: boolean | null
          description?: string[]
          end_date?: string | null
          id?: string
          order_index?: number
          start_date?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profile: {
        Row: {
          bio: string
          created_at: string | null
          email: string
          full_name: string
          github_url: string | null
          id: string
          linkedin_url: string | null
          location: string
          phone: string
          tagline: string
          updated_at: string | null
        }
        Insert: {
          bio: string
          created_at?: string | null
          email: string
          full_name: string
          github_url?: string | null
          id?: string
          linkedin_url?: string | null
          location: string
          phone: string
          tagline: string
          updated_at?: string | null
        }
        Update: {
          bio?: string
          created_at?: string | null
          email?: string
          full_name?: string
          github_url?: string | null
          id?: string
          linkedin_url?: string | null
          location?: string
          phone?: string
          tagline?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          batch: string | null
          created_at: string
          id: string
          name: string
          role: string
          roll_number: string | null
          semester: string | null
          updated_at: string
        }
        Insert: {
          batch?: string | null
          created_at?: string
          id: string
          name: string
          role: string
          roll_number?: string | null
          semester?: string | null
          updated_at?: string
        }
        Update: {
          batch?: string | null
          created_at?: string
          id?: string
          name?: string
          role?: string
          roll_number?: string | null
          semester?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string | null
          description: string
          github_url: string | null
          id: string
          image_url: string
          live_url: string | null
          order_index: number
          technologies: string[]
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          github_url?: string | null
          id?: string
          image_url: string
          live_url?: string | null
          order_index?: number
          technologies: string[]
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          github_url?: string | null
          id?: string
          image_url?: string
          live_url?: string | null
          order_index?: number
          technologies?: string[]
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      questions: {
        Row: {
          correct_answer: string
          created_at: string
          id: string
          options: Json
          question: string
          semester: string
          subject_id: string
          updated_at: string
        }
        Insert: {
          correct_answer: string
          created_at?: string
          id?: string
          options: Json
          question: string
          semester: string
          subject_id: string
          updated_at?: string
        }
        Update: {
          correct_answer?: string
          created_at?: string
          id?: string
          options?: Json
          question?: string
          semester?: string
          subject_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          created_at: string
          id: string
          question_id: string
          quiz_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          question_id: string
          quiz_id: string
        }
        Update: {
          created_at?: string
          id?: string
          question_id?: string
          quiz_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_responses: {
        Row: {
          answers: Json
          id: string
          quiz_id: string
          score: number | null
          submitted_at: string
          user_id: string
        }
        Insert: {
          answers: Json
          id?: string
          quiz_id: string
          score?: number | null
          submitted_at?: string
          user_id: string
        }
        Update: {
          answers?: Json
          id?: string
          quiz_id?: string
          score?: number | null
          submitted_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_responses_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          created_at: string
          end_time: string
          id: string
          instructions: string | null
          name: string
          results_published: boolean
          semester: string
          start_time: string
          subject_id: string
          time_limit: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_time: string
          id?: string
          instructions?: string | null
          name: string
          results_published?: boolean
          semester: string
          start_time: string
          subject_id: string
          time_limit: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_time?: string
          id?: string
          instructions?: string | null
          name?: string
          results_published?: boolean
          semester?: string
          start_time?: string
          subject_id?: string
          time_limit?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          category: string
          created_at: string | null
          id: string
          name: string
          order_index: number
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          name: string
          order_index?: number
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          name?: string
          order_index?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      subjects: {
        Row: {
          created_at: string
          id: string
          name: string
          semester: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          semester: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          semester?: string
          updated_at?: string
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
