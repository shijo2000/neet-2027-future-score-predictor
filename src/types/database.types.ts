export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      leads: {
        Row: {
          id: string;
          name: string;
          phone: string;
          state: string;
          admission_preference: 'India' | 'Abroad' | 'Both' | 'Undecided';
          estimated_score: number;
          consent_version: string;
          consent_timestamp: string;
          contact_status: 'New' | 'Contacted' | 'Interested' | 'Converted' | 'Not Interested';
          is_minor: boolean;
          parent_guardian_name: string | null;
          notes: string | null;
          lead_source: 'Score Predictor' | 'MBBS Guidance';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          phone: string;
          state: string;
          admission_preference: 'India' | 'Abroad' | 'Both' | 'Undecided';
          estimated_score: number;
          consent_version?: string;
          consent_timestamp?: string;
          contact_status?: 'New' | 'Contacted' | 'Interested' | 'Converted' | 'Not Interested';
          is_minor?: boolean;
          parent_guardian_name?: string | null;
          notes?: string | null;
          lead_source?: 'Score Predictor' | 'MBBS Guidance';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string;
          state?: string;
          admission_preference?: 'India' | 'Abroad' | 'Both' | 'Undecided';
          estimated_score?: number;
          consent_version?: string;
          consent_timestamp?: string;
          contact_status?: 'New' | 'Contacted' | 'Interested' | 'Converted' | 'Not Interested';
          is_minor?: boolean;
          parent_guardian_name?: string | null;
          notes?: string | null;
          lead_source?: 'Score Predictor' | 'MBBS Guidance';
          created_at?: string;
          updated_at?: string;
        };
      };
      prediction_events: {
        Row: {
          id: string;
          state: string;
          score_bracket: string;
          mock_range: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          state: string;
          score_bracket: string;
          mock_range: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          state?: string;
          score_bracket?: string;
          mock_range?: string;
          created_at?: string;
        };
      };
      deletion_requests: {
        Row: {
          id: string;
          phone: string;
          reason: string | null;
          status: 'Pending' | 'Processed' | 'Rejected';
          created_at: string;
        };
        Insert: {
          id?: string;
          phone: string;
          reason?: string | null;
          status?: 'Pending' | 'Processed' | 'Rejected';
          created_at?: string;
        };
        Update: {
          id?: string;
          phone?: string;
          reason?: string | null;
          status?: 'Pending' | 'Processed' | 'Rejected';
          created_at?: string;
        };
      };
      admin_users: {
        Row: {
          id: string;
          email: string;
          role: 'admin' | 'super_admin';
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role?: 'admin' | 'super_admin';
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: 'admin' | 'super_admin';
          created_at?: string;
        };
      };
    };
    Functions: {
      submit_opt_in_lead: {
        Args: {
          p_name: string;
          p_phone: string;
          p_state: string;
          p_admission_preference: string;
          p_estimated_score: number;
          p_is_minor?: boolean;
          p_parent_guardian_name?: string | null;
          p_lead_source?: string;
        };
        Returns: Json;
      };
      get_admin_dashboard_metrics: {
        Args: Record<string, never>;
        Returns: Json;
      };
      request_lead_deletion: {
        Args: {
          p_phone: string;
          p_reason?: string | null;
        };
        Returns: Json;
      };
      record_anonymous_prediction_event: {
        Args: {
          p_state: string;
          p_score_bracket: string;
          p_mock_range: string;
        };
        Returns: Json;
      };
    };
  };
}
