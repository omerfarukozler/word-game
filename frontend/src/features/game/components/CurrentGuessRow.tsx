import { CURRENT_WORD_LENGTH } from '../constants/gameRules'
import { LetterTile } from './LetterTile'

interface CurrentGuessRowProps {
  currentGuess: string
  isSubmitting: boolean
  shakeToken: number
}

export function CurrentGuessRow({
  currentGuess,
  isSubmitting,
  shakeToken,
}: CurrentGuessRowProps) {
  const letters = Array.from(
    { length: CURRENT_WORD_LENGTH },
    (_, index) => currentGuess[index] ?? '',
  )

  return (
    <div
      key={shakeToken}
      className={`guess-row current-guess-row${shakeToken > 0 ? ' current-guess-row--shake' : ''}`}
      role="row"
      aria-label="Aktif tahmin satırı"
    >
      {letters.map((letter, index) => (
        <LetterTile
          key={`current-${index}`}
          letter={letter}
          state={isSubmitting ? 'submitting' : letter ? 'filled' : 'empty'}
          index={index}
        />
      ))}
    </div>
  )
}
