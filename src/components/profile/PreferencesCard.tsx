"use client";

import { Monitor, Moon, Settings2, Sun } from "lucide-react";
import { useSettingsStore } from "@/store/settings";
import { useThemeStore, type Theme } from "@/store/theme";
import { RomajiMode, TtsSpeed } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const modes: { value: RomajiMode; label: string; hint: string }[] = [
  {
    value: "always",
    label: "Always show",
    hint: "Romaji visible at all times",
  },
  {
    value: "reveal",
    label: "Reveal on tap",
    hint: "Tap a phrase to show romaji",
  },
  { value: "never", label: "Never show", hint: "Kana/kanji only" },
];

const speeds: { value: TtsSpeed; label: string }[] = [
  { value: 1, label: "1×" },
  { value: 0.75, label: "0.75×" },
  { value: 0.5, label: "0.50×" },
];

const themes: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

// The same controls as the navbar's settings dropdown, laid out inline — handy on the profile
// page without having to hunt for the small gear icon.
export function PreferencesCard() {
  const romajiMode = useSettingsStore((s) => s.romajiMode);
  const setRomajiMode = useSettingsStore((s) => s.setRomajiMode);
  const ttsSpeed = useSettingsStore((s) => s.ttsSpeed);
  const setTtsSpeed = useSettingsStore((s) => s.setTtsSpeed);
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Settings2 className="h-4 w-4" aria-hidden="true" />
          Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-medium text-muted-foreground">Theme</p>
          <div className="flex gap-1.5">
            {themes.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTheme(t.value)}
                  className={cn(
                    "flex flex-1 cursor-pointer flex-col items-center gap-1 rounded-md border border-border py-2 text-xs hover:bg-muted",
                    theme === t.value &&
                      "border-primary bg-primary/15 font-semibold text-foreground",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-medium text-muted-foreground">Romaji</p>
          <div className="flex flex-col gap-1">
            {modes.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setRomajiMode(m.value)}
                className={cn(
                  "flex w-full cursor-pointer flex-col items-start rounded-md border border-border px-3 py-1.5 text-left text-sm hover:bg-muted",
                  romajiMode === m.value &&
                    "border-primary bg-primary/15 font-semibold text-foreground",
                )}
              >
                <span>{m.label}</span>
                <span className="text-xs font-normal opacity-70">{m.hint}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-medium text-muted-foreground">
            Speech speed
          </p>
          <div className="flex gap-1.5">
            {speeds.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setTtsSpeed(s.value)}
                className={cn(
                  "flex-1 cursor-pointer rounded-md border border-border py-1.5 text-xs hover:bg-muted",
                  ttsSpeed === s.value &&
                    "border-primary bg-primary/15 font-semibold text-foreground",
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
