"use client";

import { useState } from "react";
import { useOnboardingStore } from "@/store/onboarding";
import { Button } from "@/components/ui/button";

const inputClass =
  "w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm";
const MAX_NAME_LENGTH = 40;

// Inline name editor shown under the account card's name row
export function NameEditor({ onDone }: { onDone: () => void }) {
  const userName = useOnboardingStore((s) => s.userName);
  const setUserName = useOnboardingStore((s) => s.setUserName);
  const [name, setName] = useState(userName);
  const [error, setError] = useState<string | null>(null);

  function save(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || trimmed.length > MAX_NAME_LENGTH) {
      setError(`Use between 1 and ${MAX_NAME_LENGTH} characters.`);
      return;
    }
    setUserName(trimmed);
    onDone();
  }

  return (
    <form onSubmit={save} className="flex flex-col gap-2 sm:flex-row">
      <input
        autoFocus
        value={name}
        maxLength={MAX_NAME_LENGTH}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        className={inputClass}
      />
      <div className="flex gap-2">
        <Button type="submit" size="sm" className="cursor-pointer">
          Save
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="cursor-pointer"
          onClick={onDone}
        >
          Cancel
        </Button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </form>
  );
}
