'use client';

import { useState } from 'react';
import { AlertTriangle, Download } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useOnboardingStore } from '@/store/onboarding';
import { useProgressStore } from '@/store/progress';
import { fetchStudyDays } from '@/lib/supabase/activity';
import { fetchConversationSummaries } from '@/lib/supabase/simulator';
import { clearDeviceData } from '@/lib/account/deviceData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Self-service data export and account deletion. Deletion is a two-step confirm (not a native
// `confirm()` dialog, so it matches the rest of the app's UI) and calls a server route that
// re-verifies the caller's own session before touching anything — see /api/account/delete.
export function DangerZoneCard() {
  const user = useAuthStore((s) => s.user);
  const userName = useOnboardingStore((s) => s.userName);
  const cards = useProgressStore((s) => s.cards);
  const [exporting, setExporting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function exportData() {
    if (!user) return;
    setExporting(true);
    try {
      const [studyDays, conversations] = await Promise.all([
        fetchStudyDays(user.id),
        fetchConversationSummaries(user.id),
      ]);
      const payload = {
        exportedAt: new Date().toISOString(),
        profile: {
          name: userName,
          email: user.email,
          phone: user.phone,
          createdAt: user.createdAt,
          lastSignInAt: user.lastSignInAt,
        },
        flashcards: Object.values(cards),
        studyDays,
        simulatorConversations: conversations,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'hanazono-data.json';
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  async function deleteAccount() {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch('/api/account/delete', { method: 'POST' });
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? 'Could not delete your account.');
      }
      useAuthStore.getState().setUser(null);
      clearDeviceData();
      window.location.href = '/';
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
      setDeleting(false);
    }
  }

  return (
    <Card className="border-red-500/40 bg-red-50/40 dark:border-red-500/30 dark:bg-red-950/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle
            className="h-4 w-4 text-red-600 dark:text-red-400"
            aria-hidden="true"
          />
          Danger zone
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Export my data</p>
            <p className="text-xs text-muted-foreground">
              Download everything saved to your account as a JSON file.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer gap-2"
            loading={exporting}
            onClick={exportData}
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
        </div>

        <div className="h-px bg-border" />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Delete my account</p>
            <p className="text-xs text-muted-foreground">
              Permanently deletes your saved practice data, conversations and sign-in.
              This can&apos;t be undone.
            </p>
          </div>
          {confirming ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer"
                onClick={() => setConfirming(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="cursor-pointer bg-red-600 text-white hover:bg-red-700"
                loading={deleting}
                onClick={deleteAccount}
              >
                Confirm delete
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer bg-white border-red-500/50 text-red-600"
              onClick={() => setConfirming(true)}
            >
              Delete account
            </Button>
          )}
        </div>
        {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
      </CardContent>
    </Card>
  );
}
