import { CURRENT_WORD_LENGTH } from '../constants/gameRules'
import { LetterTile } from './LetterTile'

interface EmptyGuessRowProps {
  attemptNumber: number
}

export function EmptyGuessRow({ attemptNumber }: EmptyGuessRowProps) {
  return (
    <div
      className="guess-row guess-row--empty"
      role="row"
      aria-label={`${attemptNumber}. tahmin hakkı boş`}
    >
      {Array.from({ length: CURRENT_WORD_LENGTH }, (_, index) => (
        <LetterTile
          key={`empty-${attemptNumber}-${index}`}
          letter=""
          state="empty"
          index={index}
          label={`${attemptNumber}. tahmin hakkının ${index + 1}. kutusu boş`}
        />
      ))}
    </div>
  )
}
