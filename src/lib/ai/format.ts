// Prompt-formatting helpers shared by the chat route and the classifier.

type Symptom = {
  name: string;
  onset?: string;
  frequency?: string;
  severity: string;
};

type Pet = {
  pet_name: string;
  species: string;
  breed: string;
  age_years: number;
  age_months?: number | null;
  weight_kg: number;
  medical_conditions: string[];
};

type Chunk = { text: string; source: string; body_system?: string | null };

export function formatSymptoms(symptoms: Symptom[]): string {
  if (symptoms.length === 0) return "No symptoms recorded yet.";
  return symptoms
    .map((s) => {
      const parts = [s.name];
      if (s.onset) parts.push(`onset: ${s.onset}`);
      if (s.frequency) parts.push(`frequency: ${s.frequency}`);
      if (s.severity !== "unknown") parts.push(`severity: ${s.severity}`);
      return "- " + parts.join(", ");
    })
    .join("\n");
}

export function formatPet(pet: Pet): string {
  const ageStr = pet.age_months
    ? `${pet.age_years}yr ${pet.age_months}mo`
    : `${pet.age_years} years old`;
  const conditions =
    pet.medical_conditions?.length > 0
      ? `Known medical conditions: ${pet.medical_conditions.join(", ")}.`
      : "No known medical conditions.";
  return `Patient: ${pet.pet_name}, ${pet.breed} (${pet.species}), ${ageStr}, ${pet.weight_kg} kg. ${conditions}`;
}

export function formatChunks(chunks: Chunk[]): string {
  if (chunks.length === 0)
    return "No specific veterinary guidance retrieved for this case.";
  return chunks
    .map((c, i) => `[${i + 1}] ${c.text.trim()}\nSource: ${c.source}`)
    .join("\n\n");
}
