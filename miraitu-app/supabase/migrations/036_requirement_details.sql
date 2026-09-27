-- ─────────────────────────────────────────────────────────────────────
-- 036 — Per-category answers on a buyer requirement
--
-- 035 gave every requirement the same fixed columns, which asked a farmer
-- buying a cow whether she was "new or used" and had nowhere to put her
-- breed, age or milk yield. The questions now follow the category —
-- horsepower and hours run for a tractor, pest and crop for a pesticide,
-- grade and delivery for produce — and those answers land here.
--
-- JSONB rather than a column each: the question sets are product decisions
-- that will keep changing, and every new one would otherwise be a migration
-- and a deploy. See CATEGORY_QUESTIONS in lib/requirement-options.ts for
-- what keys each category writes.
--
-- Additive and defaulted, so every existing row stays valid.
-- ─────────────────────────────────────────────────────────────────────

ALTER TABLE public.buyer_requirements
    ADD COLUMN IF NOT EXISTS details JSONB NOT NULL DEFAULT '{}'::jsonb;
