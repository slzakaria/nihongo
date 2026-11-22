import Link from 'next/link';
import type { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// A whole card that links somewhere, with the same hover treatment across the app.
// Pass `index` in a grid to stagger the entrance animation. Pass `onClick` instead of `href`
// for a card that triggers an action (e.g. opening a dialog) rather than navigating.
export function LinkCard({
  href,
  onClick,
  children,
  className,
  index = 0,
}: {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  index?: number;
}) {
  const cardClassName = cn(
    'h-full transition-all group-hover:-translate-y-0.5 group-hover:border-primary group-hover:shadow-md',
    className,
  );

  if (!href) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="group block h-full w-full animate-fade-up cursor-pointer text-left"
        style={{ animationDelay: `${Math.min(index, 12) * 60}ms` }}
      >
        <Card className={cardClassName}>{children}</Card>
      </button>
    );
  }

  return (
    <Link
      href={href}
      className="group block h-full animate-fade-up"
      style={{ animationDelay: `${Math.min(index, 12) * 60}ms` }}
    >
      <Card className={cardClassName}>{children}</Card>
    </Link>
  );
}
