"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

import type {
  ExportBlock,
  ExportMedication,
  ExportPayload,
  ExportPriority,
} from "@/lib/export/types";

// Brand + risk palette (hex — @react-pdf has no CSS variables).
const COLORS = {
  ink: "#1a1a1a",
  muted: "#666666",
  line: "#d9d9d9",
  brand: "#0f766e",
  high: "#b91c1c",
  highBg: "#fde8e8",
  medium: "#b45309",
  mediumBg: "#fdf0d5",
  low: "#15803d",
  lowBg: "#e6f4ea",
};

const PRIORITY_STYLE: Record<
  ExportPriority,
  { bg: string; fg: string; note: string }
> = {
  Urgent: { bg: COLORS.highBg, fg: COLORS.high, note: "Time-sensitive — review promptly." },
  Soon: { bg: COLORS.mediumBg, fg: COLORS.medium, note: "Should be seen soon." },
  Routine: { bg: COLORS.lowBg, fg: COLORS.low, note: "Non-urgent based on triage." },
};

function riskColor(risk: string | null): { fg: string; bg: string } {
  if (risk === "High") return { fg: COLORS.high, bg: COLORS.highBg };
  if (risk === "Medium") return { fg: COLORS.medium, bg: COLORS.mediumBg };
  if (risk === "Low") return { fg: COLORS.low, bg: COLORS.lowBg };
  return { fg: COLORS.muted, bg: "#f0f0f0" };
}

function fmtDate(iso: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const s = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 48,
    paddingHorizontal: 44,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: COLORS.ink,
    lineHeight: 1.45,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderBottomWidth: 2,
    borderBottomColor: COLORS.brand,
    paddingBottom: 8,
    marginBottom: 14,
  },
  brand: { fontSize: 16, fontFamily: "Helvetica-Bold", color: COLORS.brand },
  headerSub: { fontSize: 9, color: COLORS.muted },
  priorityBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 4,
    paddingVertical: 7,
    paddingHorizontal: 10,
    marginBottom: 14,
  },
  priorityLabel: { fontSize: 12, fontFamily: "Helvetica-Bold" },
  priorityNote: { fontSize: 9 },
  section: { marginBottom: 14 },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: COLORS.brand,
    marginBottom: 5,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  headline: { fontSize: 11, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  paragraph: { marginBottom: 6 },
  bulletRow: { flexDirection: "row", marginBottom: 2 },
  bulletDot: { width: 10, color: COLORS.brand },
  bulletText: { flex: 1 },
  label: { fontFamily: "Helvetica-Bold" },
  infoGrid: { flexDirection: "row", flexWrap: "wrap" },
  infoCell: { width: "50%", marginBottom: 3 },
  block: {
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
  },
  blockHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  blockTitle: { fontSize: 11, fontFamily: "Helvetica-Bold" },
  riskPill: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 3,
  },
  fieldLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    color: COLORS.muted,
    marginTop: 4,
  },
  redFlag: { color: COLORS.high },
  footer: {
    position: "absolute",
    bottom: 22,
    left: 44,
    right: 44,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
    paddingTop: 6,
    fontSize: 8,
    color: COLORS.muted,
  },
});

function Bullets({ items }: { items: string[] }) {
  return (
    <View>
      {items.map((t, i) => (
        <View key={i} style={s.bulletRow}>
          <Text style={s.bulletDot}>•</Text>
          <Text style={s.bulletText}>{t}</Text>
        </View>
      ))}
    </View>
  );
}

function SymptomLine({ b }: { b: ExportBlock }) {
  if (b.symptoms.length === 0) return null;
  const text = b.symptoms
    .map((sy) => {
      const extra = [sy.severity, sy.status, sy.onset, sy.frequency]
        .filter((v) => v && v !== "unknown" && v !== "present")
        .join(", ");
      return extra ? `${sy.name} (${extra})` : sy.name;
    })
    .join("; ");
  return (
    <View>
      <Text style={s.fieldLabel}>Symptoms</Text>
      <Text>{text}</Text>
    </View>
  );
}

function medDetail(m: ExportMedication): string {
  const dates =
    m.startedAt && m.endedAt
      ? `${m.startedAt} – ${m.endedAt}`
      : m.startedAt
        ? `from ${m.startedAt}`
        : m.endedAt
          ? `until ${m.endedAt}`
          : null;
  return [
    m.dosage,
    m.quantity,
    m.frequency,
    dates,
    m.prescribedBy ? `prescribed by ${m.prescribedBy}` : null,
  ]
    .filter(Boolean)
    .join(", ");
}

function MedRow({ m }: { m: ExportMedication }) {
  const d = medDetail(m);
  return (
    <Text style={{ marginBottom: 2 }}>
      <Text style={s.label}>{m.name}</Text>
      {d ? ` — ${d}` : ""}
    </Text>
  );
}

