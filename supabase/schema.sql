-- ==============================================================================
-- ClaimFight Supabase Database Schema
-- Production Ready & Fully Documented
-- ==============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- ------------------------------------------------------------------------------
-- 1. Profiles Table (extends auth.users)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    phone_number TEXT,
    analyses_today INTEGER DEFAULT 0 NOT NULL,
    last_analysis_date DATE DEFAULT CURRENT_DATE NOT NULL,
    consent_given BOOLEAN DEFAULT FALSE NOT NULL,
    consent_timestamp TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Trigger to create profile upon auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, consent_given)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'ClaimFight User'),
        COALESCE((NEW.raw_user_meta_data->>'consent_given')::boolean, false)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 2. Cases Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    case_number TEXT NOT NULL UNIQUE,
    patient_name TEXT,
    insurer_name TEXT,
    tpa_name TEXT,
    policy_number TEXT,
    claim_number TEXT,
    hospital_name TEXT,
    admission_date DATE,
    discharge_date DATE,
    claim_amount NUMERIC(12, 2) DEFAULT 0.00,
    approved_amount NUMERIC(12, 2) DEFAULT 0.00,
    deducted_amount NUMERIC(12, 2) DEFAULT 0.00,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'extracting', 'analyzing', 'rules_engine', 'completed', 'failed')),
    overall_verdict TEXT DEFAULT 'pending' CHECK (overall_verdict IN ('pending', 'grounds_to_contest', 'insurer_appears_correct', 'unclear', 'not_supported')),
    summary_plain TEXT,
    is_sample BOOLEAN DEFAULT FALSE NOT NULL,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours') NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cases"
    ON public.cases FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cases"
    ON public.cases FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cases"
    ON public.cases FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cases"
    ON public.cases FOR DELETE
    USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 3. Documents Table (Auto-deleted after 24 hours)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    doc_type TEXT NOT NULL CHECK (doc_type IN ('rejection_letter', 'policy_document', 'discharge_summary')),
    file_name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    ocr_confidence NUMERIC(5, 2) DEFAULT 0.00,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours') NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access documents of their cases"
    ON public.documents FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.cases
            WHERE cases.id = documents.case_id AND cases.user_id = auth.uid()
        )
    );

-- ------------------------------------------------------------------------------
-- 4. Extracted Text (Auto-deleted after 24 hours)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.extracted_text (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    doc_type TEXT NOT NULL CHECK (doc_type IN ('rejection_letter', 'policy_document', 'discharge_summary')),
    page_number INTEGER NOT NULL,
    text_content TEXT NOT NULL,
    ocr_confidence NUMERIC(5, 2) DEFAULT 100.00,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours') NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

ALTER TABLE public.extracted_text ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view extracted text of their cases"
    ON public.extracted_text FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.cases
            WHERE cases.id = extracted_text.case_id AND cases.user_id = auth.uid()
        )
    );

-- ------------------------------------------------------------------------------
-- 5. Extracted Policy Clauses (Retained with analysis)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.clauses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    clause_heading TEXT NOT NULL,
    page_number INTEGER DEFAULT 1,
    quote TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'waiting_period',
        'ped_exclusion',
        'sub_limit_room_rent',
        'hospitalisation_medical_necessity',
        'other'
    )),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

ALTER TABLE public.clauses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view clauses of their cases"
    ON public.clauses FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.cases
            WHERE cases.id = clauses.case_id AND cases.user_id = auth.uid()
        )
    );

-- ------------------------------------------------------------------------------
-- 6. Insurer Stated Rejection Reasons
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rejection_reasons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    stated_reason TEXT NOT NULL,
    cited_clause TEXT,
    quoted_text TEXT,
    deducted_sub_amount NUMERIC(12, 2) DEFAULT 0.00,
    rejection_category TEXT NOT NULL CHECK (rejection_category IN (
        'waiting_period',
        'ped_exclusion',
        'sub_limit_room_rent',
        'hospitalisation_medical_necessity',
        'unsupported'
    )),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

ALTER TABLE public.rejection_reasons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view rejection reasons of their cases"
    ON public.rejection_reasons FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.cases
            WHERE cases.id = rejection_reasons.case_id AND cases.user_id = auth.uid()
        )
    );

