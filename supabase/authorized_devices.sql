-- ============================================================
-- Supabase SQL: G.M.Counter_Integrated table setup
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Create the G.M.Counter_Integrated table
--    Note: Quoted identifier required because of dots and uppercase in the name.
CREATE TABLE IF NOT EXISTS public."G.M.Counter_Integrated" (
    id            BIGSERIAL PRIMARY KEY,
    device_id     TEXT        NOT NULL UNIQUE,
    label         TEXT,                          -- Optional: human-readable label (e.g. "Lab Tablet #1")
    is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Add a comment to the table for documentation
COMMENT ON TABLE public."G.M.Counter_Integrated" IS
    'Stores Android device IDs (Settings.Secure.ANDROID_ID) that are authorized to use the G.M.Counter_Integrated application.';

-- 3. Create an index for fast lookups by device_id
CREATE INDEX IF NOT EXISTS "idx_GMCounter_Integrated_device_id"
    ON public."G.M.Counter_Integrated" (device_id);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public."G.M.Counter_Integrated" ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policy: Allow anonymous/public read-only access
--    The app uses the publishable key (anon role) to verify the device before any login.
CREATE POLICY "Allow anon read for device check"
    ON public."G.M.Counter_Integrated"
    FOR SELECT
    TO anon
    USING (is_active = TRUE);

-- 6. Auto-update the updated_at column on row modification
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "trg_GMCounter_Integrated_updated_at"
    BEFORE UPDATE ON public."G.M.Counter_Integrated"
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- MIGRATION: If the table already exists with serial_number column,
-- run the block below to rename the column on the live table.
-- ============================================================

-- ALTER TABLE public."G.M.Counter_Integrated"
--     RENAME COLUMN serial_number TO device_id;

-- DROP INDEX IF EXISTS "idx_GMCounter_Integrated_serial_number";

-- CREATE INDEX IF NOT EXISTS "idx_GMCounter_Integrated_device_id"
--     ON public."G.M.Counter_Integrated" (device_id);

-- ============================================================
-- HOW TO ADD AUTHORIZED DEVICES
-- Read the Device ID from the App's "Access Denied" screen
-- Then insert it below.
-- ============================================================

-- INSERT INTO public."G.M.Counter_Integrated" (device_id, label)
-- VALUES ('YOUR_ANDROID_ID_HERE', 'Lab Tablet #1');

-- EXAMPLE:
-- INSERT INTO public."G.M.Counter_Integrated" (device_id, label)
-- VALUES ('a1b2c3d4e5f60789', 'GM Counter Tablet - Lab A');
