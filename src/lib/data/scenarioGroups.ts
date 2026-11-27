import type { Scenario } from '@/types';

// Shared category grouping used by the Scenarios, Flashcards, and Simulator picker pages, so a
// scenario always sits under the same heading wherever it's listed instead of each page inventing
// its own order. Any scenario not listed here falls into an "ungrouped" bucket the pages append
// as a final "More ..." section, so new scenarios still show up even before they're categorized.
export const SCENARIO_GROUPS = [
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
    slugs: ['airport-arrival', 'getting-around', 'shinkansen', 'bike-rental', 'hotel'],
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

export interface GroupedScenarios {
  title: string;
  titleKana: string;
  scenarios: Scenario[];
}

// Buckets every scenario into its group (in SCENARIO_GROUPS order), plus a trailing "ungrouped"
// list for anything not yet categorized. `displayIndex` gives a stable 0-based position across
// every group combined, so callers can stagger entrance animations / eager-load the first few.
export function groupScenarios(scenarios: Scenario[]): {
  groups: GroupedScenarios[];
  ungrouped: Scenario[];
  displayIndex: Map<string, number>;
} {
  const groups = SCENARIO_GROUPS.map((group) => ({
    title: group.title,
    titleKana: group.titleKana,
    scenarios: group.slugs.flatMap((slug) => {
      const scenario = scenarios.find((item) => item.slug === slug);
      return scenario ? [scenario] : [];
    }),
  })).filter((group) => group.scenarios.length > 0);

  const groupedSlugs = new Set<string>(SCENARIO_GROUPS.flatMap((group) => group.slugs));
  const ungrouped = scenarios.filter((scenario) => !groupedSlugs.has(scenario.slug));

  const displayOrder = [...groups.flatMap((group) => group.scenarios), ...ungrouped];
  const displayIndex = new Map(displayOrder.map((scenario, index) => [scenario.slug, index]));

  return { groups, ungrouped, displayIndex };
}