-- ------------------------------------------------------------------------------
-- 7. Comparisons & Verdicts (Side-by-side core demo)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.comparisons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    rejection_reason_id UUID REFERENCES public.rejection_reasons(id) ON DELETE SET NULL,
    category TEXT NOT NULL,
    insurer_statement TEXT NOT NULL,
    insurer_quote TEXT,
    policy_clause_heading TEXT NOT NULL,
    policy_page INTEGER DEFAULT 1,
    policy_quote TEXT NOT NULL,
    medical_fact TEXT NOT NULL,
    discharge_summary_quote TEXT,
    discharge_page INTEGER DEFAULT 1,
    verdict TEXT NOT NULL CHECK (verdict IN ('grounds_to_contest', 'insurer_appears_correct', 'unclear', 'not_supported')),
    contest_reason_plain TEXT NOT NULL,
    missing_info JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

ALTER TABLE public.comparisons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view comparisons of their cases"
    ON public.comparisons FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.cases
            WHERE cases.id = comparisons.case_id AND cases.user_id = auth.uid()
        )
    );

-- ------------------------------------------------------------------------------
-- 8. Generated Letters (Grievance Appeal & Ombudsman Complaint)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.letters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    letter_type TEXT NOT NULL CHECK (letter_type IN ('grievance_appeal', 'ombudsman_complaint')),
    recipient_title TEXT NOT NULL,
    recipient_organization TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    placeholders JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

ALTER TABLE public.letters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view letters of their cases"
    ON public.letters FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.cases
            WHERE cases.id = letters.case_id AND cases.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update letters of their cases"
    ON public.letters FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.cases
            WHERE cases.id = letters.case_id AND cases.user_id = auth.uid()
        )
    );

-- ------------------------------------------------------------------------------
-- 9. Official Rules Table (Never hardcode rules in frontend)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.official_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    authority TEXT NOT NULL,
    source_url TEXT NOT NULL,
    last_verified DATE DEFAULT CURRENT_DATE NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

ALTER TABLE public.official_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can read official rules"
    ON public.official_rules FOR SELECT
    TO authenticated, anon
    USING (true);

