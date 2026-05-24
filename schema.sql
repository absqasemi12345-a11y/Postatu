-- ============================================================
-- Postatu — Full Database Schema
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. SOCIAL ACCOUNTS (OAuth Token Store)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.social_accounts (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id                 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    platform                TEXT NOT NULL,  -- 'youtube' | 'facebook' | 'instagram' | 'tiktok'
    platform_account_id     TEXT NOT NULL,
    platform_account_name   TEXT,
    platform_account_handle TEXT,
    platform_account_image  TEXT,
    access_token            TEXT NOT NULL,  -- encrypted
    refresh_token           TEXT,
    expires_at              TIMESTAMP WITH TIME ZONE,
    metadata                JSONB DEFAULT '{}'::jsonb,
    created_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, platform, platform_account_id)
);

-- ============================================================
-- 2. APP SETTINGS (Admin Panel Global Config)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.app_settings (
    key        TEXT PRIMARY KEY,
    value      TEXT NOT NULL DEFAULT '',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Default settings seed
INSERT INTO public.app_settings (key, value) VALUES
  ('SHOW_N8N_NODE',   'false'),
  ('N8N_NODE_LINK',   'n8n-nodes-postatu'),
  ('N8N_GUIDE_VIDEO', ''),
  ('N8N_WEBHOOK_URL', ''),
  ('N8N_SECRET',      ''),
  ('APP_URL',         '')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- 3. JOB QUEUE  ← NEW (n8n থেকে আসা সব job এখানে track হবে)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.job_queue (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    video_url   TEXT NOT NULL,
    title       TEXT NOT NULL DEFAULT '',
    description TEXT DEFAULT '',
    hashtags    TEXT[] DEFAULT '{}',
    platforms   TEXT[] NOT NULL,           -- ['youtube','facebook','tiktok','instagram']
    status      TEXT NOT NULL DEFAULT 'pending',  -- pending | processing | done | failed
    retry_count INT  NOT NULL DEFAULT 0,
    result      JSONB DEFAULT '{}'::jsonb, -- প্রতিটি platform এর success/fail result
    source      TEXT NOT NULL DEFAULT 'manual',   -- 'n8n' | 'manual'
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 4. SUB ACCOUNTS (Agency Tier)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.sub_accounts (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email      TEXT NOT NULL,
    status     TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(parent_id, email)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_queue        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_accounts     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings     ENABLE ROW LEVEL SECURITY;

-- social_accounts policies
CREATE POLICY "Users view own accounts"
    ON public.social_accounts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users insert own accounts"
    ON public.social_accounts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own accounts"
    ON public.social_accounts FOR DELETE
    USING (auth.uid() = user_id);

-- job_queue policies
CREATE POLICY "Users view own jobs"
    ON public.job_queue FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users insert own jobs"
    ON public.job_queue FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- sub_accounts policies
CREATE POLICY "Users view own sub accounts"
    ON public.sub_accounts FOR SELECT
    USING (auth.uid() = parent_id);

CREATE POLICY "Users insert own sub accounts"
    ON public.sub_accounts FOR INSERT
    WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Users delete own sub accounts"
    ON public.sub_accounts FOR DELETE
    USING (auth.uid() = parent_id);

-- app_settings: শুধু service_role access (backend only)
-- কোনো public policy নেই
