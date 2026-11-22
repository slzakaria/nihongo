// Shared bilingual section header used across the landing page.
export function SectionHeader({
  kicker,
  kickerKana,
  title,
  titleKana,
  description,
}: {
  kicker: string;
  kickerKana: string;
  title: string;
  titleKana: string;
  description?: string;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground">{kicker}</p>
      <h2 className="text-xl font-semibold">{title}</h2>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      <p className="text-sm font-medium">
        <span lang="ja" className="kana-text text-[0.9em] leading-snug">
          {kickerKana}
        </span>
      </p>
      <p className="text-xl font-semibold">
        <span lang="ja" className="kana-text text-[0.9em] leading-snug">
          {titleKana}
        </span>
      </p>
    </div>
  );
}
