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
      profiles: {
        Row: {
          id: string
          full_name: string | null
          email: string
          headline: string | null
          professional_summary: string | null
          phone: string | null
          location: string | null
          website: string | null
          linkedin_url: string | null
          github_url: string | null
          other_links: Json
          onboarding_completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          email: string
          headline?: string | null
          professional_summary?: string | null
          phone?: string | null
          location?: string | null
          website?: string | null
          linkedin_url?: string | null
          github_url?: string | null
          other_links?: Json
          onboarding_completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          email?: string
          headline?: string | null
          professional_summary?: string | null
          phone?: string | null
          location?: string | null
          website?: string | null
          linkedin_url?: string | null
          github_url?: string | null
          other_links?: Json
          onboarding_completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      resumes: {
        Row: {
          id: string
          user_id: string
          file_name: string
          storage_path: string
          file_size: number
          mime_type: string
          parse_status: "pending" | "processing" | "completed" | "failed"
          parse_error: string | null
          is_primary: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          file_name: string
          storage_path: string
          file_size?: number
          mime_type: string
          parse_status?: Database["public"]["Enums"]["resume_parse_status"]
          parse_error?: string | null
          is_primary?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          file_name?: string
          storage_path?: string
          file_size?: number
          mime_type?: string
          parse_status?: Database["public"]["Enums"]["resume_parse_status"]
          parse_error?: string | null
          is_primary?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      work_experiences: {
        Row: {
          id: string
          user_id: string
          company: string
          job_title: string
          location: string | null
          start_date: string | null
          end_date: string | null
          is_current: boolean
          responsibilities: string[]
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company: string
          job_title: string
          location?: string | null
          start_date?: string | null
          end_date?: string | null
          is_current?: boolean
          responsibilities?: string[]
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company?: string
          job_title?: string
          location?: string | null
          start_date?: string | null
          end_date?: string | null
          is_current?: boolean
          responsibilities?: string[]
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      education_entries: {
        Row: {
          id: string
          user_id: string
          institution: string
          degree: string | null
          field_of_study: string | null
          start_date: string | null
          end_date: string | null
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          institution: string
          degree?: string | null
          field_of_study?: string | null
          start_date?: string | null
          end_date?: string | null
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          institution?: string
          degree?: string | null
          field_of_study?: string | null
          start_date?: string | null
          end_date?: string | null
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      skills: {
        Row: {
          id: string
          user_id: string
          name: string
          category: string | null
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          category?: string | null
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          category?: string | null
          display_order?: number
          created_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          url: string | null
          technologies: string[]
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          url?: string | null
          technologies?: string[]
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          url?: string | null
          technologies?: string[]
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      certifications: {
        Row: {
          id: string
          user_id: string
          name: string
          issuer: string | null
          issue_date: string | null
          url: string | null
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          issuer?: string | null
          issue_date?: string | null
          url?: string | null
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          issuer?: string | null
          issue_date?: string | null
          url?: string | null
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          id: string
          user_id: string
          platform: string
          title: string
          company: string
          company_logo: string | null
          location: string | null
          salary: string | null
          job_type: string | null
          experience_level: string | null
          description: string | null
          tags: Json
          match_score: number
          job_url: string
          source_url: string | null
          applied_status: boolean
          saved_status: boolean
          fetched_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          platform: string
          title: string
          company: string
          company_logo?: string | null
          location?: string | null
          salary?: string | null
          job_type?: string | null
          experience_level?: string | null
          description?: string | null
          tags?: Json
          match_score?: number
          job_url: string
          source_url?: string | null
          applied_status?: boolean
          saved_status?: boolean
          fetched_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          platform?: string
          title?: string
          company?: string
          company_logo?: string | null
          location?: string | null
          salary?: string | null
          job_type?: string | null
          experience_level?: string | null
          description?: string | null
          tags?: Json
          match_score?: number
          job_url?: string
          source_url?: string | null
          applied_status?: boolean
          saved_status?: boolean
          fetched_at?: string
          created_at?: string
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
      resume_parse_status: "pending" | "processing" | "completed" | "failed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type Resume = Database["public"]["Tables"]["resumes"]["Row"]
export type WorkExperience =
  Database["public"]["Tables"]["work_experiences"]["Row"]
export type EducationEntry =
  Database["public"]["Tables"]["education_entries"]["Row"]
export type Skill = Database["public"]["Tables"]["skills"]["Row"]
export type Project = Database["public"]["Tables"]["projects"]["Row"]
export type Certification =
  Database["public"]["Tables"]["certifications"]["Row"]
export type Job = Database["public"]["Tables"]["jobs"]["Row"]
export type JobInsert = Database["public"]["Tables"]["jobs"]["Insert"]

export type ProfileLink = {
  label: string
  url: string
}

export type ProfileData = {
  profile: Profile
  workExperiences: WorkExperience[]
  education: EducationEntry[]
  skills: Skill[]
  projects: Project[]
  certifications: Certification[]
}
