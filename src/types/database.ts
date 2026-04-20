export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      applications: {
        Row: {
          id: string
          user_id: string
          company: string
          role: string
          location: string | null
          job_link: string | null
          date_added: string
          date_applied: string | null
          source_id: string | null
          status_id: string
          priority_id: string | null
          fit_score: number | null
          cv_version: string | null
          cover_letter_required: boolean
          salary_range: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          company: string
          role: string
          location?: string | null
          job_link?: string | null
          date_added: string
          date_applied?: string | null
          source_id?: string | null
          status_id: string
          priority_id?: string | null
          fit_score?: number | null
          cv_version?: string | null
          cover_letter_required?: boolean
          salary_range?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company?: string
          role?: string
          location?: string | null
          job_link?: string | null
          date_added?: string
          date_applied?: string | null
          source_id?: string | null
          status_id?: string
          priority_id?: string | null
          fit_score?: number | null
          cv_version?: string | null
          cover_letter_required?: boolean
          salary_range?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      contacts: {
        Row: {
          id: string
          user_id: string
          application_id: string
          name: string
          role: string | null
          email: string | null
          phone: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          application_id: string
          name: string
          role?: string | null
          email?: string | null
          phone?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          application_id?: string
          name?: string
          role?: string | null
          email?: string | null
          phone?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      actions: {
        Row: {
          id: string
          user_id: string
          application_id: string
          action_type_id: string
          title: string
          due_date: string | null
          completed: boolean
          completed_at: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          application_id: string
          action_type_id: string
          title: string
          due_date?: string | null
          completed?: boolean
          completed_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          application_id?: string
          action_type_id?: string
          title?: string
          due_date?: string | null
          completed?: boolean
          completed_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      interviews: {
        Row: {
          id: string
          user_id: string
          application_id: string
          stage: string
          interview_at: string
          format: string | null
          interviewer_name: string | null
          outcome: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          application_id: string
          stage: string
          interview_at: string
          format?: string | null
          interviewer_name?: string | null
          outcome?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          application_id?: string
          stage?: string
          interview_at?: string
          format?: string | null
          interviewer_name?: string | null
          outcome?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      application_notes: {
        Row: {
          id: string
          user_id: string
          application_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          application_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          application_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      activity_log: {
        Row: {
          id: string
          user_id: string
          application_id: string
          event_type: string
          description: string
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          application_id: string
          event_type: string
          description: string
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          application_id?: string
          event_type?: string
          description?: string
          metadata?: Json | null
          created_at?: string
        }
      }
      statuses: {
        Row: { id: string; name: string; sort_order: number }
        Insert: { id?: string; name: string; sort_order: number }
        Update: { id?: string; name?: string; sort_order?: number }
      }
      priorities: {
        Row: { id: string; name: string; sort_order: number }
        Insert: { id?: string; name: string; sort_order: number }
        Update: { id?: string; name?: string; sort_order?: number }
      }
      sources: {
        Row: { id: string; name: string; sort_order: number }
        Insert: { id?: string; name: string; sort_order: number }
        Update: { id?: string; name?: string; sort_order?: number }
      }
      action_types: {
        Row: { id: string; name: string; sort_order: number }
        Insert: { id?: string; name: string; sort_order: number }
        Update: { id?: string; name?: string; sort_order?: number }
      }
      status_history: {
        Row: {
          id: string
          user_id: string
          application_id: string
          from_status_id: string | null
          to_status_id: string
          changed_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          application_id: string
          from_status_id?: string | null
          to_status_id: string
          changed_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          application_id?: string
          from_status_id?: string | null
          to_status_id?: string
          changed_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          application_id: string | null
          action_id: string | null
          type: 'ACTION_DUE_SOON' | 'ACTION_OVERDUE' | 'FOLLOW_UP_REMINDER' | 'INACTIVITY_REMINDER'
          title: string
          message: string
          is_read: boolean
          priority: number
          due_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          application_id?: string | null
          action_id?: string | null
          type: 'ACTION_DUE_SOON' | 'ACTION_OVERDUE' | 'FOLLOW_UP_REMINDER' | 'INACTIVITY_REMINDER'
          title: string
          message: string
          is_read?: boolean
          priority?: number
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          application_id?: string | null
          action_id?: string | null
          type?: 'ACTION_DUE_SOON' | 'ACTION_OVERDUE' | 'FOLLOW_UP_REMINDER' | 'INACTIVITY_REMINDER'
          title?: string
          message?: string
          is_read?: boolean
          priority?: number
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
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
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

export type Application = Tables<'applications'>
export type Action = Tables<'actions'>
export type Interview = Tables<'interviews'>
export type ApplicationNote = Tables<'application_notes'>
export type ActivityLog = Tables<'activity_log'>
export type Status = Tables<'statuses'>
export type Priority = Tables<'priorities'>
export type Source = Tables<'sources'>
export type ActionType = Tables<'action_types'>
export type Profile = Tables<'profiles'>
export type Contact = Tables<'contacts'>
export type StatusHistory = Tables<'status_history'>
export type Notification = Tables<'notifications'>
export type NotificationType = Notification['type']

export interface ApplicationWithRelations extends Application {
  status?: Status
  priority?: Priority
  source?: Source
}
