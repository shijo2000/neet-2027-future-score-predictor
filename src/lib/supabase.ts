import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Lead, AggregateStats, AdmissionPreference, ContactStatus } from '../types';
import { Json } from '../types/database.types';

// Read environment variables (Vite client env vars must start with VITE_)
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

const PLACEHOLDER_MARKERS = [
  'your-project-id',
  'your-anon-public-key',
  'your_supabase',
  'my_supabase_url',
  'my_supabase_key'
];

function isPlaceholderCredential(value: string): boolean {
  const lower = value.toLowerCase();
  return PLACEHOLDER_MARKERS.some((marker) => lower.includes(marker));
}

const isHostedUrl = supabaseUrl.startsWith('https://');
const isLocalUrl = /^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?/.test(supabaseUrl);

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  (isHostedUrl || isLocalUrl) &&
  !isPlaceholderCredential(supabaseUrl) &&
  !isPlaceholderCredential(supabaseAnonKey)
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const PREDICTION_BASELINE = 0;

type RpcResult = {
  success?: boolean;
  message?: string;
  error?: string;
  lead_id?: string;
};

function asRpcResult(data: Json | null): RpcResult | null {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  return data as RpcResult;
}

function isMissingFunction(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  const message = (error.message || '').toLowerCase();
  return error.code === 'PGRST202' || message.includes('could not find the function');
}

// ==============================================================================
// LOCAL STORAGE KEYS (Fallback store when Supabase env is pending)
// ==============================================================================
const LOCAL_LEADS_KEY = 'neet_2027_leads_store';
const LOCAL_PREDICTIONS_KEY = 'neet_2027_predictions_count';
const LOCAL_DELETIONS_KEY = 'neet_2027_deletions_store';
const LOCAL_ADMIN_AUTH_KEY = 'neet_2027_admin_session';

// ==============================================================================
// PUBLIC API: SUBMIT OPT-IN LEAD
// ==============================================================================
export async function submitOptInLead(leadData: {
  name: string;
  phone: string;
  state: string;
  admission_preference: AdmissionPreference;
  estimated_score: number;
  lead_source?: 'Score Predictor' | 'MBBS Guidance';
  is_minor?: boolean;
  parent_guardian_name?: string;
}): Promise<{ success: boolean; message: string; id?: string }> {
  // Validate Indian phone number (10 digits)
  const cleanPhone = leadData.phone.replace(/[^0-9]/g, '');
  if (cleanPhone.length < 10) {
    return { success: false, message: 'Please enter a valid 10-digit mobile number' };
  }

  const payload: Omit<Lead, 'id'> = {
    name: leadData.name.trim(),
    phone: cleanPhone.slice(-10),
    state: leadData.state,
    admission_preference: leadData.admission_preference,
    estimated_score: Math.min(720, Math.max(0, leadData.estimated_score)),
    consent_version: 'v1.0-2027',
    consent_timestamp: new Date().toISOString(),
    contact_status: 'New',
    created_at: new Date().toISOString(),
    lead_source: leadData.lead_source || 'Score Predictor',
    is_minor: Boolean(leadData.is_minor),
    parent_guardian_name: leadData.parent_guardian_name?.trim() || undefined
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('submit_opt_in_lead', {
        p_name: payload.name,
        p_phone: payload.phone,
        p_state: payload.state,
        p_admission_preference: payload.admission_preference,
        p_estimated_score: payload.estimated_score,
        p_is_minor: Boolean(payload.is_minor),
        p_parent_guardian_name: payload.parent_guardian_name || null,
        p_lead_source: payload.lead_source || 'Score Predictor'
      });

      const rpcResult = asRpcResult(rpcData);
      if (!rpcError && rpcResult) {
        if (rpcResult.success) {
          return {
            success: true,
            message: rpcResult.message || 'Guidance request submitted successfully!',
            id: rpcResult.lead_id
          };
        }
        if (rpcResult.error) {
          return { success: false, message: rpcResult.error };
        }
      }

      if (rpcError && !isMissingFunction(rpcError)) {
        return { success: false, message: rpcError.message || 'Failed to submit lead to database' };
      }

      const { data, error } = await supabase
        .from('leads')
        .insert({
          name: payload.name,
          phone: payload.phone,
          state: payload.state,
          admission_preference: payload.admission_preference,
          estimated_score: payload.estimated_score,
          consent_version: payload.consent_version,
          consent_timestamp: payload.consent_timestamp,
          contact_status: payload.contact_status,
          created_at: payload.created_at,
          lead_source: payload.lead_source || 'Score Predictor',
          is_minor: Boolean(payload.is_minor),
          parent_guardian_name: payload.parent_guardian_name || null
        })
        .select('id')
        .single();

      if (error) {
        return { success: false, message: error.message || 'Failed to submit lead to database' };
      }

      return { success: true, message: 'Guidance request submitted successfully!', id: data.id };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unable to reach the database';
      return { success: false, message };
    }
  }

  // Local fallback storage
  try {
    const existing: Lead[] = JSON.parse(localStorage.getItem(LOCAL_LEADS_KEY) || '[]');
    const newLead: Lead = {
      ...payload,
      id: 'lead-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7)
    };
    existing.unshift(newLead);
    localStorage.setItem(LOCAL_LEADS_KEY, JSON.stringify(existing));

    return {
      success: true,
      message: 'Guidance request received successfully! An expert counselor will contact you.',
      id: newLead.id
    };
  } catch (e: unknown) {
    return { success: false, message: 'Unable to save lead locally' };
  }
}