function MedicationsSection({
  medications,
}: {
  medications: ExportMedication[];
}) {
  const current = medications.filter((m) => m.active);
  const past = medications.filter((m) => !m.active);
  return (
    <View>
      <View style={s.section}>
        <Text style={s.sectionTitle}>Current medications</Text>
        {current.length === 0 ? (
          <Text style={{ color: COLORS.muted }}>None recorded.</Text>
        ) : (
          current.map((m, i) => <MedRow key={i} m={m} />)
        )}
      </View>
      {past.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Past medications</Text>
          {past.map((m, i) => <MedRow key={i} m={m} />)}
        </View>
      )}
    </View>
  );
}

function AssessmentBlock({ b }: { b: ExportBlock }) {
  const rc = riskColor(b.risk);
  return (
    <View style={s.block} wrap={false}>
      <View style={s.blockHead}>
        <Text style={s.blockTitle}>
          {b.label} · {fmtDate(b.date)}
        </Text>
        {b.risk && (
          <Text style={[s.riskPill, { color: rc.fg, backgroundColor: rc.bg }]}>
            {b.risk} risk
          </Text>
        )}
      </View>
      {b.primaryConcern && (
        <View>
          <Text style={s.fieldLabel}>Primary concern</Text>
          <Text>{b.primaryConcern}</Text>
        </View>
      )}
      <SymptomLine b={b} />
      {b.clinicalReasoning && (
        <View>
          <Text style={s.fieldLabel}>Clinical reasoning</Text>
          <Text>{b.clinicalReasoning}</Text>
        </View>
      )}
      {b.recommendedAction && (
        <View>
          <Text style={s.fieldLabel}>Recommended action</Text>
          <Text>{b.recommendedAction}</Text>
        </View>
      )}
      {b.redFlags.length > 0 && (
        <View>
          <Text style={s.fieldLabel}>Red flags</Text>
          <Text style={s.redFlag}>{b.redFlags.join("; ")}</Text>
        </View>
      )}
    </View>
  );
}

export function VetPdfDocument({ payload }: { payload: ExportPayload }) {
  const { priority, summary, record } = payload;
  const p = PRIORITY_STYLE[priority];
  const pet = record.pet;

  return (
    <Document
      title={`${pet.name} — clinical triage handover`}
      author="PitsyPet"
    >
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header} fixed>
          <View>
            <Text style={s.brand}>PitsyPet</Text>
            <Text style={s.headerSub}>Clinical triage handover</Text>
          </View>
          <View>
            <Text style={s.headerSub}>
              {pet.name} · {pet.breed} {pet.species}
            </Text>
            <Text style={s.headerSub}>
              Generated {fmtDate(record.generatedAt)}
            </Text>
          </View>
        </View>

        {/* Priority */}
        <View style={[s.priorityBar, { backgroundColor: p.bg }]}>
          <Text style={[s.priorityLabel, { color: p.fg }]}>
            Triage priority: {priority}
          </Text>
          <Text style={[s.priorityNote, { color: p.fg }]}>{p.note}</Text>
        </View>

        {/* AI summary */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Summary for the veterinarian</Text>
          <Text style={s.headline}>{summary.headline}</Text>
          <Text style={s.paragraph}>{summary.summary}</Text>
          {summary.symptomTimeline.length > 0 && (
            <View style={{ marginBottom: 6 }}>
              <Text style={s.label}>Symptom timeline</Text>
              <Bullets items={summary.symptomTimeline} />
            </View>
          )}
          {summary.medicationsNote && (
            <Text style={s.paragraph}>
              <Text style={s.label}>Medications: </Text>
              {summary.medicationsNote}
            </Text>
          )}
          {summary.recommendedFocus.length > 0 && (
            <View>
              <Text style={s.label}>Suggested focus for the vet</Text>
              <Bullets items={summary.recommendedFocus} />
            </View>
          )}
        </View>

        {/* Patient */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Patient</Text>
          <View style={s.infoGrid}>
            <Text style={s.infoCell}>
              <Text style={s.label}>Name: </Text>
              {pet.name}
            </Text>
            <Text style={s.infoCell}>
              <Text style={s.label}>Species / breed: </Text>
              {pet.species} · {pet.breed}
            </Text>
            <Text style={s.infoCell}>
              <Text style={s.label}>Age: </Text>
              {pet.ageLabel}
            </Text>
            <Text style={s.infoCell}>
              <Text style={s.label}>Weight: </Text>
              {pet.weightKg} kg
            </Text>
            {record.ownerName && (
              <Text style={s.infoCell}>
                <Text style={s.label}>Owner: </Text>
                {record.ownerName}
              </Text>
            )}
          </View>
          {pet.conditions.length > 0 && (
            <Text style={{ marginTop: 3 }}>
              <Text style={s.label}>Known conditions: </Text>
              {pet.conditions.join(", ")}
            </Text>
          )}
        </View>

        {/* Medications — current vs past */}
        <MedicationsSection medications={record.medications} />

        {/* Assessment + follow-ups */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Assessment record</Text>
          <AssessmentBlock b={record.initial} />
          {record.followUps.map((f, i) => (
            <AssessmentBlock key={i} b={f} />
          ))}
        </View>

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text>
            PitsyPet — educational triage tool. Not a veterinary diagnosis.
          </Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
