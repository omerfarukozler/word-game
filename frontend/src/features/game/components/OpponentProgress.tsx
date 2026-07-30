import type { RoomPlayer } from '../../../types/domain'
import type { GameGuess } from '../types'
import { GuessRow } from './GuessRow'

interface OpponentProgressProps {
  opponent: RoomPlayer | null
  guesses: GameGuess[]
}

export function OpponentProgress({ opponent, guesses }: OpponentProgressProps) {
  return (
    <section className="game-panel opponent-panel" aria-labelledby="opponent-title">
      <div>
        <p className="eyebrow">Rakip</p>
        <h2 id="opponent-title">{opponent?.nickname ?? 'Rakip'}</h2>
      </div>
      {guesses.length === 0 ? (
        <p>Rakibin henüz tahmin göndermedi.</p>
      ) : (
        <div className="guess-grid" role="grid" aria-label="Rakip tahmin ilerlemesi">
          {guesses.map((guess) => (
            <GuessRow guess={guess} isOwnGuess={false} key={guess.id} />
          ))}
        </div>
      )}
    </section>
  )
}
