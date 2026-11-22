'use client';

import { useState, useRef, useEffect } from 'react';
import { Monitor, Moon, Settings, Sun } from 'lucide-react';
import { useSettingsStore } from '@/store/settings';
import { useThemeStore, type Theme } from '@/store/theme';
import { RomajiMode, TtsSpeed } from '@/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const modes: { value: RomajiMode; label: string; hint: string }[] = [
  {
    value: 'always',
    label: 'Always show',
    hint: 'Romaji visible at all times',
  },
  {
    value: 'reveal',
    label: 'Reveal on tap',
    hint: 'Tap a phrase to show romaji',
  },
  { value: 'never', label: 'Never show', hint: 'Kana/kanji only' },
];

const speeds: { value: TtsSpeed; label: string }[] = [
  { value: 1, label: '1×' },
  { value: 0.75, label: '0.75×' },
  { value: 0.5, label: '0.50×' },
];

const themes: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

export function SettingsMenu({ onOpen }: { onOpen?: () => void }) {
  const [open, setOpen] = useState(false);
  const romajiMode = useSettingsStore((s) => s.romajiMode);
  const setRomajiMode = useSettingsStore((s) => s.setRomajiMode);
  const ttsSpeed = useSettingsStore((s) => s.ttsSpeed);
  const setTtsSpeed = useSettingsStore((s) => s.setTtsSpeed);
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Settings"
        onClick={() => {
          if (!open) onOpen?.();
          setOpen(!open);
        }}
        className="cursor-pointer"
      >
        <Settings className="h-4 w-4" />
      </Button>

      {open && (
        <div className="absolute right-0 top-full z-10 mt-2 w-56 rounded-md border border-border bg-card p-2 shadow-md">
          <p className="px-2 py-1 text-xs font-medium text-muted-foreground">Theme</p>
          <div className="flex gap-1 px-1 pb-2">
            {themes.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => {
                    setTheme(t.value);
                    setOpen(false);
                  }}
                  className={cn(
                    'flex flex-1 flex-col items-center gap-1 rounded-md py-1.5 text-xs hover:bg-muted',
                    theme === t.value &&
                      'bg-primary/15 font-semibold text-foreground hover:bg-primary/15',
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {t.label}
                </button>
              );
            })}
          </div>

          <div className="my-1 h-px bg-border" />

          <p className="px-2 py-1 text-xs font-medium text-muted-foreground">Romaji</p>
          {modes.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => {
                setRomajiMode(m.value);
                setOpen(false);
              }}
              className={cn(
                'flex w-full flex-col items-start rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted',
                romajiMode === m.value &&
                  'bg-primary/15 font-semibold text-foreground hover:bg-primary/15',
              )}
            >
              <span>{m.label}</span>
              <span className="text-xs opacity-70">{m.hint}</span>
            </button>
          ))}

          <div className="my-1 h-px bg-border" />

          <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
            Speech speed
          </p>
          <div className="flex gap-1 px-1 pb-1">
            {speeds.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => {
                  setTtsSpeed(s.value);
                  setOpen(false);
                }}
                className={cn(
                  'flex-1 rounded-md py-1.5 text-xs hover:bg-muted',
                  ttsSpeed === s.value &&
                    'bg-primary/15 font-semibold text-foreground hover:bg-primary/15',
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
