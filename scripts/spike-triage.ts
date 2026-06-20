import fs from "node:fs";

import { classifyRisk } from "../src/lib/ai/classifier";

// Phase 5.14 triage spike / regression set. Validates the core classifier +
// deterministic safety override BEFORE the UI is wired. Run with:
//   npm run spike
// Knowledge is left empty on purpose (the KB isn't ingested yet) so this also
// proves classification degrades gracefully with no RAG context.
//
// HARD GATE: every emergency scenario MUST come back High.

function loadEnv(file: string): void {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    if (!line || line.trimStart().startsWith("#") || !line.includes("=")) continue;
    const i = line.indexOf("=");
    const key = line.slice(0, i).trim();
    const value = line.slice(i + 1).trim().replace(/^["']|["']$/g, "");
    if (!(key in process.env)) process.env[key] = value;
  }
}
loadEnv(".env.local");

const NO_RAG = "No specific veterinary guidance retrieved for this case.";

interface Scenario {
  name: string;
  pet: string;
  symptoms: string;
  expected: "Low" | "Medium" | "High";
  emergency: boolean; // true → MUST be High
}

const SCENARIOS: Scenario[] = [
  {
    name: "Seizure",
    pet: "Patient: Rocky, Labrador (Dog), 6 years old, 30 kg.",
    symptoms: "- seizure, onset: just now, severity: severe\n- collapsed and shaking uncontrollably",
    expected: "High",
    emergency: true,
  },
  {
    name: "GDV / bloat",
    pet: "Patient: Zeus, Great Dane (Dog), 4 years old, 60 kg.",
    symptoms: "- swollen abdomen, onset: this evening\n- retching but nothing comes up\n- restless and pacing",
    expected: "High",
    emergency: true,
  },
  {
    name: "Blocked bladder (male cat)",
    pet: "Patient: Milo, Domestic Shorthair (Cat), 3 years old, 5 kg.",
    symptoms: "- straining to urinate, onset: today\n- nothing coming out\n- crying in the litter box",
    expected: "High",
    emergency: true,
  },
  {
    name: "Chocolate ingestion",
    pet: "Patient: Bella, Beagle (Dog), 2 years old, 12 kg.",
    symptoms: "- ate a block of dark chocolate, onset: about an hour ago",
    expected: "High",
    emergency: true,
  },
  {
    name: "Difficulty breathing + blue gums",
    pet: "Patient: Smokey, Persian (Cat), 8 years old, 4.5 kg.",
    symptoms: "- breathing fast and laboured\n- blue gums",
    expected: "High",
    emergency: true,
  },
  {
    name: "Vomiting + lethargy",
    pet: "Patient: Max, Golden Retriever (Dog), 5 years old, 28 kg.",
    symptoms: "- vomiting, frequency: 3 times today\n- lethargy, severity: moderate",
    expected: "Medium",
    emergency: false,
  },
  {
    name: "Diarrhea + lethargy",
    pet: "Patient: Daisy, Kelpie (Dog), 4 years old, 18 kg.",
    symptoms: "- diarrhea, onset: since yesterday\n- mild lethargy",
    expected: "Medium",
    emergency: false,
  },
  {
    name: "Mild sneezing",
    pet: "Patient: Coco, Poodle (Dog), 3 years old, 8 kg.",
    symptoms: "- occasional sneezing, severity: mild\n- eating and drinking normally",
    expected: "Low",
    emergency: false,
  },
  {
    name: "Itchy skin",
    pet: "Patient: Luna, Domestic Shorthair (Cat), 2 years old, 4 kg.",
    symptoms: "- scratching, severity: mild\n- no other symptoms",
    expected: "Low",
    emergency: false,
  },
  {
    name: "Mild limp after walk",
    pet: "Patient: Buddy, Border Collie (Dog), 5 years old, 20 kg.",
    symptoms: "- limping on front paw, onset: after a walk, severity: mild",
    expected: "Low",
    emergency: false,
  },
];

async function main(): Promise<void> {
  let emergencyMisses = 0;
  console.log(`Running ${SCENARIOS.length} triage scenarios…\n`);

  for (const s of SCENARIOS) {
    const r = await classifyRisk(s.symptoms, s.pet, NO_RAG);
    const emergencyOk = !s.emergency || r.riskLevel === "High";
    if (!emergencyOk) emergencyMisses++;

    const flag = !emergencyOk
      ? "✗ EMERGENCY MISSED"
      : r.riskLevel === s.expected
        ? "✓"
        : `~ (expected ${s.expected})`;
    console.log(
      `${flag}  ${s.name.padEnd(34)} → ${r.riskLevel}` +
        `${r.fallbackUsed ? " [fallback]" : ""}`,
    );
  }

  console.log("");
  if (emergencyMisses > 0) {
    console.error(`FAIL: ${emergencyMisses} emergency scenario(s) not classified High.`);
    process.exit(1);
  }
  console.log("PASS: all emergency scenarios classified High (safety net holds).");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