// ==============================================================================
// PUBLIC API: RECORD ANONYMOUS PREDICTION EVENT
// ==============================================================================
export async function recordAnonymousPrediction(data: {
  state: string;
  scoreBracket: string;
  mockRange: string;
}): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('record_anonymous_prediction_event', {
        p_state: data.state,
        p_score_bracket: data.scoreBracket,
        p_mock_range: data.mockRange
      });

      const rpcResult = asRpcResult(rpcData);
      if (!rpcError && rpcResult?.success !== false) return;

      if (rpcError && !isMissingFunction(rpcError)) {
        console.warn('Prediction event tracking error:', rpcError.message);
        return;
      }

      const { error } = await supabase.from('prediction_events').insert({
        state: data.state,
        score_bracket: data.scoreBracket,
        mock_range: data.mockRange
      });
      if (error) console.warn('Prediction event insert error:', error.message);
    } catch (err) {
      console.warn('Prediction event tracking error:', err);
    }
    return;
  }

  try {
    const current = parseInt(localStorage.getItem(LOCAL_PREDICTIONS_KEY) || String(PREDICTION_BASELINE), 10);
    localStorage.setItem(LOCAL_PREDICTIONS_KEY, (current + 1).toString());
  } catch {
    // Ignore storage errors
  }
}

// ==============================================================================
// PUBLIC API: SUBMIT DATA DELETION REQUEST (DPDP Act)
// ==============================================================================
export async function submitDataDeletionRequest(phone: string, reason?: string): Promise<{ success: boolean; message: string }> {
  const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);
  if (cleanPhone.length < 10) {
    return { success: false, message: 'Please provide a valid 10-digit mobile number' };
  }

  const deletionReason = reason || 'User requested via web portal';

  if (isSupabaseConfigured && supabase) {
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('request_lead_deletion', {
        p_phone: cleanPhone,
        p_reason: deletionReason
      });

      const rpcResult = asRpcResult(rpcData);
      if (!rpcError && rpcResult?.success) {
        return {
          success: true,
          message: rpcResult.message || `Your deletion request for ${cleanPhone} has been completed.`
        };
      }
      if (!rpcError && rpcResult?.error) {
        return { success: false, message: rpcResult.error };
      }
      if (rpcError && !isMissingFunction(rpcError)) {
        return { success: false, message: rpcError.message || 'Failed to process deletion request' };
      }

      const { error } = await supabase.from('deletion_requests').insert({
        phone: cleanPhone,
        reason: deletionReason,
        status: 'Pending'
      });
      if (error) {
        return { success: false, message: error.message || 'Failed to process deletion request' };
      }

      return {
        success: true,
        message: `Your deletion request for ${cleanPhone} has been logged. All associated data will be purged within 48 hours in accordance with the DPDP Act 2023.`
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to process deletion request';
      return { success: false, message };
    }
  }

  try {
    const leads: Lead[] = JSON.parse(localStorage.getItem(LOCAL_LEADS_KEY) || '[]');
    const filtered = leads.filter(l => l.phone !== cleanPhone);
    localStorage.setItem(LOCAL_LEADS_KEY, JSON.stringify(filtered));

    const deletionList = JSON.parse(localStorage.getItem(LOCAL_DELETIONS_KEY) || '[]');
    deletionList.push({
      phone: cleanPhone,
      reason,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem(LOCAL_DELETIONS_KEY, JSON.stringify(deletionList));

    return {
      success: true,
      message: `Your deletion request for ${cleanPhone} has been logged. All associated data will be purged within 48 hours in accordance with the DPDP Act 2023.`
    };
  } catch {
    return { success: false, message: 'Failed to process deletion request' };
  }
}

// ==============================================================================
// ADMIN API: FETCH LEADS & METRICS
// ==============================================================================
export async function fetchAdminLeads(): Promise<Lead[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message || 'Failed to load leads from Supabase');
    }

    return (data || []).map((row) => ({
      id: row.id,
      name: row.name,
      phone: row.phone,
      state: row.state,
      admission_preference: row.admission_preference,
      estimated_score: row.estimated_score,
      consent_version: row.consent_version,
      consent_timestamp: row.consent_timestamp,
      contact_status: row.contact_status,
      created_at: row.created_at,
      lead_source: row.lead_source,
      is_minor: row.is_minor,
      parent_guardian_name: row.parent_guardian_name ?? undefined,
      notes: row.notes ?? undefined
    }));
  }

  try {
    return JSON.parse(localStorage.getItem(LOCAL_LEADS_KEY) || '[]');
  } catch {
    return [];
  }
}

