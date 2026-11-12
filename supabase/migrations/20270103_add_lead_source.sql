-- NEET 2027 Future Score Predictor
-- Migration: 20270103_add_lead_source.sql
-- Adds lead_source column to distinguish 'Score Predictor' leads from 'MBBS Guidance' leads

-- 1. Add lead_source column with default
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS lead_source TEXT NOT NULL DEFAULT 'Score Predictor'
CHECK (lead_source IN ('Score Predictor', 'MBBS Guidance'));

CREATE INDEX IF NOT EXISTS idx_leads_source ON public.leads (lead_source);

-- 2. Update submit_opt_in_lead stored procedure with p_lead_source parameter
CREATE OR REPLACE FUNCTION public.submit_opt_in_lead(
    p_name TEXT,
    p_phone TEXT,
    p_state TEXT,
    p_admission_preference TEXT,
    p_estimated_score INTEGER,
    p_is_minor BOOLEAN DEFAULT false,
    p_parent_guardian_name TEXT DEFAULT NULL,
    p_lead_source TEXT DEFAULT 'Score Predictor'
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
    v_valid_source TEXT;
BEGIN
    -- 1. Sanitize Inputs
    v_clean_name := trim(p_name);
    v_clean_phone := regexp_replace(p_phone, '[^0-9]', '', 'g');
    IF char_length(v_clean_phone) > 10 THEN
        v_clean_phone := right(v_clean_phone, 10);
    END IF;

    v_valid_source := CASE 
        WHEN p_lead_source = 'MBBS Guidance' THEN 'MBBS Guidance'
        ELSE 'Score Predictor'
    END;

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

    -- 3. Rate Limiting: Prevent duplicate submission flood (max 5 leads per phone within 15 minutes)
    SELECT count(*) INTO v_recent_submissions
    FROM public.leads
    WHERE phone = v_clean_phone
      AND created_at >= (timezone('utc'::text, now()) - INTERVAL '15 minutes');

    IF v_recent_submissions >= 5 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Too many requests for this phone number. Please wait a few minutes.');
    END IF;

    -- 4. Insert Validated Lead with Source Tag
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
        contact_status,
        lead_source
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
        'New',
        v_valid_source
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

GRANT EXECUTE ON FUNCTION public.submit_opt_in_lead(TEXT, TEXT, TEXT, TEXT, INTEGER, BOOLEAN, TEXT, TEXT) TO anon, authenticated;
