import type { GameGuess } from '../types'
import { CurrentGuessRow } from './CurrentGuessRow'
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
  return (
    <section className="game-panel game-board" aria-labelledby="game-board-title">
      <div>
        <p className="eyebrow">Tahminlerin</p>
        <h2 id="game-board-title">Oyun tahtası</h2>
      </div>
      <div className="guess-grid" role="grid" aria-label="Kendi tahmin tahtan">
        {guesses.map((guess) => (
          <GuessRow guess={guess} isOwnGuess key={guess.id} />
        ))}
        {!isCompleted && (
          <CurrentGuessRow
            currentGuess={currentGuess}
            isSubmitting={isSubmitting}
            shakeToken={shakeToken}
          />
        )}
      </div>
    </section>
  )
}
