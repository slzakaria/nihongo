import { cn } from "@/lib/utils";

// Uploaded picture when there is one, otherwise the first letter of the name or email
export function Avatar({
  url,
  label,
  className,
}: {
  url: string | null | undefined;
  label: string;
  className?: string;
}) {
  const initial = label.trim().charAt(0).toUpperCase() || "?";
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt=""
        className={cn("shrink-0 rounded-full object-cover", className)}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-card font-semibold text-foreground",
        className,
      )}
    >
      {initial}
    </span>
  );
}
