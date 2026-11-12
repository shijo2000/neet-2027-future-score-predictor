-- Drop the 7-argument submit_opt_in_lead left behind by 20270102.
-- CREATE OR REPLACE in 20270103 added an 8-argument overload instead of
-- replacing the old function, which makes PostgREST reject the client call.

DROP FUNCTION IF EXISTS public.submit_opt_in_lead(TEXT, TEXT, TEXT, TEXT, INTEGER, BOOLEAN, TEXT);

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
    v_source_json JSONB;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM public.admin_users WHERE id = auth.uid()
    ) INTO v_is_admin;

    IF NOT v_is_admin THEN
        RAISE EXCEPTION 'Access Denied: Only authenticated administrators can access metrics.';
    END IF;

    SELECT (14280 + count(*)) INTO v_total_predictions FROM public.prediction_events;

    SELECT count(*), COALESCE(round(avg(estimated_score)), 0)
    INTO v_total_leads, v_avg_score
    FROM public.leads;

    SELECT count(*) INTO v_today_leads
    FROM public.leads
    WHERE created_at >= (date_trunc('day', timezone('utc'::text, now())));

    IF v_total_predictions > 0 THEN
        v_conversion_rate := round(((v_total_leads::NUMERIC / v_total_predictions::NUMERIC) * 100), 2);
    ELSE
        v_conversion_rate := 0.00;
    END IF;

    SELECT jsonb_object_agg(status_name, cnt) INTO v_status_json
    FROM (
        SELECT s.status_name, count(l.id) AS cnt
        FROM (VALUES ('New'), ('Contacted'), ('Interested'), ('Converted'), ('Not Interested')) AS s(status_name)
        LEFT JOIN public.leads l ON l.contact_status = s.status_name
        GROUP BY s.status_name
    ) t;

    SELECT jsonb_object_agg(pref_name, cnt) INTO v_pref_json
    FROM (
        SELECT p.pref_name, count(l.id) AS cnt
        FROM (VALUES ('India'), ('Abroad'), ('Both'), ('Undecided')) AS p(pref_name)
        LEFT JOIN public.leads l ON l.admission_preference = p.pref_name
        GROUP BY p.pref_name
    ) t;

    SELECT jsonb_object_agg(state, cnt) INTO v_state_json
    FROM (
        SELECT state, count(*) as cnt
        FROM public.leads
        GROUP BY state
        ORDER BY count(*) DESC
        LIMIT 15
    ) t;

    SELECT jsonb_build_object(
        'Score Predictor', count(*) FILTER (WHERE lead_source = 'Score Predictor'),
        'MBBS Guidance', count(*) FILTER (WHERE lead_source = 'MBBS Guidance')
    ) INTO v_source_json
    FROM public.leads;

    RETURN jsonb_build_object(
        'total_predictions', v_total_predictions,
        'total_consented_leads', v_total_leads,
        'today_leads', v_today_leads,
        'conversion_rate', v_conversion_rate,
        'average_estimated_score', v_avg_score,
        'leads_by_status', COALESCE(v_status_json, '{}'::jsonb),
        'leads_by_preference', COALESCE(v_pref_json, '{}'::jsonb),
        'leads_by_state', COALESCE(v_state_json, '{}'::jsonb),
        'leads_by_source', COALESCE(v_source_json, '{}'::jsonb)
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_dashboard_metrics() TO authenticated;

NOTIFY pgrst, 'reload schema';
