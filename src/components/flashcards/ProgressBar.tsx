import { Progress } from '@/components/ui/progress'

export function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = total === 0 ? 0 : (current / total) * 100

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Card {Math.min(current + 1, total)} / {total}
        </span>
      </div>
      <Progress value={pct} />
    </div>
  )
}
