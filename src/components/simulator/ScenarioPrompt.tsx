import { Scenario } from '@/types';
import { getRoleForScenario } from '@/lib/simulator/prompts';

export function ScenarioPrompt({ scenario }: { scenario: Scenario }) {
  return (
    <div className="rounded-md border border-border bg-muted/50 px-4 py-2.5 text-sm text-muted-foreground">
      You&apos;re chatting with a{' '}
      <span className="font-medium text-foreground">
        {getRoleForScenario(scenario.slug)}
      </span>
      . Reply in Japanese — hints appear under each message.
    </div>
  );
}
