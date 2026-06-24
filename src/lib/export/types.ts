// Shared types for the vet-facing PDF export (Phase 7.5, Part 3). The API route
// assembles an ExportPayload server-side (data + AI summary); the client renders
// it to a PDF. Kept here so both sides share one shape without the server route
// importing the client-only @react-pdf document.

// Triage priority shown to the vet. Derived DETERMINISTICALLY from the case's
// stored risk (never re-judged by the summary model), so the handover can't
// soften an emergency: any High block → Urgent, any Medium → Soon, else Routine.
export type ExportPriority = "Urgent" | "Soon" | "Routine";

export type VetSummary = {
  headline: string;
  summary: string;
  symptomTimeline: string[];
  medicationsNote: string | null;
  recommendedFocus: string[];
};

export type ExportSymptom = {
  name: string;
  severity?: string;
  onset?: string;
  frequency?: string;
  status?: string;
};

// One assessment snapshot — the initial assessment or a follow-up.
export type ExportBlock = {
  label: string;
  date: string; // ISO
  risk: string | null;
  primaryConcern: string | null;
  clinicalReasoning: string | null;
  aboutSymptoms: string | null;
  recommendedAction: string | null;
  redFlags: string[];
  symptoms: ExportSymptom[];
};

export type ExportMedication = {
  name: string;
  dosage: string | null; // combined "amount unit", e.g. "1.5 mg"
  quantity: string | null;
  frequency: string | null;
  prescribedBy: string | null;
  startedAt: string | null;
  endedAt: string | null;
  // Currently being taken (derived from ended_at), vs a finished course.
  active: boolean;
};

export type ExportRecord = {
  pet: {
    name: string;
    species: string;
    breed: string;
    ageLabel: string;
    weightKg: number;
    conditions: string[];
  };
  ownerName: string | null;
  medications: ExportMedication[]; // all (current + past); split in the PDF
  clinic: {
    name: string | null;
    phone: string | null;
    address: string | null;
  } | null;
  initial: ExportBlock;
  followUps: ExportBlock[]; // chronological (oldest → newest)
  generatedAt: string; // ISO
};

export type ExportPayload = {
  priority: ExportPriority;
  summary: VetSummary;
  record: ExportRecord;
};
