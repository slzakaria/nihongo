"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { dayKey } from "@/lib/activity/studyDays";
import { useStreakStore } from "@/store/streak";
import { upsertProfile } from "@/lib/supabase/profile";

function formatDate(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function addDays(base: Date, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return dayKey(d);
}

// Lets someone "freeze" their streak before a trip or a busy week, so a gap in studying up to the
// chosen date won't make the streak look broken when they come back. Synced to
// profiles.streak_freeze_until (see store/streak.ts) so it follows the account across devices.
export function StreakFreezeCard({ userId }: { userId: string }) {
  const freezeUntil = useStreakStore((s) => s.freezeUntil);
  const setFreezeUntilState = useStreakStore((s) => s.setFreezeUntil);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const today = dayKey();

  const active = Boolean(freezeUntil && freezeUntil >= today);

  async function save() {
    if (!draft) return;
    setSaving(true);
    setFreezeUntilState(draft);
    await upsertProfile(userId, { streak_freeze_until: draft });
    setSaving(false);
  }

  async function clear() {
    setSaving(true);
    setFreezeUntilState(null);
    setDraft("");
    await upsertProfile(userId, { streak_freeze_until: null });
    setSaving(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          Streak protection
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {active && freezeUntil ? (
          <>
            <p className="text-sm text-muted-foreground">
              Your streak is protected through{" "}
              <strong className="text-foreground">
                {formatDate(freezeUntil)}
              </strong>{" "}
              — missed days until then won&apos;t break it.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-fit cursor-pointer"
              loading={saving}
              onClick={clear}
            >
              Remove freeze
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Going away? Freeze your streak so a few missed days don&apos;t
              reset it.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="date"
                min={today}
                max={addDays(new Date(), 30)}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground"
              />
              <Button
                size="sm"
                className="cursor-pointer"
                disabled={!draft}
                loading={saving}
                onClick={save}
              >
                Freeze streak
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