export async function updateLeadStatus(id: string, status: ContactStatus, notes?: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('leads')
      .update({ contact_status: status, ...(notes !== undefined ? { notes } : {}) })
      .eq('id', id)
      .select('id');

    return !error && Boolean(data?.length);
  }

  try {
    const leads: Lead[] = JSON.parse(localStorage.getItem(LOCAL_LEADS_KEY) || '[]');
    const idx = leads.findIndex(l => l.id === id);
    if (idx !== -1) {
      leads[idx].contact_status = status;
      if (notes !== undefined) leads[idx].notes = notes;
      localStorage.setItem(LOCAL_LEADS_KEY, JSON.stringify(leads));
      return true;
    }
  } catch (e) {
    console.error(e);
  }
  return false;
}

export async function deleteLead(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id)
      .select('id');

    return !error && Boolean(data?.length);
  }

  try {
    const leads: Lead[] = JSON.parse(localStorage.getItem(LOCAL_LEADS_KEY) || '[]');
    const filtered = leads.filter(l => l.id !== id);
    localStorage.setItem(LOCAL_LEADS_KEY, JSON.stringify(filtered));
    return true;
  } catch {
    return false;
  }
}

function asObject(data: Json | null): Record<string, Json | undefined> | null {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  return data;
}

function asNumber(value: Json | undefined, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))) return Number(value);
  return fallback;
}

function asCountRecord(value: Json | undefined): Record<string, number> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const counts: Record<string, number> = {};
  for (const [key, entry] of Object.entries(value)) {
    counts[key] = asNumber(entry);
  }
  return counts;
}

function summarizeLeads(leads: Lead[], totalPredictions: number): AggregateStats {
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayLeads = leads.filter(l => l.created_at.startsWith(todayStr)).length;

  const leadsByState: Record<string, number> = {};
  const leadsByPreference: Record<AdmissionPreference, number> = {
    India: 0,
    Abroad: 0,
    Both: 0,
    Undecided: 0
  };
  const leadsByStatus: Record<ContactStatus, number> = {
    New: 0,
    Contacted: 0,
    Interested: 0,
    Converted: 0,
    'Not Interested': 0
  };

  let totalScoreSum = 0;
  let scorePredictorCount = 0;
  let mbbsGuidanceCount = 0;

  for (const lead of leads) {
    leadsByState[lead.state] = (leadsByState[lead.state] || 0) + 1;
    if (lead.admission_preference in leadsByPreference) {
      leadsByPreference[lead.admission_preference]++;
    }
    if (lead.contact_status in leadsByStatus) {
      leadsByStatus[lead.contact_status]++;
    }
    if (lead.lead_source === 'MBBS Guidance') {
      mbbsGuidanceCount++;
    } else {
      scorePredictorCount++;
    }
    totalScoreSum += lead.estimated_score;
  }

  const totalConsentedLeads = leads.length;
  const conversionRate = totalPredictions > 0
    ? Number(((totalConsentedLeads / totalPredictions) * 100).toFixed(1))
    : 0;
  const averageEstimatedScore = totalConsentedLeads > 0
    ? Math.round(totalScoreSum / totalConsentedLeads)
    : 0;

  return {
    totalPredictions,
    totalConsentedLeads,
    todayLeads,
    conversionRate,
    averageEstimatedScore,
    leadsByState,
    leadsByPreference,
    leadsByStatus,
    leadsBySource: {
      scorePredictor: scorePredictorCount,
      mbbsGuidance: mbbsGuidanceCount
    }
  };
}

