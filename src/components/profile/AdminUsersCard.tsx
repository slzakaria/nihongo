'use client';

import { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import type { AdminUserRow } from '@/app/api/admin/users/route';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function formatDate(value: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Admin-only dashboard listing every signed-up user and their activity. Only ever rendered by the
// profile page for the one admin account — see src/lib/admin.ts — but the real gate is the API
// route itself, which independently re-checks the caller's Clerk session on every request.
export function AdminUsersCard() {
  const [users, setUsers] = useState<AdminUserRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/admin/users')
      .then(async (res) => {
        if (!res.ok)
          throw new Error(
            (await res.json().catch(() => null))?.error ?? 'Failed to load users',
          );
        return res.json() as Promise<{ users: AdminUserRow[] }>;
      })
      .then((data) => {
        if (!cancelled) setUsers(data.users);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
          Admin — all users
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        {!error && !users && (
          <p className="text-sm text-muted-foreground">Loading users…</p>
        )}
        {users && users.length === 0 && (
          <p className="text-sm text-muted-foreground">No users yet.</p>
        )}
        {users && users.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-160 text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">Name</th>
                  <th className="py-2 pr-3 font-medium">Email</th>
                  <th className="py-2 pr-3 font-medium">Joined</th>
                  <th className="py-2 pr-3 font-medium">Last sign-in</th>
                  <th className="py-2 pr-3 font-medium">Streak</th>
                  <th className="py-2 pr-3 font-medium">Days studied</th>
                  <th className="py-2 pr-3 font-medium">Phrases</th>
                  <th className="py-2 pr-3 font-medium">Completed</th>
                  <th className="py-2 font-medium">Convos</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border last:border-0">
                    <td className="py-2 pr-3">{u.name || '—'}</td>
                    <td className="truncate py-2 pr-3 text-muted-foreground">
                      {u.email || '—'}
                    </td>
                    <td className="py-2 pr-3 text-muted-foreground">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="py-2 pr-3 text-muted-foreground">
                      {formatDate(u.lastSignInAt)}
                    </td>
                    <td className="py-2 pr-3">{u.studyStreak}</td>
                    <td className="py-2 pr-3">{u.studyDays}</td>
                    <td className="py-2 pr-3">{u.phrasesReviewed}</td>
                    <td className="py-2 pr-3">
                      {u.completedScenarios.length > 0 ? (
                        <span
                          className="cursor-help underline decoration-dotted underline-offset-2"
                          title={u.completedScenarios.join(', ')}
                        >
                          {u.completedScenarios.length}
                        </span>
                      ) : (
                        0
                      )}
                    </td>
                    <td className="py-2">{u.conversations}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
