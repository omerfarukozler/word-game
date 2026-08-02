export const CURRENT_WORD_LENGTH = 5
export const MAX_GUESS_ATTEMPTS = 6

export const TURKISH_LETTERS = /^[A-ZÇĞİÖŞÜ]$/

export const VIRTUAL_KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'Ğ', 'Ü'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ş', 'İ'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Ö', 'Ç'],
] as const
