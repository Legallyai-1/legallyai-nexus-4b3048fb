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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      academy_certificates: {
        Row: {
          certificate_number: string
          course_id: string
          expires_at: string | null
          id: string
          issued_at: string
          pdf_url: string | null
          user_id: string
        }
        Insert: {
          certificate_number: string
          course_id: string
          expires_at?: string | null
          id?: string
          issued_at?: string
          pdf_url?: string | null
          user_id: string
        }
        Update: {
          certificate_number?: string
          course_id?: string
          expires_at?: string | null
          id?: string
          issued_at?: string
          pdf_url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "academy_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_courses: {
        Row: {
          category: string
          created_at: string
          description: string | null
          difficulty: string
          duration_hours: number | null
          id: string
          is_bar_prep: boolean | null
          is_premium: boolean | null
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          difficulty?: string
          duration_hours?: number | null
          id?: string
          is_bar_prep?: boolean | null
          is_premium?: boolean | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          difficulty?: string
          duration_hours?: number | null
          id?: string
          is_bar_prep?: boolean | null
          is_premium?: boolean | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      academy_lessons: {
        Row: {
          content: string | null
          course_id: string
          created_at: string
          duration_minutes: number | null
          id: string
          order_index: number
          title: string
          video_url: string | null
        }
        Insert: {
          content?: string | null
          course_id: string
          created_at?: string
          duration_minutes?: number | null
          id?: string
          order_index?: number
          title: string
          video_url?: string | null
        }
        Update: {
          content?: string | null
          course_id?: string
          created_at?: string
          duration_minutes?: number | null
          id?: string
          order_index?: number
          title?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "academy_lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "academy_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_progress: {
        Row: {
          completed_at: string | null
          course_id: string
          created_at: string
          id: string
          last_accessed_at: string | null
          lesson_id: string | null
          progress_percentage: number | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          created_at?: string
          id?: string
          last_accessed_at?: string | null
          lesson_id?: string | null
          progress_percentage?: number | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          created_at?: string
          id?: string
          last_accessed_at?: string | null
          lesson_id?: string | null
          progress_percentage?: number | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "academy_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academy_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "academy_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_quiz_attempts: {
        Row: {
          answers: Json | null
          completed_at: string | null
          created_at: string
          id: string
          max_score: number | null
          passed: boolean | null
          quiz_id: string
          score: number | null
          started_at: string | null
          user_id: string
        }
        Insert: {
          answers?: Json | null
          completed_at?: string | null
          created_at?: string
          id?: string
          max_score?: number | null
          passed?: boolean | null
          quiz_id: string
          score?: number | null
          started_at?: string | null
          user_id: string
        }
        Update: {
          answers?: Json | null
          completed_at?: string | null
          created_at?: string
          id?: string
          max_score?: number | null
          passed?: boolean | null
          quiz_id?: string
          score?: number | null
          started_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "academy_quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_quiz_questions: {
        Row: {
          correct_answer: string
          explanation: string | null
          id: string
          options: Json | null
          order_index: number
          points: number | null
          question: string
          quiz_id: string
        }
        Insert: {
          correct_answer: string
          explanation?: string | null
          id?: string
          options?: Json | null
          order_index?: number
          points?: number | null
          question: string
          quiz_id: string
        }
        Update: {
          correct_answer?: string
          explanation?: string | null
          id?: string
          options?: Json | null
          order_index?: number
          points?: number | null
          question?: string
          quiz_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "academy_quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_quizzes: {
        Row: {
          course_id: string | null
          created_at: string
          id: string
          is_bar_exam: boolean | null
          lesson_id: string | null
          passing_score: number | null
          question_type: string
          time_limit_minutes: number | null
          title: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          id?: string
          is_bar_exam?: boolean | null
          lesson_id?: string | null
          passing_score?: number | null
          question_type?: string
          time_limit_minutes?: number | null
          title: string
        }
        Update: {
          course_id?: string | null
          created_at?: string
          id?: string
          is_bar_exam?: boolean | null
          lesson_id?: string | null
          passing_score?: number | null
          question_type?: string
          time_limit_minutes?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_quizzes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "academy_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academy_quizzes_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "academy_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_chat_history: {
        Row: {
          created_at: string | null
          hub_type: string
          id: string
          is_archived: boolean | null
          messages: Json | null
          metadata: Json | null
          searchable_text: string | null
          session_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          hub_type: string
          id?: string
          is_archived?: boolean | null
          messages?: Json | null
          metadata?: Json | null
          searchable_text?: string | null
          session_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          hub_type?: string
          id?: string
          is_archived?: boolean | null
          messages?: Json | null
          metadata?: Json | null
          searchable_text?: string | null
          session_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      analytics_dashboards: {
        Row: {
          config: Json
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_default: boolean | null
          name: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          config: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "analytics_dashboards_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_dashboards_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_snapshots: {
        Row: {
          created_at: string
          id: string
          metrics: Json
          organization_id: string
          snapshot_date: string
        }
        Insert: {
          created_at?: string
          id?: string
          metrics: Json
          organization_id: string
          snapshot_date: string
        }
        Update: {
          created_at?: string
          id?: string
          metrics?: Json
          organization_id?: string
          snapshot_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "analytics_snapshots_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          case_id: string | null
          client_id: string | null
          created_at: string
          description: string | null
          end_time: string
          fee: number | null
          id: string
          is_free: boolean | null
          is_virtual: boolean | null
          lawyer_id: string | null
          location: string | null
          meeting_link: string | null
          notes: string | null
          organization_id: string
          start_time: string
          status: Database["public"]["Enums"]["appointment_status"]
          title: string
          updated_at: string
        }
        Insert: {
          case_id?: string | null
          client_id?: string | null
          created_at?: string
          description?: string | null
          end_time: string
          fee?: number | null
          id?: string
          is_free?: boolean | null
          is_virtual?: boolean | null
          lawyer_id?: string | null
          location?: string | null
          meeting_link?: string | null
          notes?: string | null
          organization_id: string
          start_time: string
          status?: Database["public"]["Enums"]["appointment_status"]
          title: string
          updated_at?: string
        }
        Update: {
          case_id?: string | null
          client_id?: string | null
          created_at?: string
          description?: string | null
          end_time?: string
          fee?: number | null
          id?: string
          is_free?: boolean | null
          is_virtual?: boolean | null
          lawyer_id?: string | null
          location?: string | null
          meeting_link?: string | null
          notes?: string | null
          organization_id?: string
          start_time?: string
          status?: Database["public"]["Enums"]["appointment_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_lawyer_id_fkey"
            columns: ["lawyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_entries: {
        Row: {
          activity_code: string | null
          amount: number
          billable: boolean | null
          billed: boolean | null
          created_at: string
          description: string
          entry_date: string
          entry_type: string
          expense_code: string | null
          id: string
          invoice_id: string | null
          matter_id: string
          organization_id: string
          quantity: number | null
          rate: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          activity_code?: string | null
          amount: number
          billable?: boolean | null
          billed?: boolean | null
          created_at?: string
          description: string
          entry_date?: string
          entry_type: string
          expense_code?: string | null
          id?: string
          invoice_id?: string | null
          matter_id: string
          organization_id: string
          quantity?: number | null
          rate?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          activity_code?: string | null
          amount?: number
          billable?: boolean | null
          billed?: boolean | null
          created_at?: string
          description?: string
          entry_date?: string
          entry_type?: string
          expense_code?: string | null
          id?: string
          invoice_id?: string | null
          matter_id?: string
          organization_id?: string
          quantity?: number | null
          rate?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_entries_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_entries_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_entries_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_rates: {
        Row: {
          client_id: string | null
          created_at: string
          effective_date: string
          expires_at: string | null
          id: string
          matter_id: string | null
          organization_id: string
          rate_amount: number
          rate_type: string
          user_id: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          effective_date?: string
          expires_at?: string | null
          id?: string
          matter_id?: string | null
          organization_id: string
          rate_amount: number
          rate_type: string
          user_id?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string
          effective_date?: string
          expires_at?: string | null
          id?: string
          matter_id?: string | null
          organization_id?: string
          rate_amount?: number
          rate_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_rates_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_rates_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_rates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_rates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bug_reports: {
        Row: {
          actual_behavior: string | null
          assigned_to: string | null
          browser_info: string | null
          category: string | null
          created_at: string | null
          description: string
          device_info: string | null
          expected_behavior: string | null
          hub_name: string | null
          id: string
          page_url: string | null
          priority: number | null
          reporter_email: string | null
          reporter_name: string | null
          resolution_notes: string | null
          resolved_at: string | null
          screenshot_url: string | null
          severity: string | null
          status: string | null
          steps_to_reproduce: string | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          actual_behavior?: string | null
          assigned_to?: string | null
          browser_info?: string | null
          category?: string | null
          created_at?: string | null
          description: string
          device_info?: string | null
          expected_behavior?: string | null
          hub_name?: string | null
          id?: string
          page_url?: string | null
          priority?: number | null
          reporter_email?: string | null
          reporter_name?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          screenshot_url?: string | null
          severity?: string | null
          status?: string | null
          steps_to_reproduce?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          actual_behavior?: string | null
          assigned_to?: string | null
          browser_info?: string | null
          category?: string | null
          created_at?: string | null
          description?: string
          device_info?: string | null
          expected_behavior?: string | null
          hub_name?: string | null
          id?: string
          page_url?: string | null
          priority?: number | null
          reporter_email?: string | null
          reporter_name?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          screenshot_url?: string | null
          severity?: string | null
          status?: string | null
          steps_to_reproduce?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      call_logs: {
        Row: {
          ai_summary: string | null
          call_type: string
          case_id: string | null
          contact_name: string | null
          created_at: string
          duration_seconds: number | null
          ended_at: string | null
          id: string
          organization_id: string | null
          phone_number: string
          recording_url: string | null
          started_at: string
          transcription: string | null
          user_id: string
        }
        Insert: {
          ai_summary?: string | null
          call_type?: string
          case_id?: string | null
          contact_name?: string | null
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          organization_id?: string | null
          phone_number: string
          recording_url?: string | null
          started_at?: string
          transcription?: string | null
          user_id: string
        }
        Update: {
          ai_summary?: string | null
          call_type?: string
          case_id?: string | null
          contact_name?: string | null
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          organization_id?: string | null
          phone_number?: string
          recording_url?: string | null
          started_at?: string
          transcription?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "call_logs_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      case_documents: {
        Row: {
          case_id: string
          created_at: string
          file_size: number | null
          file_type: string | null
          file_url: string | null
          id: string
          name: string
          notes: string | null
          uploaded_by: string | null
        }
        Insert: {
          case_id: string
          created_at?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          name: string
          notes?: string | null
          uploaded_by?: string | null
        }
        Update: {
          case_id?: string
          created_at?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          name?: string
          notes?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_documents_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      case_predictions: {
        Row: {
          case_id: string | null
          confidence_score: number
          created_at: string
          factors: Json | null
          id: string
          model_version: string | null
          organization_id: string
          predicted_value: Json
          prediction_type: string
          updated_at: string
        }
        Insert: {
          case_id?: string | null
          confidence_score: number
          created_at?: string
          factors?: Json | null
          id?: string
          model_version?: string | null
          organization_id: string
          predicted_value: Json
          prediction_type: string
          updated_at?: string
        }
        Update: {
          case_id?: string | null
          confidence_score?: number
          created_at?: string
          factors?: Json | null
          id?: string
          model_version?: string | null
          organization_id?: string
          predicted_value?: Json
          prediction_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_predictions_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_predictions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      case_stages: {
        Row: {
          auto_tasks: Json | null
          color: string | null
          court_rules_ref: string | null
          created_at: string
          id: string
          name: string
          order_index: number
          organization_id: string
        }
        Insert: {
          auto_tasks?: Json | null
          color?: string | null
          court_rules_ref?: string | null
          created_at?: string
          id?: string
          name: string
          order_index: number
          organization_id: string
        }
        Update: {
          auto_tasks?: Json | null
          color?: string | null
          court_rules_ref?: string | null
          created_at?: string
          id?: string
          name?: string
          order_index?: number
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_stages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      case_tasks: {
        Row: {
          assigned_to: string | null
          case_id: string
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          is_auto_generated: boolean | null
          organization_id: string
          priority: string | null
          stage_id: string | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          case_id: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_auto_generated?: boolean | null
          organization_id: string
          priority?: string | null
          stage_id?: string | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          case_id?: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_auto_generated?: boolean | null
          organization_id?: string
          priority?: string | null
          stage_id?: string | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_tasks_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_tasks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_tasks_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "case_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      case_timelines: {
        Row: {
          case_id: string
          created_at: string
          created_by: string | null
          event_date: string
          event_description: string | null
          event_title: string
          event_type: string
          id: string
          metadata: Json | null
        }
        Insert: {
          case_id: string
          created_at?: string
          created_by?: string | null
          event_date: string
          event_description?: string | null
          event_title: string
          event_type: string
          id?: string
          metadata?: Json | null
        }
        Update: {
          case_id?: string
          created_at?: string
          created_by?: string | null
          event_date?: string
          event_description?: string | null
          event_title?: string
          event_type?: string
          id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "case_timelines_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_timelines_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          assigned_lawyer_id: string | null
          case_number: string | null
          case_type: string | null
          client_id: string
          court_date: string | null
          court_name: string | null
          created_at: string
          description: string | null
          id: string
          notes: string | null
          opposing_counsel: string | null
          opposing_party: string | null
          organization_id: string
          status: Database["public"]["Enums"]["case_status"]
          title: string
          updated_at: string
        }
        Insert: {
          assigned_lawyer_id?: string | null
          case_number?: string | null
          case_type?: string | null
          client_id: string
          court_date?: string | null
          court_name?: string | null
          created_at?: string
          description?: string | null
          id?: string
          notes?: string | null
          opposing_counsel?: string | null
          opposing_party?: string | null
          organization_id: string
          status?: Database["public"]["Enums"]["case_status"]
          title: string
          updated_at?: string
        }
        Update: {
          assigned_lawyer_id?: string | null
          case_number?: string | null
          case_type?: string | null
          client_id?: string
          court_date?: string | null
          court_name?: string | null
          created_at?: string
          description?: string | null
          id?: string
          notes?: string | null
          opposing_counsel?: string | null
          opposing_party?: string | null
          organization_id?: string
          status?: Database["public"]["Enums"]["case_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cases_assigned_lawyer_id_fkey"
            columns: ["assigned_lawyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      cases_imported: {
        Row: {
          citation: string | null
          client_summary: string | null
          courtlistener_id: number | null
          created_at: string
          custody_notes: string | null
          date_filed: string | null
          defense_plan: string | null
          id: string
          raw: Json | null
          source: string
          summary: string | null
          title: string | null
          updated_at: string
          url: string | null
        }
        Insert: {
          citation?: string | null
          client_summary?: string | null
          courtlistener_id?: number | null
          created_at?: string
          custody_notes?: string | null
          date_filed?: string | null
          defense_plan?: string | null
          id?: string
          raw?: Json | null
          source?: string
          summary?: string | null
          title?: string | null
          updated_at?: string
          url?: string | null
        }
        Update: {
          citation?: string | null
          client_summary?: string | null
          courtlistener_id?: number | null
          created_at?: string
          custody_notes?: string | null
          date_filed?: string | null
          defense_plan?: string | null
          id?: string
          raw?: Json | null
          source?: string
          summary?: string | null
          title?: string | null
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          intake_date: string | null
          notes: string | null
          organization_id: string
          phone: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          intake_date?: string | null
          notes?: string | null
          organization_id: string
          phone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          intake_date?: string | null
          notes?: string | null
          organization_id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_logs: {
        Row: {
          action: string
          compliance_framework: string | null
          created_at: string
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          organization_id: string
          resource_id: string | null
          resource_type: string
          severity: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          compliance_framework?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          organization_id: string
          resource_id?: string | null
          resource_type: string
          severity?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          compliance_framework?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          organization_id?: string
          resource_id?: string | null
          resource_type?: string
          severity?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conflict_checks: {
        Row: {
          case_id: string | null
          checked_at: string
          checked_by: string | null
          checked_party: string
          conflict_found: boolean | null
          id: string
          organization_id: string
          related_cases: Json | null
        }
        Insert: {
          case_id?: string | null
          checked_at?: string
          checked_by?: string | null
          checked_party: string
          conflict_found?: boolean | null
          id?: string
          organization_id: string
          related_cases?: Json | null
        }
        Update: {
          case_id?: string | null
          checked_at?: string
          checked_by?: string | null
          checked_party?: string
          conflict_found?: boolean | null
          id?: string
          organization_id?: string
          related_cases?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "conflict_checks_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conflict_checks_checked_by_fkey"
            columns: ["checked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conflict_checks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      custody_calendar_events: {
        Row: {
          created_at: string | null
          custody_case_id: string | null
          end_time: string | null
          event_type: string | null
          geo_coords: Json | null
          id: string
          location: string | null
          parent_id: string | null
          start_time: string | null
          synced_outlook: boolean | null
          title: string
        }
        Insert: {
          created_at?: string | null
          custody_case_id?: string | null
          end_time?: string | null
          event_type?: string | null
          geo_coords?: Json | null
          id?: string
          location?: string | null
          parent_id?: string | null
          start_time?: string | null
          synced_outlook?: boolean | null
          title: string
        }
        Update: {
          created_at?: string | null
          custody_case_id?: string | null
          end_time?: string | null
          event_type?: string | null
          geo_coords?: Json | null
          id?: string
          location?: string | null
          parent_id?: string | null
          start_time?: string | null
          synced_outlook?: boolean | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "custody_calendar_events_custody_case_id_fkey"
            columns: ["custody_case_id"]
            isOneToOne: false
            referencedRelation: "custody_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      custody_cases: {
        Row: {
          case_number: string | null
          children: Json | null
          communications: Json | null
          conflict_level: string | null
          created_at: string | null
          custody_type: string | null
          expenses: Json | null
          id: string
          linked_dui_case: string | null
          organization_id: string | null
          parent1_name: string | null
          parent2_name: string | null
          parenting_plan: Json | null
          risk_score: number | null
          shared_calendar: Json | null
          state: string | null
          status: string | null
          support_calculation: Json | null
          updated_at: string | null
          user_id: string
          violations: Json | null
        }
        Insert: {
          case_number?: string | null
          children?: Json | null
          communications?: Json | null
          conflict_level?: string | null
          created_at?: string | null
          custody_type?: string | null
          expenses?: Json | null
          id?: string
          linked_dui_case?: string | null
          organization_id?: string | null
          parent1_name?: string | null
          parent2_name?: string | null
          parenting_plan?: Json | null
          risk_score?: number | null
          shared_calendar?: Json | null
          state?: string | null
          status?: string | null
          support_calculation?: Json | null
          updated_at?: string | null
          user_id: string
          violations?: Json | null
        }
        Update: {
          case_number?: string | null
          children?: Json | null
          communications?: Json | null
          conflict_level?: string | null
          created_at?: string | null
          custody_type?: string | null
          expenses?: Json | null
          id?: string
          linked_dui_case?: string | null
          organization_id?: string | null
          parent1_name?: string | null
          parent2_name?: string | null
          parenting_plan?: Json | null
          risk_score?: number | null
          shared_calendar?: Json | null
          state?: string | null
          status?: string | null
          support_calculation?: Json | null
          updated_at?: string | null
          user_id?: string
          violations?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "custody_cases_linked_dui_case_fkey"
            columns: ["linked_dui_case"]
            isOneToOne: false
            referencedRelation: "dui_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custody_cases_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      custody_payments: {
        Row: {
          amount: number
          arrears: number | null
          created_at: string | null
          custody_case_id: string | null
          due_date: string | null
          id: string
          paid_date: string | null
          payer_id: string | null
          status: string | null
          stripe_payment_id: string | null
        }
        Insert: {
          amount: number
          arrears?: number | null
          created_at?: string | null
          custody_case_id?: string | null
          due_date?: string | null
          id?: string
          paid_date?: string | null
          payer_id?: string | null
          status?: string | null
          stripe_payment_id?: string | null
        }
        Update: {
          amount?: number
          arrears?: number | null
          created_at?: string | null
          custody_case_id?: string | null
          due_date?: string | null
          id?: string
          paid_date?: string | null
          payer_id?: string | null
          status?: string | null
          stripe_payment_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custody_payments_custody_case_id_fkey"
            columns: ["custody_case_id"]
            isOneToOne: false
            referencedRelation: "custody_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      document_templates: {
        Row: {
          category: string | null
          content: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          organization_id: string | null
          practice_area: string | null
          updated_at: string
          usage_count: number | null
          variables: Json | null
        }
        Insert: {
          category?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          organization_id?: string | null
          practice_area?: string | null
          updated_at?: string
          usage_count?: number | null
          variables?: Json | null
        }
        Update: {
          category?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          organization_id?: string | null
          practice_area?: string | null
          updated_at?: string
          usage_count?: number | null
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "document_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      dui_cases: {
        Row: {
          arrest_date: string | null
          bac_level: number | null
          breathalyzer_data: Json | null
          case_number: string | null
          county: string | null
          court_name: string | null
          created_at: string | null
          id: string
          notes: string | null
          organization_id: string | null
          outcome: string | null
          plea_type: string | null
          predicted_outcome: Json | null
          prediction_confidence: number | null
          state: string | null
          status: string | null
          timeline: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          arrest_date?: string | null
          bac_level?: number | null
          breathalyzer_data?: Json | null
          case_number?: string | null
          county?: string | null
          court_name?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          outcome?: string | null
          plea_type?: string | null
          predicted_outcome?: Json | null
          prediction_confidence?: number | null
          state?: string | null
          status?: string | null
          timeline?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          arrest_date?: string | null
          bac_level?: number | null
          breathalyzer_data?: Json | null
          case_number?: string | null
          county?: string | null
          court_name?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          outcome?: string | null
          plea_type?: string | null
          predicted_outcome?: Json | null
          prediction_confidence?: number | null
          state?: string | null
          status?: string | null
          timeline?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dui_cases_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      dui_hearing_sims: {
        Row: {
          case_id: string | null
          created_at: string | null
          feedback: string | null
          id: string
          outcome_prediction: Json | null
          score: number | null
          sim_type: string | null
          transcript: Json | null
          user_id: string
        }
        Insert: {
          case_id?: string | null
          created_at?: string | null
          feedback?: string | null
          id?: string
          outcome_prediction?: Json | null
          score?: number | null
          sim_type?: string | null
          transcript?: Json | null
          user_id: string
        }
        Update: {
          case_id?: string | null
          created_at?: string | null
          feedback?: string | null
          id?: string
          outcome_prediction?: Json | null
          score?: number | null
          sim_type?: string | null
          transcript?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dui_hearing_sims_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "dui_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      dui_leads: {
        Row: {
          case_details: string | null
          client_name: string | null
          county: string | null
          created_at: string | null
          email: string | null
          geo_location: Json | null
          id: string
          matched_lawyer_id: string | null
          phone: string | null
          state: string | null
          status: string | null
        }
        Insert: {
          case_details?: string | null
          client_name?: string | null
          county?: string | null
          created_at?: string | null
          email?: string | null
          geo_location?: Json | null
          id?: string
          matched_lawyer_id?: string | null
          phone?: string | null
          state?: string | null
          status?: string | null
        }
        Update: {
          case_details?: string | null
          client_name?: string | null
          county?: string | null
          created_at?: string | null
          email?: string | null
          geo_location?: Json | null
          id?: string
          matched_lawyer_id?: string | null
          phone?: string | null
          state?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dui_leads_matched_lawyer_id_fkey"
            columns: ["matched_lawyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollment_records: {
        Row: {
          certification_id: string
          completed_courses: string[] | null
          completed_quizzes: string[] | null
          enrolled_at: string
          id: string
          progress_percentage: number | null
          status: string | null
          user_id: string
        }
        Insert: {
          certification_id: string
          completed_courses?: string[] | null
          completed_quizzes?: string[] | null
          enrolled_at?: string
          id?: string
          progress_percentage?: number | null
          status?: string | null
          user_id: string
        }
        Update: {
          certification_id?: string
          completed_courses?: string[] | null
          completed_quizzes?: string[] | null
          enrolled_at?: string
          id?: string
          progress_percentage?: number | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollment_records_certification_id_fkey"
            columns: ["certification_id"]
            isOneToOne: false
            referencedRelation: "micro_certifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollment_records_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      firm_insights: {
        Row: {
          action_items: Json | null
          created_at: string
          description: string
          id: string
          impact_score: number | null
          insight_type: string
          is_dismissed: boolean | null
          organization_id: string
          title: string
        }
        Insert: {
          action_items?: Json | null
          created_at?: string
          description: string
          id?: string
          impact_score?: number | null
          insight_type: string
          is_dismissed?: boolean | null
          organization_id: string
          title: string
        }
        Update: {
          action_items?: Json | null
          created_at?: string
          description?: string
          id?: string
          impact_score?: number | null
          insight_type?: string
          is_dismissed?: boolean | null
          organization_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "firm_insights_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      inheritance_sims: {
        Row: {
          created_at: string | null
          id: string
          results: Json | null
          scenario_name: string | null
          scenario_params: Json | null
          tax_impact: Json | null
          user_id: string
          will_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          results?: Json | null
          scenario_name?: string | null
          scenario_params?: Json | null
          tax_impact?: Json | null
          user_id: string
          will_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          results?: Json | null
          scenario_name?: string | null
          scenario_params?: Json | null
          tax_impact?: Json | null
          user_id?: string
          will_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inheritance_sims_will_id_fkey"
            columns: ["will_id"]
            isOneToOne: false
            referencedRelation: "will_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_configs: {
        Row: {
          api_endpoint: string | null
          created_at: string
          credentials_encrypted: string | null
          id: string
          integration_name: string
          integration_type: string
          is_active: boolean | null
          last_sync_at: string | null
          organization_id: string
          settings: Json | null
          sync_status: string | null
          updated_at: string
        }
        Insert: {
          api_endpoint?: string | null
          created_at?: string
          credentials_encrypted?: string | null
          id?: string
          integration_name: string
          integration_type: string
          is_active?: boolean | null
          last_sync_at?: string | null
          organization_id: string
          settings?: Json | null
          sync_status?: string | null
          updated_at?: string
        }
        Update: {
          api_endpoint?: string | null
          created_at?: string
          credentials_encrypted?: string | null
          id?: string
          integration_name?: string
          integration_type?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          organization_id?: string
          settings?: Json | null
          sync_status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_configs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_logs: {
        Row: {
          action: string
          created_at: string
          error_message: string | null
          id: string
          integration_id: string | null
          request_data: Json | null
          response_data: Json | null
          status: string
        }
        Insert: {
          action: string
          created_at?: string
          error_message?: string | null
          id?: string
          integration_id?: string | null
          request_data?: Json | null
          response_data?: Json | null
          status: string
        }
        Update: {
          action?: string
          created_at?: string
          error_message?: string | null
          id?: string
          integration_id?: string | null
          request_data?: Json | null
          response_data?: Json | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_logs_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integration_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          api_version: string | null
          created_at: string
          credentials: Json | null
          error_message: string | null
          id: string
          integration_type: string
          last_sync_at: string | null
          organization_id: string
          provider: string
          settings: Json | null
          status: string | null
          sync_frequency: string | null
          updated_at: string
          webhook_url: string | null
        }
        Insert: {
          api_version?: string | null
          created_at?: string
          credentials?: Json | null
          error_message?: string | null
          id?: string
          integration_type: string
          last_sync_at?: string | null
          organization_id: string
          provider: string
          settings?: Json | null
          status?: string | null
          sync_frequency?: string | null
          updated_at?: string
          webhook_url?: string | null
        }
        Update: {
          api_version?: string | null
          created_at?: string
          credentials?: Json | null
          error_message?: string | null
          id?: string
          integration_type?: string
          last_sync_at?: string | null
          organization_id?: string
          provider?: string
          settings?: Json | null
          status?: string | null
          sync_frequency?: string | null
          updated_at?: string
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integrations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          case_id: string | null
          client_id: string
          created_at: string
          due_date: string | null
          id: string
          invoice_number: string | null
          items: Json | null
          notes: string | null
          organization_id: string
          paid_at: string | null
          status: string | null
        }
        Insert: {
          amount: number
          case_id?: string | null
          client_id: string
          created_at?: string
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          items?: Json | null
          notes?: string | null
          organization_id: string
          paid_at?: string | null
          status?: string | null
        }
        Update: {
          amount?: number
          case_id?: string | null
          client_id?: string
          created_at?: string
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          items?: Json | null
          notes?: string | null
          organization_id?: string
          paid_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_payments: {
        Row: {
          amount: number
          created_at: string
          due_date: string
          id: string
          late_fee: number | null
          loan_id: string
          payment_date: string
          payment_method: string | null
          status: string
          stripe_payment_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          due_date: string
          id?: string
          late_fee?: number | null
          loan_id: string
          payment_date?: string
          payment_method?: string | null
          status?: string
          stripe_payment_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string
          id?: string
          late_fee?: number | null
          loan_id?: string
          payment_date?: string
          payment_method?: string | null
          status?: string
          stripe_payment_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loan_payments_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loans"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_transactions: {
        Row: {
          amount: number
          created_at: string
          id: string
          loan_id: string | null
          platform_fee: number
          status: string
          stripe_transfer_id: string | null
          transaction_type: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          loan_id?: string | null
          platform_fee?: number
          status?: string
          stripe_transfer_id?: string | null
          transaction_type: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          loan_id?: string | null
          platform_fee?: number
          status?: string
          stripe_transfer_id?: string | null
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "loan_transactions_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loans"
            referencedColumns: ["id"]
          },
        ]
      }
      loans: {
        Row: {
          amount: number
          approved_at: string | null
          created_at: string
          disbursed_at: string | null
          document_urls: Json | null
          id: string
          interest_rate: number | null
          monthly_payment: number | null
          organization_id: string | null
          platform_fee: number | null
          purpose: string
          status: string
          term_months: number | null
          total_repayment: number | null
          updated_at: string
          user_id: string
          verification_data: Json | null
        }
        Insert: {
          amount: number
          approved_at?: string | null
          created_at?: string
          disbursed_at?: string | null
          document_urls?: Json | null
          id?: string
          interest_rate?: number | null
          monthly_payment?: number | null
          organization_id?: string | null
          platform_fee?: number | null
          purpose: string
          status?: string
          term_months?: number | null
          total_repayment?: number | null
          updated_at?: string
          user_id: string
          verification_data?: Json | null
        }
        Update: {
          amount?: number
          approved_at?: string | null
          created_at?: string
          disbursed_at?: string | null
          document_urls?: Json | null
          id?: string
          interest_rate?: number | null
          monthly_payment?: number | null
          organization_id?: string | null
          platform_fee?: number | null
          purpose?: string
          status?: string
          term_months?: number | null
          total_repayment?: number | null
          updated_at?: string
          user_id?: string
          verification_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "loans_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      matters: {
        Row: {
          billing_type: string | null
          budget: number | null
          case_id: string | null
          client_id: string | null
          close_date: string | null
          created_at: string
          description: string | null
          flat_fee_amount: number | null
          hourly_rate: number | null
          id: string
          matter_number: string
          name: string
          open_date: string | null
          organization_id: string
          originating_attorney_id: string | null
          practice_area: string | null
          responsible_attorney_id: string | null
          retainer_amount: number | null
          status: string | null
          statute_of_limitations: string | null
          updated_at: string
        }
        Insert: {
          billing_type?: string | null
          budget?: number | null
          case_id?: string | null
          client_id?: string | null
          close_date?: string | null
          created_at?: string
          description?: string | null
          flat_fee_amount?: number | null
          hourly_rate?: number | null
          id?: string
          matter_number: string
          name: string
          open_date?: string | null
          organization_id: string
          originating_attorney_id?: string | null
          practice_area?: string | null
          responsible_attorney_id?: string | null
          retainer_amount?: number | null
          status?: string | null
          statute_of_limitations?: string | null
          updated_at?: string
        }
        Update: {
          billing_type?: string | null
          budget?: number | null
          case_id?: string | null
          client_id?: string | null
          close_date?: string | null
          created_at?: string
          description?: string | null
          flat_fee_amount?: number | null
          hourly_rate?: number | null
          id?: string
          matter_number?: string
          name?: string
          open_date?: string | null
          organization_id?: string
          originating_attorney_id?: string | null
          practice_area?: string | null
          responsible_attorney_id?: string | null
          retainer_amount?: number | null
          status?: string | null
          statute_of_limitations?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "matters_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matters_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matters_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matters_originating_attorney_id_fkey"
            columns: ["originating_attorney_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matters_responsible_attorney_id_fkey"
            columns: ["responsible_attorney_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          case_id: string | null
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          message_type: Database["public"]["Enums"]["message_type"]
          organization_id: string
          recipient_id: string | null
          sender_id: string
          subject: string | null
        }
        Insert: {
          case_id?: string | null
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_type?: Database["public"]["Enums"]["message_type"]
          organization_id: string
          recipient_id?: string | null
          sender_id: string
          subject?: string | null
        }
        Update: {
          case_id?: string | null
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_type?: Database["public"]["Enums"]["message_type"]
          organization_id?: string
          recipient_id?: string | null
          sender_id?: string
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      micro_certifications: {
        Row: {
          badge_image_url: string | null
          category: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          passing_score: number | null
          prediction_boost: number | null
          required_courses: string[] | null
          required_quizzes: string[] | null
        }
        Insert: {
          badge_image_url?: string | null
          category: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          passing_score?: number | null
          prediction_boost?: number | null
          required_courses?: string[] | null
          required_quizzes?: string[] | null
        }
        Update: {
          badge_image_url?: string | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          passing_score?: number | null
          prediction_boost?: number | null
          required_courses?: string[] | null
          required_quizzes?: string[] | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          hub: string | null
          id: string
          is_read: boolean
          message: string
          reference_id: string | null
          reference_type: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          hub?: string | null
          id?: string
          is_read?: boolean
          message: string
          reference_id?: string | null
          reference_type?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          hub?: string | null
          id?: string
          is_read?: boolean
          message?: string
          reference_id?: string | null
          reference_type?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      organization_members: {
        Row: {
          created_at: string
          department: string | null
          employee_id: string | null
          hire_date: string | null
          hourly_rate: number | null
          id: string
          is_active: boolean | null
          job_title: string | null
          organization_id: string
          permissions: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          employee_id?: string | null
          hire_date?: string | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          job_title?: string | null
          organization_id: string
          permissions?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          department?: string | null
          employee_id?: string | null
          hire_date?: string | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          job_title?: string | null
          organization_id?: string
          permissions?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          description: string | null
          email: string | null
          geo_tracking_enabled: boolean | null
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          settings: Json | null
          state: string | null
          updated_at: string
          website: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          geo_tracking_enabled?: boolean | null
          id?: string
          logo_url?: string | null
          name: string
          phone?: string | null
          settings?: Json | null
          state?: string | null
          updated_at?: string
          website?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          geo_tracking_enabled?: boolean | null
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          settings?: Json | null
          state?: string | null
          updated_at?: string
          website?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      parole_cases: {
        Row: {
          case_number: string | null
          check_ins: Json | null
          compliance_score: number | null
          conditions: Json | null
          created_at: string | null
          end_date: string | null
          geo_restrictions: Json | null
          id: string
          linked_dui_case: string | null
          offender_name: string
          offense_type: string | null
          officer_name: string | null
          organization_id: string | null
          recidivism_risk: number | null
          rehab_plan: Json | null
          start_date: string | null
          status: string | null
          supervision_level: string | null
          updated_at: string | null
          user_id: string
          violations: Json | null
        }
        Insert: {
          case_number?: string | null
          check_ins?: Json | null
          compliance_score?: number | null
          conditions?: Json | null
          created_at?: string | null
          end_date?: string | null
          geo_restrictions?: Json | null
          id?: string
          linked_dui_case?: string | null
          offender_name: string
          offense_type?: string | null
          officer_name?: string | null
          organization_id?: string | null
          recidivism_risk?: number | null
          rehab_plan?: Json | null
          start_date?: string | null
          status?: string | null
          supervision_level?: string | null
          updated_at?: string | null
          user_id: string
          violations?: Json | null
        }
        Update: {
          case_number?: string | null
          check_ins?: Json | null
          compliance_score?: number | null
          conditions?: Json | null
          created_at?: string | null
          end_date?: string | null
          geo_restrictions?: Json | null
          id?: string
          linked_dui_case?: string | null
          offender_name?: string
          offense_type?: string | null
          officer_name?: string | null
          organization_id?: string | null
          recidivism_risk?: number | null
          rehab_plan?: Json | null
          start_date?: string | null
          status?: string | null
          supervision_level?: string | null
          updated_at?: string | null
          user_id?: string
          violations?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "parole_cases_linked_dui_case_fkey"
            columns: ["linked_dui_case"]
            isOneToOne: false
            referencedRelation: "dui_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parole_cases_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_predictions: {
        Row: {
          confidence_score: number | null
          created_at: string
          id: string
          invoice_id: string | null
          organization_id: string
          predicted_amount: number | null
          predicted_payment_date: string | null
          risk_factors: Json | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          id?: string
          invoice_id?: string | null
          organization_id: string
          predicted_amount?: number | null
          predicted_payment_date?: string | null
          risk_factors?: Json | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          id?: string
          invoice_id?: string | null
          organization_id?: string
          predicted_amount?: number | null
          predicted_payment_date?: string | null
          risk_factors?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_predictions_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_predictions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      prediction_models: {
        Row: {
          accuracy_score: number | null
          created_at: string
          id: string
          is_active: boolean | null
          model_data: Json
          model_type: string
          organization_id: string | null
          training_metrics: Json | null
          updated_at: string
        }
        Insert: {
          accuracy_score?: number | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          model_data: Json
          model_type: string
          organization_id?: string | null
          training_metrics?: Json | null
          updated_at?: string
        }
        Update: {
          accuracy_score?: number | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          model_data?: Json
          model_type?: string
          organization_id?: string | null
          training_metrics?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prediction_models_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string
          full_name: string | null
          id: string
          location: string | null
          phone: string | null
          timezone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email: string
          full_name?: string | null
          id: string
          location?: string | null
          phone?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string
          full_name?: string | null
          id?: string
          location?: string | null
          phone?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      rehab_sessions: {
        Row: {
          completed_at: string | null
          created_at: string | null
          gamification_points: number | null
          id: string
          notes: string | null
          parole_case_id: string | null
          progress_score: number | null
          scheduled_at: string | null
          session_type: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          gamification_points?: number | null
          id?: string
          notes?: string | null
          parole_case_id?: string | null
          progress_score?: number | null
          scheduled_at?: string | null
          session_type?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          gamification_points?: number | null
          id?: string
          notes?: string | null
          parole_case_id?: string | null
          progress_score?: number | null
          scheduled_at?: string | null
          session_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rehab_sessions_parole_case_id_fkey"
            columns: ["parole_case_id"]
            isOneToOne: false
            referencedRelation: "parole_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      revenue_share_transactions: {
        Row: {
          created_at: string | null
          gross_amount: number
          id: string
          metadata: Json | null
          net_amount: number
          platform_fee: number
          status: string | null
          stripe_transfer_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          gross_amount: number
          id?: string
          metadata?: Json | null
          net_amount: number
          platform_fee: number
          status?: string | null
          stripe_transfer_id?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          gross_amount?: number
          id?: string
          metadata?: Json | null
          net_amount?: number
          platform_fee?: number
          status?: string | null
          stripe_transfer_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      test_results: {
        Row: {
          created_at: string | null
          duration_ms: number | null
          error_message: string | null
          id: string
          notes: string | null
          scenario_id: string | null
          screenshot_url: string | null
          status: string | null
          test_user_id: string | null
        }
        Insert: {
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          notes?: string | null
          scenario_id?: string | null
          screenshot_url?: string | null
          status?: string | null
          test_user_id?: string | null
        }
        Update: {
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          notes?: string | null
          scenario_id?: string | null
          screenshot_url?: string | null
          status?: string | null
          test_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "test_results_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "test_scenarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_results_test_user_id_fkey"
            columns: ["test_user_id"]
            isOneToOne: false
            referencedRelation: "test_users"
            referencedColumns: ["id"]
          },
        ]
      }
      test_scenarios: {
        Row: {
          created_at: string | null
          description: string | null
          expected_result: string | null
          hub_name: string
          id: string
          is_automated: boolean | null
          priority: number | null
          scenario_name: string
          steps: Json
          user_types: string[] | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          expected_result?: string | null
          hub_name: string
          id?: string
          is_automated?: boolean | null
          priority?: number | null
          scenario_name: string
          steps: Json
          user_types?: string[] | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          expected_result?: string | null
          hub_name?: string
          id?: string
          is_automated?: boolean | null
          priority?: number | null
          scenario_name?: string
          steps?: Json
          user_types?: string[] | null
        }
        Relationships: []
      }
      test_users: {
        Row: {
          created_at: string | null
          hubs_to_test: string[] | null
          id: string
          issues_found: number | null
          last_active_at: string | null
          organization_size: string | null
          subscription_tier: string | null
          test_persona: string
          test_scenarios: Json | null
          tests_completed: Json | null
          user_id: string | null
          user_type: string
        }
        Insert: {
          created_at?: string | null
          hubs_to_test?: string[] | null
          id?: string
          issues_found?: number | null
          last_active_at?: string | null
          organization_size?: string | null
          subscription_tier?: string | null
          test_persona: string
          test_scenarios?: Json | null
          tests_completed?: Json | null
          user_id?: string | null
          user_type: string
        }
        Update: {
          created_at?: string | null
          hubs_to_test?: string[] | null
          id?: string
          issues_found?: number | null
          last_active_at?: string | null
          organization_size?: string | null
          subscription_tier?: string | null
          test_persona?: string
          test_scenarios?: Json | null
          tests_completed?: Json | null
          user_id?: string | null
          user_type?: string
        }
        Relationships: []
      }
      time_entries: {
        Row: {
          billable: boolean | null
          case_id: string | null
          clock_in: string
          clock_in_location: Json | null
          clock_out: string | null
          clock_out_location: Json | null
          created_at: string
          description: string | null
          hourly_rate: number | null
          id: string
          organization_id: string
          user_id: string
        }
        Insert: {
          billable?: boolean | null
          case_id?: string | null
          clock_in: string
          clock_in_location?: Json | null
          clock_out?: string | null
          clock_out_location?: Json | null
          created_at?: string
          description?: string | null
          hourly_rate?: number | null
          id?: string
          organization_id: string
          user_id: string
        }
        Update: {
          billable?: boolean | null
          case_id?: string | null
          clock_in?: string
          clock_in_location?: Json | null
          clock_out?: string | null
          clock_out_location?: Json | null
          created_at?: string
          description?: string | null
          hourly_rate?: number | null
          id?: string
          organization_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trust_accounts: {
        Row: {
          account_name: string
          account_number: string | null
          account_type: string | null
          bank_name: string | null
          created_at: string
          current_balance: number
          id: string
          last_reconciled_at: string | null
          organization_id: string
          reconciled_balance: number | null
          routing_number: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          account_name: string
          account_number?: string | null
          account_type?: string | null
          bank_name?: string | null
          created_at?: string
          current_balance?: number
          id?: string
          last_reconciled_at?: string | null
          organization_id: string
          reconciled_balance?: number | null
          routing_number?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          account_name?: string
          account_number?: string | null
          account_type?: string | null
          bank_name?: string | null
          created_at?: string
          current_balance?: number
          id?: string
          last_reconciled_at?: string | null
          organization_id?: string
          reconciled_balance?: number | null
          routing_number?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trust_accounts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      trust_transactions: {
        Row: {
          amount: number
          check_number: string | null
          client_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          matter_id: string | null
          payee: string | null
          payment_method: string | null
          reconciled: boolean | null
          reconciled_at: string | null
          reconciled_by: string | null
          reference_number: string | null
          running_balance: number | null
          transaction_date: string
          transaction_type: string
          trust_account_id: string
        }
        Insert: {
          amount: number
          check_number?: string | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          matter_id?: string | null
          payee?: string | null
          payment_method?: string | null
          reconciled?: boolean | null
          reconciled_at?: string | null
          reconciled_by?: string | null
          reference_number?: string | null
          running_balance?: number | null
          transaction_date?: string
          transaction_type: string
          trust_account_id: string
        }
        Update: {
          amount?: number
          check_number?: string | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          matter_id?: string | null
          payee?: string | null
          payment_method?: string | null
          reconciled?: boolean | null
          reconciled_at?: string | null
          reconciled_by?: string | null
          reference_number?: string | null
          running_balance?: number | null
          transaction_date?: string
          transaction_type?: string
          trust_account_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trust_transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trust_transactions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trust_transactions_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trust_transactions_reconciled_by_fkey"
            columns: ["reconciled_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trust_transactions_trust_account_id_fkey"
            columns: ["trust_account_id"]
            isOneToOne: false
            referencedRelation: "trust_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      unbilled_time_alerts: {
        Row: {
          alert_type: string
          amount_at_risk: number | null
          billing_entry_id: string | null
          created_at: string
          id: string
          is_resolved: boolean | null
          message: string
          organization_id: string
          user_id: string
        }
        Insert: {
          alert_type: string
          amount_at_risk?: number | null
          billing_entry_id?: string | null
          created_at?: string
          id?: string
          is_resolved?: boolean | null
          message: string
          organization_id: string
          user_id: string
        }
        Update: {
          alert_type?: string
          amount_at_risk?: number | null
          billing_entry_id?: string | null
          created_at?: string
          id?: string
          is_resolved?: boolean | null
          message?: string
          organization_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "unbilled_time_alerts_billing_entry_id_fkey"
            columns: ["billing_entry_id"]
            isOneToOne: false
            referencedRelation: "billing_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unbilled_time_alerts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unbilled_time_alerts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_name: string
          badge_type: string
          earned_at: string
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          badge_name: string
          badge_type: string
          earned_at?: string
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          badge_name?: string
          badge_type?: string
          earned_at?: string
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_certifications: {
        Row: {
          certificate_url: string | null
          certification_id: string
          earned_at: string
          expires_at: string | null
          id: string
          score: number | null
          user_id: string
          verification_code: string | null
        }
        Insert: {
          certificate_url?: string | null
          certification_id: string
          earned_at?: string
          expires_at?: string | null
          id?: string
          score?: number | null
          user_id: string
          verification_code?: string | null
        }
        Update: {
          certificate_url?: string | null
          certification_id?: string
          earned_at?: string
          expires_at?: string | null
          id?: string
          score?: number | null
          user_id?: string
          verification_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_certifications_certification_id_fkey"
            columns: ["certification_id"]
            isOneToOne: false
            referencedRelation: "micro_certifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_certifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          organization_id: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id?: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_endpoints: {
        Row: {
          created_at: string
          events: string[] | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          secret_hash: string | null
          url: string
        }
        Insert: {
          created_at?: string
          events?: string[] | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          secret_hash?: string | null
          url: string
        }
        Update: {
          created_at?: string
          events?: string[] | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          secret_hash?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_endpoints_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      will_cases: {
        Row: {
          assets: Json | null
          beneficiaries: Json | null
          created_at: string | null
          document_url: string | null
          family_tree: Json | null
          id: string
          multi_state_compliance: Json | null
          organization_id: string | null
          status: string | null
          tax_implications: Json | null
          testator_name: string
          testator_state: string | null
          trust_type: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assets?: Json | null
          beneficiaries?: Json | null
          created_at?: string | null
          document_url?: string | null
          family_tree?: Json | null
          id?: string
          multi_state_compliance?: Json | null
          organization_id?: string | null
          status?: string | null
          tax_implications?: Json | null
          testator_name: string
          testator_state?: string | null
          trust_type?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assets?: Json | null
          beneficiaries?: Json | null
          created_at?: string | null
          document_url?: string | null
          family_tree?: Json | null
          id?: string
          multi_state_compliance?: Json | null
          organization_id?: string | null
          status?: string | null
          tax_implications?: Json | null
          testator_name?: string
          testator_state?: string | null
          trust_type?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "will_cases_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      will_clause_library: {
        Row: {
          category: string
          clause_name: string
          clause_text: string
          created_at: string | null
          id: string
          is_public: boolean | null
          organization_id: string | null
          state_specific: string[] | null
          usage_count: number | null
        }
        Insert: {
          category: string
          clause_name: string
          clause_text: string
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          organization_id?: string | null
          state_specific?: string[] | null
          usage_count?: number | null
        }
        Update: {
          category?: string
          clause_name?: string
          clause_text?: string
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          organization_id?: string | null
          state_specific?: string[] | null
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "will_clause_library_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _org_id?: string
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_org_member: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "owner"
        | "admin"
        | "manager"
        | "lawyer"
        | "paralegal"
        | "employee"
        | "client"
      appointment_status:
        | "scheduled"
        | "confirmed"
        | "completed"
        | "cancelled"
        | "no_show"
      case_status: "intake" | "active" | "pending" | "closed" | "archived"
      message_type: "internal" | "client" | "case_related"
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
    Enums: {
      app_role: [
        "owner",
        "admin",
        "manager",
        "lawyer",
        "paralegal",
        "employee",
        "client",
      ],
      appointment_status: [
        "scheduled",
        "confirmed",
        "completed",
        "cancelled",
        "no_show",
      ],
      case_status: ["intake", "active", "pending", "closed", "archived"],
      message_type: ["internal", "client", "case_related"],
    },
  },
} as const
