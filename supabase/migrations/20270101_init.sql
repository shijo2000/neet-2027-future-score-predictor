-- NEET 2027 Future Score Predictor - Supabase Production Schema
-- Migration: 20270101_init.sql

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. ADMIN USERS TABLE (Explicit authorization for RLS)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view their own record"
    ON public.admin_users
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- ==============================================================================
-- 2. LEADS TABLE (Opt-in Admission Guidance Leads)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL CHECK (char_length(trim(name)) >= 2 AND char_length(name) <= 100),
    phone TEXT NOT NULL CHECK (char_length(trim(phone)) >= 10 AND char_length(phone) <= 15),
    state TEXT NOT NULL CHECK (char_length(trim(state)) >= 2 AND char_length(state) <= 80),
    admission_preference TEXT NOT NULL CHECK (admission_preference IN ('India', 'Abroad', 'Both', 'Undecided')),
    estimated_score INTEGER NOT NULL CHECK (estimated_score >= 0 AND estimated_score <= 720),
    consent_version TEXT NOT NULL DEFAULT 'v1.0-2027',
    consent_timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    contact_status TEXT NOT NULL DEFAULT 'New' CHECK (contact_status IN ('New', 'Contacted', 'Interested', 'Converted', 'Not Interested')),
    is_minor BOOLEAN NOT NULL DEFAULT false,
    parent_guardian_name TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for performance & dashboard queries
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_state ON public.leads (state);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads (contact_status);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON public.leads (phone);

-- Enable Row Level Security
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Security Rule 1: Public (anon) users can ONLY INSERT validated leads.
-- Public users CANNOT read, update, or delete any leads.
CREATE POLICY "Public users can insert validated opt-in leads only"
    ON public.leads
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (
        char_length(trim(name)) >= 2
        AND char_length(trim(phone)) >= 10
        AND estimated_score >= 0
        AND estimated_score <= 720
        AND admission_preference IN ('India', 'Abroad', 'Both', 'Undecided')
    );

-- Security Rule 2: Authorized admins can SELECT all leads
CREATE POLICY "Authorized admins can read all leads"
    ON public.leads
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE public.admin_users.id = auth.uid()
        )
    );

-- Security Rule 3: Authorized admins can UPDATE contact status and notes
CREATE POLICY "Authorized admins can update leads status"
    ON public.leads
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE public.admin_users.id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE public.admin_users.id = auth.uid()
        )
    );

-- Security Rule 4: Authorized admins can DELETE leads (e.g., upon user deletion request)
CREATE POLICY "Authorized admins can delete leads"
    ON public.leads
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE public.admin_users.id = auth.uid()
        )
    );

-- ==============================================================================
-- 3. ANONYMOUS PREDICTION METRICS (No PII, zero tracking, aggregate counts only)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.prediction_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    state TEXT NOT NULL,
    score_bracket TEXT NOT NULL,
    mock_range TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_prediction_events_created ON public.prediction_events (created_at DESC);

ALTER TABLE public.prediction_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can log anonymous prediction events"
    ON public.prediction_events
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Public can read aggregate prediction count"
    ON public.prediction_events
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- ==============================================================================
-- 4. DATA DELETION REQUESTS TABLE (DPDP Act Compliance)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.deletion_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone TEXT NOT NULL,
    reason TEXT,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Processed', 'Rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.deletion_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can submit deletion requests"
    ON public.deletion_requests
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (char_length(trim(phone)) >= 10);

CREATE POLICY "Admins can view deletion requests"
    ON public.deletion_requests
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE public.admin_users.id = auth.uid()
        )
    );
