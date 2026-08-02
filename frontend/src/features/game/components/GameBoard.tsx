import { MAX_GUESS_ATTEMPTS } from '../constants/gameRules'
import type { GameGuess } from '../types'
import { CurrentGuessRow } from './CurrentGuessRow'
import { EmptyGuessRow } from './EmptyGuessRow'
import { GuessRow } from './GuessRow'

interface GameBoardProps {
  guesses: GameGuess[]
  currentGuess: string
  isSubmitting: boolean
  shakeToken: number
  isCompleted: boolean
}

export function GameBoard({
  guesses,
  currentGuess,
  isSubmitting,
  shakeToken,
  isCompleted,
}: GameBoardProps) {
  const visibleGuesses = guesses.slice(0, MAX_GUESS_ATTEMPTS)
  const shouldShowCurrentGuess =
    !isCompleted && visibleGuesses.length < MAX_GUESS_ATTEMPTS
  const filledRowCount = visibleGuesses.length + (shouldShowCurrentGuess ? 1 : 0)
  const emptyRows = Array.from(
    { length: Math.max(0, MAX_GUESS_ATTEMPTS - filledRowCount) },
    (_, index) => filledRowCount + index + 1,
  )

  return (
    <section className="game-panel game-board" aria-labelledby="game-board-title">
      <div>
        <p className="eyebrow">Tahminlerin</p>
        <h2 id="game-board-title">Oyun tahtası</h2>
      </div>
      <div className="guess-grid" role="grid" aria-label="Kendi tahmin tahtan">
        {visibleGuesses.map((guess) => (
          <GuessRow guess={guess} isOwnGuess key={guess.id} />
        ))}
        {shouldShowCurrentGuess && (
          <CurrentGuessRow
            currentGuess={currentGuess}
            isSubmitting={isSubmitting}
            shakeToken={shakeToken}
          />
        )}
        {emptyRows.map((attemptNumber) => (
          <EmptyGuessRow attemptNumber={attemptNumber} key={`empty-${attemptNumber}`} />
        ))}
      </div>
    </section>
  )
}
