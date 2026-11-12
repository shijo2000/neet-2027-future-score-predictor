export interface PredictionInputs {
  name: string;
  phone?: string;
  state: string;
  mockScoreRange: string; // e.g., "below-300", "300-399", "400-479", "480-549", "550-619", "620-720"
  dailyStudyHours: number; // e.g. 2 to 14
  prepLevel: string; // "class11-beginner" | "class11-advance" | "class12-starter" | "class12-in-depth" | "dropper-repeater"
  syllabusCompletion: number; // 0 to 100 percentage
  monthsRemaining: number; // typically 10 to 24 months for NEET 2027
  targetDreamCollege?: string;
  keyWeakSubject?: 'physics' | 'chemistry' | 'botany' | 'zoology' | 'none';
}

export interface ScoreBreakdown {
  physics: number; // max 180
  chemistry: number; // max 180
  botany: number; // max 180
  zoology: number; // max 180
  biologyTotal: number; // max 360
}

export interface PredictionResult {
  studentName: string;
  studentPhone?: string;
  state: string;
  estimatedScore: number; // Max 720
  scoreBandMin: number;
  scoreBandMax: number;
  estimatedPercentile: number;
  collegeTier: {
    tierName: string;
    description: string;
    badgeColor: string;
    exampleColleges: string[];
    isGmcLikely: boolean;
  };
  breakdown: ScoreBreakdown;
  motivatingQuote: string;
  studyTips: string[];
  formulaBreakdown: {
    baseMockMidpoint: number;
    studyHourBoost: number;
    syllabusFactor: number;
    timelineMultiplier: number;
    prepStageBonus: number;
    rawTotal: number;
    cappedScore: number;
  };
}

export type AdmissionPreference = 'India' | 'Abroad' | 'Both' | 'Undecided';

export type ContactStatus = 'New' | 'Contacted' | 'Interested' | 'Converted' | 'Not Interested';

export type LeadSource = 'Score Predictor' | 'MBBS Guidance';

export interface Lead {
  id: string;
  name: string;
  phone: string;
  state: string;
  admission_preference: AdmissionPreference;
  estimated_score: number;
  consent_version: string;
  consent_timestamp: string;
  contact_status: ContactStatus;
  created_at: string;
  lead_source?: LeadSource;
  is_minor?: boolean;
  parent_guardian_name?: string;
  notes?: string;
}

export interface AggregateStats {
  totalPredictions: number;
  totalConsentedLeads: number;
  todayLeads: number;
  conversionRate: number;
  averageEstimatedScore: number;
  leadsByState: Record<string, number>;
  leadsByPreference: Record<AdmissionPreference, number>;
  leadsByStatus: Record<ContactStatus, number>;
  leadsBySource?: {
    scorePredictor: number;
    mbbsGuidance: number;
  };
}
