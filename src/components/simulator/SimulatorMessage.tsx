'use client';

import { useEffect, useRef } from 'react';
import { ChatMessage } from '@/types';
import { useAudio } from '@/hooks/useAudio';
import { AudioIconButton } from '@/components/phrases/AudioIconButton';
import { cn } from '@/lib/utils';

export function SimulatorMessage({
  message,
  autoPlay,
}: {
  message: ChatMessage;
  autoPlay?: boolean;
}) {
  const isUser = message.role === 'user';
  const hintMatch = message.content.match(/\[HINT:\s*([\s\S]*?)\]\s*$/);
  const mainText = hintMatch
    ? message.content.slice(0, hintMatch.index).trim()
    : message.content;
  const { play, isLoading, isPlaying, disabled } = useAudio();
  const hasAutoPlayed = useRef(false);

  useEffect(() => {
    if (autoPlay && mainText && !hasAutoPlayed.current) {
      hasAutoPlayed.current = true;
      play(mainText);
    }
  }, [autoPlay, mainText, play]);

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'flex max-w-[80%] flex-col gap-1 rounded-lg px-4 py-2.5',
          isUser ? 'bg-primary/15' : 'bg-muted',
        )}
      >
        <div className="flex items-center gap-2">
          <p lang={isUser ? undefined : 'ja'} className="whitespace-pre-wrap text-sm">
            {mainText}
          </p>
          {!isUser && mainText && (
            <AudioIconButton
              isLoading={isLoading}
              isPlaying={isPlaying}
              disabled={disabled}
              onClick={() => play(mainText)}
              className="h-8 w-8 shrink-0"
            />
          )}
        </div>
        {hintMatch && <p className="text-xs italic opacity-80">{hintMatch[1]}</p>}
      </div>
    </div>
  );
}
