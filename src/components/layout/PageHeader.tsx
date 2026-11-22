import type { ReactNode } from 'react';
import { CherryBlossom } from '@/components/marketing/CherryBlossom';
import { cn } from '@/lib/utils';

// Shared page header with the landing page's theme-matched blossom artwork.
export function PageHeader({
  title,
  titleKana,
  description,
  descriptionKana,
  children,
  className,
}: {
  title: ReactNode;
  titleKana?: string;
  description?: ReactNode;
  descriptionKana?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        'hero-banner relative overflow-hidden rounded-2xl p-6 sm:p-8',
        className,
      )}
    >
      <div className="relative z-10 flex flex-col gap-2">
        <h1 className="hero-page-title text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h1>
        {description && <p className="hero-page-description max-w-2xl">{description}</p>}
        {titleKana && (
          <p className="hero-page-title text-2xl font-semibold tracking-tight sm:text-3xl">
            <span lang="ja" className="kana-text text-[0.9em] leading-snug">
              {titleKana}
            </span>
          </p>
        )}
        {descriptionKana && (
          <p className="hero-page-description max-w-2xl">
            <span lang="ja" className="kana-text text-[0.9em] leading-snug">
              {descriptionKana}
            </span>
          </p>
        )}
      </div>
      {children && <div className="relative z-10 mt-4">{children}</div>}
      <CherryBlossom className="hero-page-art" />
    </header>
  );
}
