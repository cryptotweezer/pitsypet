-- Phase 7.5 Part 2: dosage needs an explicit unit (mg / ml / mcg / g / IU /
-- tablet…) so "1.5" is never ambiguous in a clinical record. Kept as free text
-- (with a suggested list in the UI) since the set of valid units is open-ended.
ALTER TABLE medications ADD COLUMN dosage_unit VARCHAR(30);
