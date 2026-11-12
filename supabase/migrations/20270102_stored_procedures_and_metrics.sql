-- NEET 2027 Future Score Predictor
-- Migration: 20270102_stored_procedures_and_metrics.sql
-- Adds Database Functions, Stored Procedures, Metrics Aggregator, and Anti-Abuse Triggers

-- ==============================================================================
-- 1. ADD UPDATED_AT COLUMN & TRIGGER TO LEADS
-- ==============================================================================
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now());

CREATE OR REPLACE FUNCTION public.handle_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_leads_updated_at ON public.leads;
CREATE TRIGGER trg_leads_updated_at
    BEFORE UPDATE ON public.leads
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_leads_updated_at();

-- ==============================================================================
-- 2. SECURE STORED PROCEDURE: submit_opt_in_lead
-- Validates, sanitizes Indian phone number, checks score bounds, prevents spam
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.submit_opt_in_lead(
    p_name TEXT,
    p_phone TEXT,
    p_state TEXT,
    p_admission_preference TEXT,
    p_estimated_score INTEGER,
    p_is_minor BOOLEAN DEFAULT false,
    p_parent_guardian_name TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_clean_phone TEXT;
    v_clean_name TEXT;
    v_new_lead_id UUID;
    v_recent_submissions INTEGER;
BEGIN
    -- 1. Sanitize Inputs
    v_clean_name := trim(p_name);
    -- Keep only digits from phone
    v_clean_phone := regexp_replace(p_phone, '[^0-9]', '', 'g');
    -- Take last 10 digits for Indian standard mobile format
    IF char_length(v_clean_phone) > 10 THEN
        v_clean_phone := right(v_clean_phone, 10);
    END IF;

    -- 2. Validation Checks
    IF char_length(v_clean_name) < 2 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Name must be at least 2 characters.');
    END IF;

    IF char_length(v_clean_phone) != 10 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Please provide a valid 10-digit mobile number.');
    END IF;

    IF p_estimated_score < 0 OR p_estimated_score > 720 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Score must be between 0 and 720.');
    END IF;

    IF p_admission_preference NOT IN ('India', 'Abroad', 'Both', 'Undecided') THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid admission preference.');
    END IF;

    IF p_is_minor AND (p_parent_guardian_name IS NULL OR char_length(trim(p_parent_guardian_name)) < 2) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Parent or guardian name is required for minor applicants.');
    END IF;

    -- 3. Rate Limiting: Prevent duplicate submission flood (max 3 leads per phone within 15 minutes)
    SELECT count(*) INTO v_recent_submissions
    FROM public.leads
    WHERE phone = v_clean_phone
      AND created_at >= (timezone('utc'::text, now()) - INTERVAL '15 minutes');

    IF v_recent_submissions >= 3 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Too many requests for this phone number. Please wait a few minutes.');
    END IF;

    -- 4. Insert Validated Lead
    INSERT INTO public.leads (
        name,
        phone,
        state,
        admission_preference,
        estimated_score,
        is_minor,
        parent_guardian_name,
        consent_version,
        consent_timestamp,
        contact_status
    ) VALUES (
        v_clean_name,
        v_clean_phone,
        trim(p_state),
        p_admission_preference,
        p_estimated_score,
        COALESCE(p_is_minor, false),
        trim(p_parent_guardian_name),
        'v1.0-2027',
        timezone('utc'::text, now()),
        'New'
    )
    RETURNING id INTO v_new_lead_id;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Guidance request registered successfully.',
        'lead_id', v_new_lead_id
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Grant execution to public anon and authenticated users
GRANT EXECUTE ON FUNCTION public.submit_opt_in_lead(TEXT, TEXT, TEXT, TEXT, INTEGER, BOOLEAN, TEXT) TO anon, authenticated;

-- ==============================================================================
-- 3. SECURE STORED PROCEDURE: record_anonymous_prediction_event
-- Logs anonymous prediction activity with no PII
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.record_anonymous_prediction_event(
    p_state TEXT,
    p_score_bracket TEXT,
    p_mock_range TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.prediction_events (
        state,
        score_bracket,
        mock_range,
        created_at
    ) VALUES (
        COALESCE(trim(p_state), 'Unknown'),
        COALESCE(trim(p_score_bracket), 'Unknown'),
        COALESCE(trim(p_mock_range), 'Unknown'),
        timezone('utc'::text, now())
    );

    RETURN jsonb_build_object('success', true);
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_anonymous_prediction_event(TEXT, TEXT, TEXT) TO anon, authenticated;

-- ==============================================================================
-- 4. SECURE STORED PROCEDURE: request_lead_deletion
-- DPDP Act 2023 Compliance: Logs deletion request and purges matching leads
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.request_lead_deletion(
    p_phone TEXT,
    p_reason TEXT DEFAULT 'User requested deletion via web portal'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_clean_phone TEXT;
    v_deleted_count INTEGER;
BEGIN
    v_clean_phone := regexp_replace(p_phone, '[^0-9]', '', 'g');
    IF char_length(v_clean_phone) > 10 THEN
        v_clean_phone := right(v_clean_phone, 10);
    END IF;

    IF char_length(v_clean_phone) != 10 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid 10-digit mobile number.');
    END IF;

    -- Record the audit request
    INSERT INTO public.deletion_requests (
        phone,
        reason,
        status,
        created_at
    ) VALUES (
        v_clean_phone,
        COALESCE(p_reason, 'User self-serve request'),
        'Processed',
        timezone('utc'::text, now())
    );

    -- Delete all matching records permanently
    DELETE FROM public.leads WHERE phone = v_clean_phone;
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Your data has been permanently purged in accordance with the DPDP Act 2023.',
        'deleted_records', v_deleted_count
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.request_lead_deletion(TEXT, TEXT) TO anon, authenticated;

-- ==============================================================================
-- 5. SECURE ADMIN STORED PROCEDURE: get_admin_dashboard_metrics
-- Computes real-time KPIs entirely on the Postgres server
-- Protected: Only authorized admins can invoke this
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_metrics()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_is_admin BOOLEAN;
    v_total_predictions BIGINT;
    v_total_leads BIGINT;
    v_today_leads BIGINT;
    v_avg_score NUMERIC;
    v_conversion_rate NUMERIC;
    v_status_json JSONB;
    v_pref_json JSONB;
    v_state_json JSONB;
BEGIN
    -- Verify admin authorization
    SELECT EXISTS (
        SELECT 1 FROM public.admin_users WHERE id = auth.uid()
    ) INTO v_is_admin;

    IF NOT v_is_admin THEN
        RAISE EXCEPTION 'Access Denied: Only authenticated administrators can access metrics.';
    END IF;

    -- Predictions count (base seed 14,280 + live events)
    SELECT (14280 + count(*)) INTO v_total_predictions FROM public.prediction_events;

    -- Total leads
    SELECT count(*), COALESCE(round(avg(estimated_score)), 0)
    INTO v_total_leads, v_avg_score
    FROM public.leads;

    -- Today's leads
    SELECT count(*) INTO v_today_leads
    FROM public.leads
    WHERE created_at >= (date_trunc('day', timezone('utc'::text, now())));

    -- Conversion rate
    IF v_total_predictions > 0 THEN
        v_conversion_rate := round(((v_total_leads::NUMERIC / v_total_predictions::NUMERIC) * 100), 2);
    ELSE
        v_conversion_rate := 0.00;
    END IF;

    -- Status Breakdown
    SELECT jsonb_object_agg(status_name, cnt) INTO v_status_json
    FROM (
        SELECT s.status_name, count(l.id) AS cnt
        FROM (VALUES ('New'), ('Contacted'), ('Interested'), ('Converted'), ('Not Interested')) AS s(status_name)
        LEFT JOIN public.leads l ON l.contact_status = s.status_name
        GROUP BY s.status_name
    ) t;

    -- Preference Breakdown
    SELECT jsonb_object_agg(pref_name, cnt) INTO v_pref_json
    FROM (
        SELECT p.pref_name, count(l.id) AS cnt
        FROM (VALUES ('India'), ('Abroad'), ('Both'), ('Undecided')) AS p(pref_name)
        LEFT JOIN public.leads l ON l.admission_preference = p.pref_name
        GROUP BY p.pref_name
    ) t;

    -- State Breakdown (Top 15 states)
    SELECT jsonb_object_agg(state, cnt) INTO v_state_json
    FROM (
        SELECT state, count(*) as cnt
        FROM public.leads
        GROUP BY state
        ORDER BY count(*) DESC
        LIMIT 15
    ) t;

    RETURN jsonb_build_object(
        'total_predictions', v_total_predictions,
        'total_consented_leads', v_total_leads,
        'today_leads', v_today_leads,
        'conversion_rate', v_conversion_rate,
        'average_estimated_score', v_avg_score,
        'leads_by_status', COALESCE(v_status_json, '{}'::jsonb),
        'leads_by_preference', COALESCE(v_pref_json, '{}'::jsonb),
        'leads_by_state', COALESCE(v_state_json, '{}'::jsonb)
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_dashboard_metrics() TO authenticated;
