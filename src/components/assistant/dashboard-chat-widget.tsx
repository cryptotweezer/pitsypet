"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AssistantChat } from "@/components/assistant/assistant-chat";

// Floating dashboard assistant — bottom-right. Spans all of the owner's pets, so
// it always confirms which pet an action is for. (Provisional UI; will be
// refined in the UI/UX phase.)
export function DashboardChatWidget() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {open && (
        <div className="flex h-[32rem] w-[min(92vw,24rem)] flex-col overflow-hidden rounded-xl border bg-card shadow-xl">
          <div className="flex items-center justify-between border-b px-3 py-2">
            <span className="font-heading text-sm font-semibold">
              PitsyPet assistant
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
              aria-label="Close assistant"
            >
              <X className="size-4" aria-hidden />
            </Button>
          </div>
          <AssistantChat
            scope="dashboard"
            greeting="Hi! I can help across all your pets — ask me anything, or tell me what to record (a medication, appointment, symptom update…). I'll always check which pet first."
            inputPlaceholder="Ask about any pet…"
            className="min-h-0 flex-1 p-3"
          />
        </div>
      )}

      <Button
        size="lg"
        className={cn("rounded-full shadow-lg", open && "hidden")}
        onClick={() => setOpen(true)}
        aria-label="Open assistant"
      >
        <MessageCircle className="size-5" aria-hidden /> Assistant
      </Button>
    </div>
  );
}
