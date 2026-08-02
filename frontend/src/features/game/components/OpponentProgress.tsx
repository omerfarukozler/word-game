import type { RoomPlayer } from '../../../types/domain'
import { MAX_GUESS_ATTEMPTS } from '../constants/gameRules'
import type { GameGuess } from '../types'
import { GuessRow } from './GuessRow'

interface OpponentProgressProps {
  opponent: RoomPlayer | null
  guesses: GameGuess[]
}

export function OpponentProgress({ opponent, guesses }: OpponentProgressProps) {
  const visibleGuesses = guesses.slice(0, MAX_GUESS_ATTEMPTS)
  const latestGuess = visibleGuesses[visibleGuesses.length - 1]
  const latestAttemptNumber = latestGuess?.attemptNumber ?? 0

  return (
    <section className="game-panel opponent-panel" aria-labelledby="opponent-title">
      <div className="opponent-panel__header">
        <p className="eyebrow">Rakip</p>
        <h2 id="opponent-title">{opponent?.nickname ?? 'Rakip'}</h2>
        {latestAttemptNumber > 0 && (
          <span className="opponent-panel__count">{latestAttemptNumber}. tahmin</span>
        )}
      </div>
      {visibleGuesses.length === 0 ? (
        <p>Rakibin henüz tahmin göndermedi.</p>
      ) : (
        <div
          className="opponent-guess-list"
          role="list"
          aria-label="Rakip tahmin ilerlemesi"
        >
          {visibleGuesses.map((guess) => (
            <div
              className="opponent-guess-entry"
              key={guess.id}
              role="listitem"
              aria-label={`Rakip ${guess.attemptNumber}. tahmini`}
            >
              <span className="opponent-guess-entry__index" aria-hidden="true">
                {guess.attemptNumber}
              </span>
              <GuessRow guess={guess} isOwnGuess={false} />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
