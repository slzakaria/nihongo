import type { ReactNode } from 'react'
import type { Scenario } from '@/types'
import { LinkCard } from '@/components/ui/link-card'
import { scenarioKana } from '@/lib/data/scenarioKana'
import { scenarioAccent, scenarioTint } from '@/lib/data/scenarioAccent'

// Compact scenario tile — about half the height of the full ScenarioCard. Shared by the
// Flashcards and Simulator pickers, which both list every scenario but show different secondary
// info (progress vs. conversation status), passed as `children` and rendered under the title.
// Uses the scenario's icon rather than its illustration — at this size a tiny banner image read as
// noisy, an icon badge reads cleanly and still animates nicely on hover.
// `size="lg"` adds extra padding/a bigger icon for pickers like Simulator whose status text needs
// a bit more breathing room than the plain Flashcards tile.
export function ScenarioMiniCard({
  scenario,
  href,
  index = 0,
  size = 'sm',
  children,
}: {
  scenario: Scenario
  href: string
  index?: number
  size?: 'sm' | 'lg'
  children?: ReactNode
}) {
  const kana = scenarioKana(scenario.slug)
  const lg = size === 'lg'

  return (
    <LinkCard href={href} className="overflow-hidden" index={index}>
      <div className={lg ? 'flex items-center gap-3 p-4' : 'flex items-center gap-3 p-3'}>
        <span
          className={`flex shrink-0 items-center justify-center rounded-lg transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 ${lg ? 'h-12 w-12 text-2xl' : 'h-10 w-10 text-xl'} ${scenarioTint(scenario.slug)}`}
          aria-hidden="true"
        >
          {scenario.icon}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className={`truncate font-semibold ${lg ? 'text-sm' : 'text-xs'} ${scenarioAccent(scenario.slug)}`}>{scenario.label}</h3>
          {kana && (
            <p lang="ja" className={`truncate text-muted-foreground ${lg ? 'text-xs' : 'text-[10px]'}`}>
              {kana}
            </p>
          )}
        </div>
      </div>
      {children && <div className={lg ? 'px-4 pb-3.5' : 'px-3 pb-2.5'}>{children}</div>}
    </LinkCard>
  )
}
