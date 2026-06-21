-- Phase 7.5 Part 2 (Backlog #6): active-symptoms tracker.
-- The pet page shows what the pet is CURRENTLY experiencing, with the date each
-- symptom was detected and a status the owner (or the AI) can update as things
-- improve or worsen. Auto-populated when an assessment/follow-up completes;
-- also editable manually and (later) via the contextual AI chat.
CREATE TABLE active_symptoms (
  symptom_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id      UUID NOT NULL REFERENCES pets(pet_id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        VARCHAR(200) NOT NULL,
  severity    VARCHAR(20),
  status      VARCHAR(20) NOT NULL DEFAULT 'active'
                CHECK (status IN ('active', 'resolved', 'worsened')),
  source      VARCHAR(20) NOT NULL DEFAULT 'manual'
                CHECK (source IN ('manual', 'assessment', 'followup', 'chat')),
  detected_at DATE NOT NULL DEFAULT CURRENT_DATE,
  resolved_at DATE,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ
);

CREATE INDEX idx_active_symptoms_pet ON active_symptoms(pet_id) WHERE deleted_at IS NULL;

CREATE TRIGGER set_active_symptoms_updated_at
  BEFORE UPDATE ON active_symptoms
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE active_symptoms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own active symptoms" ON active_symptoms
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
