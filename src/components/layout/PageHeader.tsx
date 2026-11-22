import type { ReactNode } from "react";
import { CherryBlossom } from "@/components/marketing/CherryBlossom";
import { cn } from "@/lib/utils";

// Shared page header with the landing page's theme-matched blossom artwork.
export function PageHeader({
  title,
  description,
  children,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "hero-banner relative overflow-hidden rounded-2xl p-6 sm:p-8",
        className,
      )}
    >
      <div className="relative z-10 flex flex-col gap-2">
        <h1 className="hero-page-title text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="hero-page-description max-w-2xl">{description}</p>
        )}
      </div>
      {children && <div className="relative z-10 mt-4">{children}</div>}
      <CherryBlossom className="hero-page-art" />
    </header>
  );
}