export async function fetchPublicPredictionCount(): Promise<number> {
  if (isSupabaseConfigured && supabase) {
    const { count, error } = await supabase
      .from('prediction_events')
      .select('*', { count: 'exact', head: true });

    if (error || count == null) return PREDICTION_BASELINE;
    return PREDICTION_BASELINE + count;
  }

  try {
    const stored = parseInt(localStorage.getItem(LOCAL_PREDICTIONS_KEY) || String(PREDICTION_BASELINE), 10);
    return Number.isFinite(stored) ? stored : PREDICTION_BASELINE;
  } catch {
    return PREDICTION_BASELINE;
  }
}

export async function getAggregateStats(): Promise<AggregateStats> {
  if (isSupabaseConfigured && supabase) {
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_admin_dashboard_metrics');
    const metrics = asObject(rpcData);

    if (!rpcError && metrics) {
      const statusCounts = asCountRecord(metrics.leads_by_status);
      const preferenceCounts = asCountRecord(metrics.leads_by_preference);
      const sourceCounts = asCountRecord(metrics.leads_by_source);

      return {
        totalPredictions: asNumber(metrics.total_predictions, PREDICTION_BASELINE),
        totalConsentedLeads: asNumber(metrics.total_consented_leads),
        todayLeads: asNumber(metrics.today_leads),
        conversionRate: asNumber(metrics.conversion_rate),
        averageEstimatedScore: asNumber(metrics.average_estimated_score),
        leadsByState: asCountRecord(metrics.leads_by_state),
        leadsByPreference: {
          India: preferenceCounts.India || 0,
          Abroad: preferenceCounts.Abroad || 0,
          Both: preferenceCounts.Both || 0,
          Undecided: preferenceCounts.Undecided || 0
        },
        leadsByStatus: {
          New: statusCounts.New || 0,
          Contacted: statusCounts.Contacted || 0,
          Interested: statusCounts.Interested || 0,
          Converted: statusCounts.Converted || 0,
          'Not Interested': statusCounts['Not Interested'] || 0
        },
        leadsBySource: {
          scorePredictor: sourceCounts['Score Predictor'] || 0,
          mbbsGuidance: sourceCounts['MBBS Guidance'] || 0
        }
      };
    }

    const leads = await fetchAdminLeads();
    const { count } = await supabase
      .from('prediction_events')
      .select('*', { count: 'exact', head: true });
    return summarizeLeads(leads, PREDICTION_BASELINE + (count || 0));
  }

  const leads = await fetchAdminLeads();
  let totalPredictions = PREDICTION_BASELINE;
  try {
    const stored = parseInt(localStorage.getItem(LOCAL_PREDICTIONS_KEY) || String(PREDICTION_BASELINE), 10);
    totalPredictions = Math.max(totalPredictions, stored);
  } catch {
    // Keep baseline
  }
  return summarizeLeads(leads, totalPredictions);
}

async function currentUserIsAdmin(userId: string): Promise<boolean> {
  if (!supabase) return false;
  const { data, error } = await supabase
    .from('admin_users')
    .select('id')
    .eq('id', userId)
    .maybeSingle();
  return !error && Boolean(data);
}

export async function checkAdminSession(): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { data } = await supabase.auth.getSession();
    const userId = data.session?.user?.id;
    if (!userId) return false;
    return currentUserIsAdmin(userId);
  }
  return localStorage.getItem(LOCAL_ADMIN_AUTH_KEY) === 'true';
}

export async function adminSignIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });
    if (error) return { success: false, error: error.message };

    const userId = data.user?.id;
    if (!userId || !(await currentUserIsAdmin(userId))) {
      await supabase.auth.signOut();
      return { success: false, error: 'This account is not authorized to access the admissions desk.' };
    }
    return { success: true };
  }

  return {
    success: false,
    error: 'The admissions desk is unavailable until Supabase is configured.'
  };
}

export async function adminSignOut(): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    await supabase.auth.signOut();
  }
  localStorage.removeItem(LOCAL_ADMIN_AUTH_KEY);
}
