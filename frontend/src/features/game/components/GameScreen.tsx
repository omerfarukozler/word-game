import type { PlayerSession } from '../../../session/playerSessionStorage'
import type { Match, Room } from '../../../types/domain'
import type {
  GuessSubmittedNotification,
  MatchCompletedNotification,
} from '../../../types/realtime'
import { InlineError } from '../../../components/InlineError'
import { GameBoard } from './GameBoard'
import { GameHeader } from './GameHeader'
import { MatchResultPanel } from './MatchResultPanel'
import { OpponentProgress } from './OpponentProgress'
import { VirtualKeyboard } from './VirtualKeyboard'
import type { GameGuess, MatchResult } from '../types'
import { useGameSession } from '../hooks/useGameSession'

interface GameScreenProps {
  room: Room
  match: Match
  session: PlayerSession
  guesses: GameGuess[]
  matchResult: MatchResult | null
  connectionLabel: string
  onGuessSubmitted: (guess: GuessSubmittedNotification) => void
  onMatchCompleted: (notification: MatchCompletedNotification) => void
}

export function GameScreen({
  room,
  match,
  session,
  guesses,
  matchResult,
  connectionLabel,
  onGuessSubmitted,
  onMatchCompleted,
}: GameScreenProps) {
  const gameSession = useGameSession({
    room,
    match,
    session,
    guesses,
    matchResult,
    onGuessSubmitted,
    onMatchCompleted,
  })

  const shouldShowConnectionWarning =
    connectionLabel === 'yeniden bağlanıyor' || connectionLabel === 'bağlantı kurulamadı'

  return (
    <>
      <GameHeader
        room={room}
        match={match}
        players={room.players}
        connectionLabel={connectionLabel}
      />

      {shouldShowConnectionWarning && (
        <p className="connection-note" role="status" aria-live="polite">
          Bağlantı yeniden kuruluyor…
        </p>
      )}

      <div className="game-layout">
        <GameBoard
          guesses={gameSession.ownGuesses}
          currentGuess={gameSession.currentGuess}
          isSubmitting={gameSession.isSubmittingGuess}
          shakeToken={gameSession.shakeToken}
          isCompleted={gameSession.isCompleted}
        />
        <OpponentProgress
          opponent={gameSession.opponent}
          guesses={gameSession.opponentGuesses}
        />
      </div>

      <section className="game-panel input-panel" aria-labelledby="guess-input-title">
        <div>
          <p className="eyebrow">Tahmin</p>
          <h2 id="guess-input-title">Aktif giriş</h2>
        </div>
        <InlineError id="guess-error" message={gameSession.submitError} />
        {gameSession.submitMessage && (
          <p className="copy-status" role="status" aria-live="polite">
            {gameSession.submitMessage}
          </p>
        )}
        <VirtualKeyboard
          keyboardState={gameSession.keyboardState}
          isDisabled={gameSession.isCompleted || gameSession.isSubmittingGuess}
          onLetter={gameSession.appendLetter}
          onBackspace={gameSession.removeLetter}
          onEnter={gameSession.submitCurrentGuess}
        />
      </section>

      {matchResult && (
        <MatchResultPanel
          result={matchResult}
          room={room}
          currentPlayerId={session.playerId}
          ownGuessCount={gameSession.ownGuesses.length}
          opponentGuessCount={gameSession.opponentGuesses.length}
        />
      )}
    </>
  )
}
