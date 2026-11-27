'use client';

import { useContentStore } from '@/lib/data/content';
import { groupScenarios } from '@/lib/data/scenarioGroups';
import { ScenarioCard } from '@/components/scenarios/ScenarioCard';
import { PageHeader } from '@/components/layout/PageHeader';
import { BilingualText } from '@/components/layout/BilingualText';
import { SearchTrigger } from '@/components/search/SearchTrigger';

export default function ScenariosPage() {
  const scenarios = useContentStore((s) => s.content.phrases);
  const { groups, ungrouped, displayIndex } = groupScenarios(scenarios);

  const renderScenarioGrid = (items: typeof scenarios) => (
    <div className="grid grid-cols-2 gap-4 min-[480px]:grid-cols-3">
      {items.map((scenario) => {
        const index = displayIndex.get(scenario.slug) ?? 0;
        return (
          <ScenarioCard
            key={scenario.slug}
            scenario={scenario}
            index={index}
            eager={index < 3}
          />
        );
      })}
    </div>
  );

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6">
      <PageHeader
        title="Scenarios"
        titleKana="シナリオ"
        description="Pick a situation to review its phrases."
        descriptionKana="ばめんをえらんで、フレーズをふくしゅうしましょう。"
      >
        <SearchTrigger />
      </PageHeader>

      {groups.map((group) => (
        <section key={group.title} className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">
            <BilingualText english={group.title} japanese={group.titleKana} />
          </h2>
          {renderScenarioGrid(group.scenarios)}
        </section>
      ))}
      {ungrouped.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">
            <BilingualText english="More scenarios" japanese="そのほかのシナリオ" />
          </h2>
          {renderScenarioGrid(ungrouped)}
        </section>
      )}
    </div>
  );
}
