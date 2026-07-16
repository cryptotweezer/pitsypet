import { Info } from "lucide-react";

// Shown on every results page, all risk levels.
export function Disclaimer() {
  return (
    <div className="flex gap-3 rounded-[2rem] border border-amber-500/40 bg-amber-500/10 px-5 py-4 text-sm text-amber-800 dark:text-amber-300">
      <Info className="size-5 shrink-0" aria-hidden />
      <p>
        <strong>IMPORTANT DISCLAIMER:</strong> PitsyPet is an educational tool
        only and does not replace professional veterinary diagnosis, advice, or
        treatment. Always consult a licensed veterinarian. In a suspected
        emergency, contact a veterinary clinic or emergency animal hospital
        immediately.
      </p>
    </div>
  );
}
