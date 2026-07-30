import { CURRENT_WORD_LENGTH } from '../constants/gameRules'
import type { GameGuess } from '../types'
import { getLetterTileState } from '../utils/letterTileState'
import { LetterTile } from './LetterTile'

interface GuessRowProps {
  guess: GameGuess
  isOwnGuess: boolean
}

function getEvaluationLabel(state: string) {
  switch (state) {
    case 'correct':
      return 'doğru yerde'
    case 'present':
      return 'kelimede var fakat yanlış yerde'
    case 'absent':
      return 'kelimede yok'
    default:
      return 'değerlendirildi'
  }
}

export function GuessRow({ guess, isOwnGuess }: GuessRowProps) {
  const letters = isOwnGuess
    ? Array.from(guess.word)
    : Array(CURRENT_WORD_LENGTH).fill('')

  return (
    <div
      className={`guess-row${guess.isCorrect ? ' guess-row--correct' : ''}`}
      role="row"
      aria-label={`${guess.attemptNumber}. tahmin${isOwnGuess ? '' : ', rakip tahmini gizli'}`}
    >
      {letters.map((letter, index) => {
        const evaluation = guess.evaluation[index]
        const state =
          isOwnGuess && evaluation ? getLetterTileState(evaluation.status) : 'masked'

        return (
          <LetterTile
            key={`${guess.id}-${index}`}
            letter={isOwnGuess ? letter : ''}
            state={state}
            index={index}
            label={
              isOwnGuess && evaluation
                ? `${letter} harfi, ${evaluation.position + 1}. pozisyon, ${getEvaluationLabel(state)}`
                : `Rakip ${guess.attemptNumber}. tahmininin ${index + 1}. harfi gizli`
            }
          />
        )
      })}
    </div>
  )
}
