'use client';

import { useContentStore } from '@/lib/data/content';
import { ScenarioCard } from '@/components/scenarios/ScenarioCard';
import { PageHeader } from '@/components/layout/PageHeader';
import { BilingualText } from '@/components/layout/BilingualText';
import { SearchTrigger } from '@/components/search/SearchTrigger';

const SCENARIO_GROUPS = [
  {
    title: 'Conversation & everyday language',
    titleKana: 'かいわ・まいにちのことば',
    slugs: [
      'greetings',
      'about-me',
      'small-talk',
      'making-friends',
      'language-barrier',
      'shopkeeper-chat',
      'time-dates',
    ],
  },
  {
    title: 'Food & drink',
    titleKana: 'たべもの・のみもの',
    slugs: [
      'restaurant',
      'konbini-food',
      'supermarket-izakaya',
      'bar-cocktails',
      'all-you-can-eat',
      'vending-machines',
    ],
  },
  {
    title: 'Transport & stays',
    titleKana: 'こうつう・しゅくはく',
    slugs: [
      'airport-arrival',
      'getting-around',
      'directions',
      'shinkansen',
      'bike-rental',
      'hotel',
    ],
  },
  {
    title: 'Shopping & services',
    titleKana: 'かいもの・サービス',
    slugs: [
      'shopping',
      'money-banking',
      'lost-property-post',
      'coin-laundry',
      'apology-repair',
    ],
  },
  {
    title: 'Health & safety',
    titleKana: 'けんこう・あんぜん',
    slugs: ['emergencies', 'pharmacy-health', 'weather-events'],
  },
  {
    title: 'Culture & activities',
    titleKana: 'ぶんか・アクティビティ',
    slugs: [
      'shrine-temple',
      'onsen',
      'sento',
      'karaoke',
      'entertainment-complex',
      'tickets-games',
      'otaku-culture',
      'gym-fitness',
      'hair-salon',
    ],
  },
  {
    title: 'Learning & reference',
    titleKana: 'まなび・さんこう',
    slugs: ['grammar-connectors', 'vocabulary-adjectives'],
  },
] as const;

export default function ScenariosPage() {
  const scenarios = useContentStore((s) => s.content.phrases);
  const groups = SCENARIO_GROUPS.map((group) => ({
    ...group,
    scenarios: group.slugs.flatMap((slug) => {
      const scenario = scenarios.find((item) => item.slug === slug);
      return scenario ? [scenario] : [];
    }),
  })).filter((group) => group.scenarios.length > 0);
  const groupedSlugs = new Set<string>(SCENARIO_GROUPS.flatMap((group) => group.slugs));
  const ungroupedScenarios = scenarios.filter(
    (scenario) => !groupedSlugs.has(scenario.slug),
  );
  const displayOrder = [
    ...groups.flatMap((group) => group.scenarios),
    ...ungroupedScenarios,
  ];
  const displayIndex = new Map(
    displayOrder.map((scenario, index) => [scenario.slug, index]),
  );

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
      {ungroupedScenarios.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">
            <BilingualText english="More scenarios" japanese="そのほかのシナリオ" />
          </h2>
          {renderScenarioGrid(ungroupedScenarios)}
        </section>
      )}
    </div>
  );
}
