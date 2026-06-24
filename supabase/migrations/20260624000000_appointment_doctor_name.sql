-- Phase 7.5: an appointment can name the doctor seen/booked. The UI suggests the
-- selected clinic's doctors but lets the owner type any name or leave it blank,
-- so this is plain free text (a nullable column), not an FK to vet_doctors.
ALTER TABLE appointments ADD COLUMN doctor_name TEXT;
