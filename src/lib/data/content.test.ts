import { describe, expect, it } from 'vitest';
import { FALLBACK_CONTENT, loadPhraseResponsesFor } from './content';
import phrases from './phrases.json';
import responseMap from './phrase-responses.json';

describe('phrase response loading', () => {
  it('hydrates fallback conversation phrases with their bundled responses', async () => {
    const conversationPhrases = FALLBACK_CONTENT.phrases
      .filter((scenario) => scenario.slug !== 'vocabulary-adjectives')
      .flatMap((scenario) => scenario.phrases);

    const loaded = await loadPhraseResponsesFor(conversationPhrases);

    expect(loaded.every((phrase) => phrase.responses.length > 0)).toBe(true);
  });

  it('keeps vocabulary-only phrases without conversation responses', async () => {
    const vocabularyPhrases = FALLBACK_CONTENT.phrases.find(
      (scenario) => scenario.slug === 'vocabulary-adjectives',
    )!.phrases;

    const loaded = await loadPhraseResponsesFor(vocabularyPhrases);

    expect(loaded.every((phrase) => phrase.responses.length === 0)).toBe(true);
  });

  it('uses pronounceable examples instead of circle placeholders in Japanese text', () => {
    const japaneseText = [
      ...phrases.scenarios.flatMap((scenario) =>
        scenario.phrases.flatMap((phrase) => [phrase.japanese, phrase.kanji ?? '']),
      ),
      ...Object.values(responseMap).flatMap((responses) =>
        responses.flatMap((response) => [
          response.japanese,
          'kanji' in response ? (response.kanji ?? '') : '',
        ]),
      ),
    ];

    expect(japaneseText.filter((text) => /[〇○]/u.test(text))).toEqual([]);
  });
});
