-- Phase 7.5 Part 2 (Backlog #2): appointment outcome.
-- `notes` already holds the owner's observations (e.g. what they're seeing
-- before the visit). `outcome` records what the vet said afterwards — their
-- recommendations / findings — so the clinical history and the AI can use it.
-- Next vs Past is derived from scheduled_at, no status column needed.
ALTER TABLE appointments ADD COLUMN outcome TEXT;
