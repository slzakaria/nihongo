// Shared 3-part section header used across the landing page: a short kana/English kicker tag,
// a bold title, and a muted description — keeps every section's heading in the same format.
export function SectionHeader({
  kicker,
  title,
  description,
}: {
  kicker: string;
  title: string;
  description?: string;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground">{kicker}</p>
      <h2 className="text-xl font-semibold">{title}</h2>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
