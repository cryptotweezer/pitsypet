CREATE TABLE knowledge_processing_audit (
  audit_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_title      VARCHAR(255) NOT NULL,
  document_type     VARCHAR(50),
  total_chunks      INTEGER,
  processing_date   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  validation_status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (validation_status IN ('pending','approved','active'))
);
