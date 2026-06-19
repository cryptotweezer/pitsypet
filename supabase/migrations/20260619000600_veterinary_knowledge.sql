CREATE TABLE veterinary_knowledge (
  chunk_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text           TEXT NOT NULL,
  embedding      vector(1536),
  metadata       JSONB NOT NULL DEFAULT '{}',
  source         VARCHAR(255) NOT NULL,
  species        VARCHAR(10) NOT NULL CHECK (species IN ('Dog','Cat','Both')),
  urgency_level  INTEGER NOT NULL CHECK (urgency_level >= 1 AND urgency_level <= 10),
  body_system    VARCHAR(50),
  breed_specific BOOLEAN NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