-- ------------------------------------------------------------------------------
-- 10. Audit Log (Metadata only, NO text or health data)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own audit logs"
    ON public.audit_log FOR SELECT
    USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 11. Rate Limiting Function (Max 3 analyses per user per day)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_and_increment_quota(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_today DATE := CURRENT_DATE;
    v_count INTEGER;
    v_last_date DATE;
BEGIN
    SELECT analyses_today, last_analysis_date
    INTO v_count, v_last_date
    FROM public.profiles
    WHERE id = p_user_id;

    IF v_last_date IS NULL OR v_last_date < v_today THEN
        UPDATE public.profiles
        SET analyses_today = 1, last_analysis_date = v_today, updated_at = NOW()
        WHERE id = p_user_id;
        RETURN TRUE;
    ELSIF v_count < 3 THEN
        UPDATE public.profiles
        SET analyses_today = v_count + 1, updated_at = NOW()
        WHERE id = p_user_id;
        RETURN TRUE;
    ELSE
        RETURN FALSE; -- Quota reached (3 / day)
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- 12. Storage Bucket Setup & Security
-- ------------------------------------------------------------------------------
-- Note: Create bucket 'claim_documents' as private in Supabase Dashboard or via API
-- INSERT INTO storage.buckets (id, name, public) VALUES ('claim_documents', 'claim_documents', false) ON CONFLICT DO NOTHING;

-- Storage RLS: Users can only upload and read files in their own folder (folder name is user_id)
-- CREATE POLICY "Users access own files" ON storage.objects
--   FOR ALL USING (auth.uid()::text = (storage.foldername(name))[1]);

-- ------------------------------------------------------------------------------
-- 13. Auto-Purge Hourly pg_cron Job (DPDP Act Compliance - 24hr auto delete)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.purge_expired_claim_data()
RETURNS void AS $$
BEGIN
    -- 1. Delete expired extracted texts
    DELETE FROM public.extracted_text
    WHERE expires_at <= NOW();

    -- 2. Mark documents as expired or trigger deletion
    DELETE FROM public.documents
    WHERE expires_at <= NOW();

    -- Log metadata audit event
    INSERT INTO public.audit_log (action, metadata)
    VALUES ('cron_purge_24h_completed', jsonb_build_object('timestamp', NOW()));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule pg_cron every hour (runs if pg_cron is available)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
        PERFORM cron.schedule(
            'claimfight_hourly_purge',
            '0 * * * *',
            'SELECT public.purge_expired_claim_data()'
        );
    END IF;
EXCEPTION WHEN OTHERS THEN
    -- In environments where cron is not enabled, the function can be called via webhooks or edge functions
    NULL;
END;
$$;

-- ------------------------------------------------------------------------------
-- 14. Seed Data for Official Rules Table
-- ------------------------------------------------------------------------------
INSERT INTO public.official_rules (rule_code, title, summary, authority, source_url, details)
VALUES
(
    'OMBUDSMAN_ELIGIBILITY',
    'Insurance Ombudsman Complaint Eligibility',
    'You can file a complaint with the Insurance Ombudsman only after first representing your grievance in writing to the insurer. You may approach the Ombudsman if the insurer has rejected the grievance, not replied within 30 days, or granted only partial relief. Complaint must be lodged within 1 year from the date of rejection letter.',
    'Council for Insurance Ombudsmen (CIO) / IRDAI',
    'https://www.cioins.co.in/HowToApproach',
    '{"time_limit_months": 12, "prerequisite_days_to_wait": 30, "jurisdiction_type": "District / Regional Ombudsman center", "fee": "Free of cost (No court fees)"}'::jsonb
),
(
    'OMBUDSMAN_FINANCIAL_CAP',
    'Maximum Claim Value under Ombudsman Jurisdiction',
    'The Insurance Ombudsman can award compensation up to Rs. 30 Lakhs (inclusive of ex-gratia and other expenses). Claims exceeding Rs. 30 Lakhs must be taken to the Consumer Commission (NCDRC/State Commission) or civil court.',
    'Insurance Ombudsman Rules, 2017 (amended 2021)',
    'https://www.cioins.co.in',
    '{"max_compensation_inr": 3000000, "currency": "INR"}'::jsonb
),
(
    'IRDAI_BIMA_BHAROSA',
    'IRDAI Grievance Escalation via Bima Bharosa Portal',
    'If the insurer fails to respond within 15 days or offers an unsatisfactory resolution, the policyholder can register a grievance on IRDAI Bima Bharosa (Integrated Grievance Management System - IGMS) or call toll-free 155255 / 1800 4254 732.',
    'Insurance Regulatory and Development Authority of India (IRDAI)',
    'https://bimabharosa.irdai.gov.in',
    '{"turnaround_time_days": 15, "toll_free_numbers": ["155255", "18004254732"], "portal_name": "Bima Bharosa"}'::jsonb
),
(
    'WAITING_PERIOD_PORTABILITY',
    'Waiting Period Continuity on Health Insurance Portability',
    'Under IRDAI Health Insurance Regulations, when porting between insurers, the waiting period previously served for pre-existing diseases and specific illnesses must be credited and cannot be re-imposed for the existing sum insured.',
    'IRDAI Health Insurance Portability Guidelines',
    'https://irdai.gov.in',
    '{"continuity_benefit": true, "conditions": "Continuity applies up to sum insured and cumulative bonus of previous policy"}'::jsonb
),
(
    'ROOM_RENT_PROPORTIONATE_DEDUCTION',
    'Room Rent Capping and Associated Expenses',
    'If a policyholder occupies a room category higher than their eligibility, insurers may only proportionately deduct room rent and doctor/nursing fees tied directly to room tariffs. Proportionate deduction cannot be applied to costs of implants, medicines, diagnostics, medical devices, or ICU charges.',
    'IRDAI Master Circular on Health Insurance - Circular Ref: IRDAI/HLT/REG/CIR/194/07/2020',
    'https://irdai.gov.in',
    '{"exempt_items_from_proportionate_deduction": ["medicines", "implants", "medical_devices", "diagnostic_tests", "ICU_charges"]}'::jsonb
),
(
    'PED_MORATORIUM_PERIOD',
    'Pre-Existing Diseases Moratorium Period (60 Months / 5 Years)',
    'As per IRDAI Master Circular (2024 revision), after 60 continuous months of coverage (reduced from 8 years), no health insurance policy can be challenged on grounds of non-disclosure or pre-existing disease, except for established fraud.',
    'IRDAI Master Circular on Protection of Policyholders Interests 2024',
    'https://irdai.gov.in',
    '{"moratorium_period_months": 60, "fraud_exception_only": true}'::jsonb
)
ON CONFLICT (rule_code) DO UPDATE
SET title = EXCLUDED.title,
    summary = EXCLUDED.summary,
    source_url = EXCLUDED.source_url,
    details = EXCLUDED.details,
    last_verified = CURRENT_DATE;
