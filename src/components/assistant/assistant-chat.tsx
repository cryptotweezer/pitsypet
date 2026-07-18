"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useChat, type Message } from "@ai-sdk/react";
import { toast } from "sonner";
import { Check, X, Sparkles, ArrowRight, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, cleanAiText, parseApiError } from "@/lib/utils";
import type { ProposedAction } from "@/lib/ai/assistant";

type ActionStatus = "pending" | "working" | "done" | "cancelled" | "error";

// Pull the proposed actions out of the useChat data stream, newest value per id.
function readActions(data: unknown[] | undefined): ProposedAction[] {
  const byId = new Map<string, ProposedAction>();
  for (const part of data ?? []) {
    if (
      part &&
      typeof part === "object" &&
      "type" in part &&
      (part as { type: string }).type === "action"
    ) {
      const a = (part as { action?: ProposedAction }).action;
      if (a?.id) byId.set(a.id, a);
    }
  }
  return Array.from(byId.values());
}

export function AssistantChat({
  scope,
  petId,
  petName,
  greeting,
  className,
  inputPlaceholder,
}: {
  scope: "pet" | "dashboard";
  petId?: string;
  petName?: string;
  greeting?: string;
  className?: string;
  inputPlaceholder?: string;
}) {
  const router = useRouter();
  // The user's own timezone (from their device), so the assistant resolves
  // "today"/"tomorrow"/"next Monday" against the date THEY see — not the UTC
  // server. Independent of where Vercel runs or where the user connects from.
  const timeZone =
    typeof Intl !== "undefined"
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : "UTC";
  const {
    messages,
    setMessages,
    input,
    handleInputChange,
    handleSubmit,
    data,
    isLoading,
  } = useChat({
    api: "/api/assistant",
    body: { scope, petId, timeZone },
    initialMessages: greeting
      ? [{ id: "greeting", role: "assistant", content: greeting }]
      : undefined,
    onError: (err) => {
      const { message, code } = parseApiError(err);
      if (code === "plan_limit") {
        // Daily allowance reached — offer the upgrade path right in the toast.
        toast.error(message, {
          duration: 8000,
          action: {
            label: "Go Premium",
            onClick: () => router.push("/dashboard/billing"),
          },
        });
      } else {
        toast.error(message);
      }
    },
  });

  // Per-device conversation memory: persist messages to localStorage so the
  // chat survives a refresh. (Provisional — a server-side history can come
  // later.) `ready` is STATE, not a ref: the save effect must NOT run during the
  // mount commit (it would overwrite the saved transcript with just the greeting
  // before hydration applies). It only starts saving on the render AFTER
  // hydration, when `messages` already holds the restored transcript.
  const storageKey = `pitsypet-chat:${scope}:${petId ?? "all"}`;
  // Proposed-action cards + their statuses/anchors are persisted separately
  // ("ext"), because they live in the useChat `data` stream which resets on
  // refresh — without this, a Start/Confirm button vanishes on reload.
  const extKey = `${storageKey}:ext`;
  const [storedActions, setStoredActions] = useState<ProposedAction[]>([]);
  const [statuses, setStatuses] = useState<Record<string, ActionStatus>>({});
  const [anchors, setAnchors] = useState<Record<string, string>>({});
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const saved = JSON.parse(raw) as Message[];
        if (Array.isArray(saved) && saved.length > 0) setMessages(saved);
      }
    } catch {
      // ignore corrupt storage
    }
    try {
      const rawExt = localStorage.getItem(extKey);
      if (rawExt) {
        const ext = JSON.parse(rawExt) as {
          actions?: ProposedAction[];
          statuses?: Record<string, ActionStatus>;
          anchors?: Record<string, string>;
        };
        if (Array.isArray(ext.actions)) setStoredActions(ext.actions);
        if (ext.statuses) {
          // A write interrupted by the refresh would restore as "working"
          // forever — reset those to pending so the card is actionable again.
          const cleaned = Object.fromEntries(
            Object.entries(ext.statuses).map(([k, v]) => [
              k,
              v === "working" ? "pending" : v,
            ]),
          ) as Record<string, ActionStatus>;
          setStatuses(cleaned);
        }
        if (ext.anchors) setAnchors(ext.anchors);
      }
    } catch {
      // ignore corrupt storage
    }
    setReady(true);
    // Run exactly once per chat (storageKey); setMessages from useChat is stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch {
      // ignore quota / disabled storage
    }
  }, [messages, ready, storageKey]);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(
        extKey,
        JSON.stringify({ actions: storedActions, statuses, anchors }),
      );
    } catch {
      // ignore quota / disabled storage
    }
  }, [storedActions, statuses, anchors, ready, extKey]);

  // Cards arrive in the useChat `data` stream; mirror new ones into
  // `storedActions` (persisted above) so they survive a refresh. `clearChat`
  // empties the list and marks the live ids dismissed so the merge below — which
  // re-reads the still-populated `data` stream — won't resurrect them.
  const [clearedActionIds, setClearedActionIds] = useState<Set<string>>(
    new Set(),
  );
  useEffect(() => {
    const live = readActions(data).filter((a) => !clearedActionIds.has(a.id));
    if (live.length === 0) return;
    setStoredActions((prev) => {
      const byId = new Map(prev.map((a) => [a.id, a]));
      let changed = false;
      for (const a of live) {
        if (!byId.has(a.id)) {
          byId.set(a.id, a);
          changed = true;
        }
      }
      return changed ? Array.from(byId.values()) : prev;
    });
  }, [data, clearedActionIds]);
  const actions = storedActions;
  const setStatus = (id: string, s: ActionStatus) =>
    setStatuses((prev) => ({ ...prev, [id]: s }));

  // Anchor each proposed-action card to the message it appeared after, so it
  // stays in place in the transcript instead of jumping to the bottom. useChat
  // can swap the streaming message's id when it finalizes, so we re-anchor any
  // anchor that points at a now-missing message to the latest message — this
  // self-heals during streaming and then stays put on later turns. (`anchors`
  // state is declared above so it can be restored from localStorage.)
  useEffect(() => {
    const lastId = messages[messages.length - 1]?.id;
    if (!lastId) return;
    const present = new Set(messages.map((m) => m.id));
    setAnchors((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const a of actions) {
        const cur = next[a.id];
        if ((!cur || !present.has(cur)) && cur !== lastId) {
          next[a.id] = lastId;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [actions, messages]);

  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, actions]);

  async function confirm(a: ProposedAction) {
    // Navigation actions (start assessment) just route — nothing to write.
    if (a.href) {
      setStatus(a.id, "done");
      router.push(a.href);
      return;
    }
    if (!a.endpoint) return;
    const method = a.method ?? "POST";
    setStatus(a.id, "working");
    try {
      const res = await fetch(a.endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        // DELETE carries no body.
        ...(method === "POST" ? { body: JSON.stringify(a.payload ?? {}) } : {}),
      });
      if (!res.ok) {
        setStatus(a.id, "error");
        // Surface a specific server message (e.g. duplicate pet name) when present.
        const msg = await res
          .json()
          .then((b) => (b && typeof b.error === "string" ? b.error : null))
          .catch(() => null);
        toast.error(msg ?? "Could not complete that. Please try again.");
        return;
      }
      setStatus(a.id, "done");
      toast.success(
        a.kind === "cancel_appointment"
          ? "Appointment cancelled."
          : a.kind === "create_pet"
            ? `${a.petName} added!`
            : "Saved to the record.",
      );
      router.refresh();
    } catch {
      setStatus(a.id, "error");
      toast.error("Network error — please try again.");
    }
  }

  // Wipe the conversation on this device: reset to just the greeting, drop the
  // stored cards/statuses/anchors, and clear the saved transcript. The live
  // `data` stream can't be emptied, so we also mark its current action ids
  // dismissed (clearedActionIds) — the merge effect skips them, so they don't
  // get re-stored.
  function clearChat() {
    setMessages(
      greeting
        ? [{ id: "greeting", role: "assistant", content: greeting }]
        : [],
    );
    setClearedActionIds((prev) => {
      const next = new Set(prev);
      for (const a of readActions(data)) next.add(a.id);
      return next;
    });
    setStoredActions([]);
    setStatuses({});
    setAnchors({});
    try {
      localStorage.removeItem(storageKey);
      localStorage.removeItem(extKey);
    } catch {
      // ignore
    }
  }

  // Show the clear button once there's a real conversation (more than the
  // initial greeting).
  const hasConversation = messages.some((m) => m.id !== "greeting");

  const liveActions = actions.filter(
    (a) => (statuses[a.id] ?? "pending") !== "cancelled",
  );
  // Pin each card under the message it followed. If that message id is no longer
  // present (useChat can swap the streaming message's id when it finalizes),
  // fall back to rendering at the bottom so a card NEVER vanishes.
  const msgIds = new Set(messages.map((m) => m.id));
  const actionsByAnchor = new Map<string, ProposedAction[]>();
  const unanchored: ProposedAction[] = [];
  for (const a of liveActions) {
    const anchor = anchors[a.id];
    if (anchor && msgIds.has(anchor)) {
      const list = actionsByAnchor.get(anchor) ?? [];
      list.push(a);
      actionsByAnchor.set(anchor, list);
    } else {
      unanchored.push(a);
    }
  }

  function renderCard(a: ProposedAction) {
    const status = statuses[a.id] ?? "pending";
    const done = status === "done";
    const isStart = a.kind === "start_assessment";
    const isCancel = a.kind === "cancel_appointment";
    return (
      <div
        key={a.id}
        className={cn(
          "rounded-2xl border border-dashed p-3 text-sm",
          done ? "opacity-70" : "bg-accent/40",
        )}
      >
        <div className="flex items-start gap-2">
          <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          <p className="font-medium">{a.summary}</p>
        </div>
        {done ? (
          <p className="mt-2 text-xs text-muted-foreground">
            {isStart ? "Opening…" : isCancel ? "Cancelled ✓" : "Saved ✓"}
          </p>
        ) : (
          <div className="mt-2 flex gap-2">
            <Button
              size="sm"
              variant={isCancel ? "destructive" : "default"}
              disabled={status === "working"}
              onClick={() => confirm(a)}
            >
              {isStart ? (
                <>
                  <ArrowRight className="size-4" aria-hidden /> Start
                </>
              ) : (
                <>
                  <Check className="size-4" aria-hidden />{" "}
                  {status === "working"
                    ? "Working…"
                    : isCancel
                      ? "Confirm cancel"
                      : "Confirm"}
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={status === "working"}
              onClick={() => setStatus(a.id, "cancelled")}
            >
              <X className="size-4" aria-hidden /> Cancel
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {hasConversation && (
        <div className="flex justify-end">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-xs text-muted-foreground"
            onClick={clearChat}
            disabled={isLoading}
          >
            <Trash2 className="size-3.5" aria-hidden /> Clear chat
          </Button>
        </div>
      )}
      <div
        className="flex-1 space-y-3 overflow-y-auto rounded-2xl border bg-background/50 p-3"
        aria-live="polite"
      >
        {messages.length === 0 && !greeting && (
          <p className="text-sm text-muted-foreground">
            Ask me anything about {petName ? `${petName}'s` : "your pets'"} care,
            or tell me what to record.
          </p>
        )}
        {messages.map((m) => (
          <div key={m.id} className="space-y-3">
            <div
              className={cn(
                "max-w-[88%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap",
                m.role === "user"
                  ? "ml-auto bg-primary text-primary-foreground"
                  : "bg-muted",
              )}
            >
              {m.role === "assistant" ? cleanAiText(m.content) : m.content}
            </div>
            {/* Proposed writes appear right after the turn that suggested them. */}
            {(actionsByAnchor.get(m.id) ?? []).map(renderCard)}
          </div>
        ))}

        {unanchored.map(renderCard)}

        {isLoading && (
          <div className="w-fit rounded-2xl bg-muted px-3 py-2 text-sm text-muted-foreground">
            Thinking…
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        {/* Input stays enabled while the AI replies so it keeps focus after
            Enter — the owner can type the next message without re-clicking. */}
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder={inputPlaceholder ?? "Type a message…"}
          aria-label="Message the assistant"
        />
        <Button type="submit" disabled={isLoading || input.trim().length === 0}>
          {isLoading ? "…" : "Send"}
        </Button>
      </form>
    </div>
  );
}
