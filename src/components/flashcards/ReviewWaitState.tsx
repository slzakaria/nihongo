import { SyncStatus } from '@/components/flashcards/SyncStatus';
import { Button } from '@/components/ui/button';

export function ReviewWaitState({
  remainingMs,
  onPracticeAnyway,
}: {
  remainingMs: number;
  onPracticeAnyway: () => void;
}) {
  const totalSeconds = Math.max(1, Math.ceil(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const countdown =
    minutes > 0
      ? `${minutes}:${seconds.toString().padStart(2, '0')}`
      : `${seconds} seconds`;

  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <SyncStatus />
      <p className="text-lg font-medium">All ready cards are done</p>
      <p className="text-sm text-foreground">
        The next learning card returns in <strong>{countdown}</strong>.
      </p>
      <p className="max-w-md text-sm text-muted-foreground">
        Stay here and it will return automatically. You can also leave; its review time is
        saved.
      </p>
      <Button
        className="mt-2 cursor-pointer"
        variant="secondary"
        onClick={onPracticeAnyway}
      >
        Practice the set anyway
      </Button>
    </div>
  );
}
