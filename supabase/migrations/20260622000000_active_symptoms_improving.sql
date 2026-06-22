-- Phase 7.5 Part 2 (Backlog #11): the AI/owner can mark a tracked symptom as
-- "improving" — better but still present — distinct from fully resolved. Adds
-- the value to the status CHECK so the shared reconciliation logic can record it.
ALTER TABLE active_symptoms DROP CONSTRAINT active_symptoms_status_check;
ALTER TABLE active_symptoms ADD CONSTRAINT active_symptoms_status_check
  CHECK (status IN ('active', 'improving', 'worsened', 'resolved'));
