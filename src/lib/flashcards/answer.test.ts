import { describe, expect, it } from 'vitest'
import { isAnswerCorrect } from './answer'

const target = { japanese: 'ありがとうございます', kanji: '有難うございます', romaji: 'Arigatou gozaimasu' }

describe('isAnswerCorrect', () => {
  it('accepts the hiragana form', () => {
    expect(isAnswerCorrect('ありがとうございます', target)).toBe(true)
  })

  it('accepts romaji regardless of case and spacing', () => {
    expect(isAnswerCorrect('arigatou  gozaimasu', target)).toBe(true)
  })

  it('accepts the kanji form', () => {
    expect(isAnswerCorrect('有難うございます', target)).toBe(true)
  })

  it('rejects a different phrase', () => {
    expect(isAnswerCorrect('すみません', target)).toBe(false)
  })

  it('rejects an empty answer', () => {
    expect(isAnswerCorrect('   ', target)).toBe(false)
  })
})
