-- Phase 7.5 Part 2 (Group C): assessment follow-ups.
-- A completed assessment is an immutable snapshot. A follow-up does NOT edit it;
-- instead it appends a dated "section" to this array. Each entry is a full
-- mini-snapshot (its own chat, symptoms, classification) with its own date, so
-- the results page can render the original assessment + each follow-up as a
-- timeline. The original top-level columns always remain the first section.
ALTER TABLE assessments
  ADD COLUMN follow_ups JSONB NOT NULL DEFAULT '[]';
