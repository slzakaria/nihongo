// Japanese answers are compared as hiragana, so typing katakana or hiragana both count
function toHiragana(text: string): string {
  return text.replace(/[ァ-ヶ]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0x60))
}

export function normalizeAnswer(text: string): string {
  return toHiragana(
    text
      .normalize('NFKC')
      .toLowerCase()
      .replace(/[\s\p{P}]/gu, '')
      .replace(/[āēīōū]/g, ch => ({ ā: 'a', ē: 'e', ī: 'i', ō: 'o', ū: 'u' })[ch] ?? ch)
  )
}

// Accepts the phrase in hiragana, kanji, or romaji (any spacing, punctuation or macron form)
export function isAnswerCorrect(
  input: string,
  target: { japanese: string; kanji?: string; romaji: string }
): boolean {
  const typed = normalizeAnswer(input)
  if (!typed) return false
  return [target.japanese, target.kanji ?? '', target.romaji].some(
    option => option && normalizeAnswer(option) === typed
  )
}
