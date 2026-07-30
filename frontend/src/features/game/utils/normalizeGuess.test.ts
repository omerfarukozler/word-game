import { describe, expect, it } from 'vitest'
import { normalizeGuessLetter, normalizeGuessWord } from './normalizeGuess'

describe('normalizeGuess', () => {
  it('normalizes lowercase and Turkish letters with tr-TR uppercase rules', () => {
    expect(normalizeGuessLetter('i')).toBe('İ')
    expect(normalizeGuessLetter('ş')).toBe('Ş')
    expect(normalizeGuessWord('çiğde')).toBe('ÇİĞDE')
  })

  it('rejects invalid characters and caps word length', () => {
    expect(normalizeGuessLetter('1')).toBeNull()
    expect(normalizeGuessWord('a1b2c3d4e5f')).toBe('ABCDE')
  })
})
