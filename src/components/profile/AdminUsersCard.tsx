'use client';

import { useEffect, useState } from 'react';
import {
  Bookmark,
  ChartNoAxesCombined,
  Clock,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import type { AdminDashboardSummary, AdminUserRow } from '@/app/api/admin/users/route';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AdminDashboardData {
  users: AdminUserRow[];
  summary: AdminDashboardSummary;
}

function formatDate(value: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function AdminUsersCard() {
  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/admin/users')
      .then(async (res) => {
        if (!res.ok)
          throw new Error(
            (await res.json().catch(() => null))?.error ?? 'Failed to load users',
          );
        return res.json() as Promise<AdminDashboardData>;
      })
      .then((data) => {
        if (!cancelled) setDashboard(data);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const users = dashboard?.users;
  const summary = dashboard?.summary;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
          Admin — all users
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        {!error && !users && (
          <p className="text-sm text-muted-foreground">Loading users…</p>
        )}
        {users && users.length === 0 && (
          <p className="text-sm text-muted-foreground">No users yet.</p>
        )}
        {summary && (
          <>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
              <MetricTile
                label="Study-active · 7d"
                value={summary.activeUsers7d}
                detail={`${summary.activeUsers30d} in 30 days`}
              />
              <MetricTile
                label="New users · 30d"
                value={summary.newUsers30d}
                detail={`${summary.newUsers7d} this week · ${summary.totalUsers} total`}
                icon={<ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />}
              />
              <MetricTile
                label="Saved phrases"
                value={summary.bookmarks}
                detail={`${summary.usersWithBookmarks} users saved phrases`}
                icon={<Bookmark className="h-3.5 w-3.5" aria-hidden="true" />}
              />
              <MetricTile
                label="Cards due now"
                value={summary.dueCards}
                detail={`${summary.learningCards} in Again/Hard loops`}
                icon={<Clock className="h-3.5 w-3.5" aria-hidden="true" />}
              />
              <MetricTile
                label="Simulator turns"
                value={summary.simulatorTurns}
                detail="User messages, not conversation rows"
                icon={<MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />}
              />
              <MetricTile
                label="SRS ratings logged"
                value={Object.values(summary.ratings).reduce(
                  (sum, count) => sum + count,
                  0,
                )}
                detail="Tracked after migration"
                icon={<ChartNoAxesCombined className="h-3.5 w-3.5" aria-hidden="true" />}
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <section className="rounded-lg border border-border p-4">
                <h3 className="text-sm font-semibold">Learning flow</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Scenario-user pairs with completion, flashcard reviews, and simulator
                  use for the same scenario. This is activity-based; it does not prove
                  order or track CTA clicks.
                </p>
                <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                  <FunnelStep
                    label="Scenario completed"
                    value={summary.flow.completedScenarioPairs}
                  />
                  <FunnelStep
                    label="Flashcards reviewed"
                    value={summary.flow.flashcardPairs}
                    conversion={summary.flow.completedToFlashcardsPct}
                  />
                  <FunnelStep
                    label="Simulator used"
                    value={summary.flow.simulatorPairs}
                    conversion={summary.flow.flashcardsToSimulatorPct}
                  />
                </div>
              </section>

              <section className="rounded-lg border border-border p-4">
                <h3 className="text-sm font-semibold">Flashcard ratings</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  New rating breakdown is collected from the date this migration is
                  applied; older reviews cannot be split by rating.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <RatingCount label="Again" value={summary.ratings.again} />
                  <RatingCount label="Hard" value={summary.ratings.hard} />
                  <RatingCount label="Good" value={summary.ratings.good} />
                  <RatingCount label="Easy" value={summary.ratings.easy} />
                </div>
              </section>
            </div>

            <section>
              <h3 className="text-sm font-semibold">Scenario engagement · top 5</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Exploration, review, and simulator counts are grouped by scenario.
              </p>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-160 text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="py-2 pr-3 font-medium">Scenario</th>
                      <th className="py-2 pr-3 font-medium">Started</th>
                      <th className="py-2 pr-3 font-medium">Completed</th>
                      <th className="py-2 pr-3 font-medium">Flashcard users</th>
                      <th className="py-2 pr-3 font-medium">Simulator users</th>
                      <th className="py-2 pr-3 font-medium">Reviews</th>
                      <th className="py-2 font-medium">Accuracy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.scenarios.slice(0, 5).map((scenario) => (
                      <tr
                        key={scenario.slug}
                        className="border-b border-border last:border-0"
                      >
                        <td className="py-2 pr-3">{scenario.label}</td>
                        <td className="py-2 pr-3">{scenario.usersStarted}</td>
                        <td className="py-2 pr-3">{scenario.usersCompleted}</td>
                        <td className="py-2 pr-3">{scenario.flashcardUsers}</td>
                        <td className="py-2 pr-3">{scenario.simulatorUsers}</td>
                        <td className="py-2 pr-3">{scenario.reviews}</td>
                        <td className="py-2">
                          {scenario.accuracyPct === null
                            ? '—'
                            : `${scenario.accuracyPct}%`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {users && users.length > 0 && (
          <>
            <ul className="flex flex-col gap-3 lg:hidden">
              {users.map((u) => (
                <li
                  key={u.id}
                  className="rounded-lg border border-border bg-background/50 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{u.name || '—'}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                      {u.studyStreak} day streak
                    </span>
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                    <div>
                      <dt className="text-muted-foreground">Last sign-in</dt>
                      <dd className="font-medium">{formatDate(u.lastSignInAt)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Days studied</dt>
                      <dd className="font-medium">{u.studyDays}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Scenarios</dt>
                      <dd
                        className="font-medium"
                        title={u.completedScenarios.join(', ') || undefined}
                      >
                        {u.completedScenarios.length}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Flashcards</dt>
                      <dd className="font-medium">{u.flashcardsCompleted}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Accuracy</dt>
                      <dd className="font-medium">
                        {u.accuracyPct === null ? '—' : `${u.accuracyPct}%`}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Bookmarks</dt>
                      <dd className="font-medium">{u.bookmarks}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Conversations</dt>
                      <dd className="font-medium">{u.conversations}</dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>

            <div className="hidden min-w-0 lg:block">
              <table className="w-full table-fixed text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="py-2 pr-3 font-medium">Name</th>
                    <th className="py-2 pr-3 font-medium">Sign-in</th>
                    <th className="py-2 pr-3 font-medium">Days studied</th>
                    <th className="py-2 pr-3 font-medium">Scenarios</th>
                    <th className="py-2 pr-3 font-medium">Flashcards</th>
                    <th className="py-2 pr-3 font-medium">Accuracy</th>
                    <th className="py-2 pr-3 font-medium">Bookmarks</th>
                    <th className="py-2 font-medium">Conversations</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-border last:border-0">
                      <td className="break-words py-2 pr-3">{u.name || '—'}</td>

                      <td className="py-2 pr-3 text-xs text-muted-foreground">
                        {formatDate(u.lastSignInAt)}
                      </td>
                      <td className="py-2 pr-3">{u.studyDays}</td>
                      <td className="py-2 pr-3">
                        <span
                          className="cursor-help underline decoration-dotted underline-offset-2"
                          title={u.completedScenarios.join(', ') || undefined}
                        >
                          {u.completedScenarios.length}
                        </span>
                      </td>
                      <td className="py-2 pr-3">{u.flashcardsCompleted}</td>
                      <td className="py-2 pr-3">
                        {u.accuracyPct === null ? '—' : `${u.accuracyPct}%`}
                      </td>
                      <td className="py-2 pr-3">{u.bookmarks}</td>
                      <td className="py-2">{u.conversations}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function MetricTile({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: number;
  detail: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-background/50 p-3">
      <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold">{value.toLocaleString()}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}

function FunnelStep({
  label,
  value,
  conversion,
}: {
  label: string;
  value: number;
  conversion?: number | null;
}) {
  return (
    <div className="rounded-md bg-muted/60 p-2">
      <p className="text-lg font-semibold">{value.toLocaleString()}</p>
      <p className="text-[11px] leading-tight text-muted-foreground">{label}</p>
      {conversion !== undefined && (
        <p className="mt-1 text-[10px] text-muted-foreground">
          {conversion === null ? '—' : `${conversion}% from prior step`}
        </p>
      )}
    </div>
  );
}

function RatingCount({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-muted/60 p-2 text-center">
      <p className="text-lg font-semibold">{value.toLocaleString()}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
