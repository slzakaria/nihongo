import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function BilingualText({
  english,
  japanese,
  className,
  japaneseClassName,
}: {
  english: ReactNode;
  japanese: string;
  className?: string;
  japaneseClassName?: string;
}) {
  return (
    <span className={cn('inline-flex min-w-0 flex-col items-start', className)}>
      <span>{english}</span>
      <span
        lang="ja"
        className={cn('kana-text text-[0.9em] leading-snug', japaneseClassName)}
      >
        {japanese}
      </span>
    </span>
  );
}
