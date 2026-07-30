import { CURRENT_WORD_LENGTH, TURKISH_LETTERS } from '../constants/gameRules'

export function normalizeGuessLetter(letter: string): string | null {
  const normalizedLetter = letter.trim().toLocaleUpperCase('tr-TR')

  if (!TURKISH_LETTERS.test(normalizedLetter)) {
    return null
  }

  return normalizedLetter
}

export function normalizeGuessWord(word: string): string {
  return Array.from(word)
    .map((letter) => normalizeGuessLetter(letter))
    .filter((letter): letter is string => letter !== null)
    .join('')
    .slice(0, CURRENT_WORD_LENGTH)
}
