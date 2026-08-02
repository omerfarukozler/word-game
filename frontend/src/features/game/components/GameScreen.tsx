import type { PlayerSession } from '../../../session/playerSessionStorage'
import type { Match, Room } from '../../../types/domain'
import type {
  GuessSubmittedNotification,
  MatchCompletedNotification,
} from '../../../types/realtime'
import type { RematchState } from '../../room/hooks/useRoomSession'
import { InlineError } from '../../../components/InlineError'
import { GameBoard } from './GameBoard'
import { GameHeader } from './GameHeader'
import { MatchResultPanel } from './MatchResultPanel'
import { OpponentProgress } from './OpponentProgress'
import { RematchDecisionModal } from './RematchDecisionModal'
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
  rematchState: RematchState
  onGuessSubmitted: (guess: GuessSubmittedNotification) => void
  onMatchCompleted: (notification: MatchCompletedNotification) => void
  onRequestRematch: () => void
  onRespondRematch: (accept: boolean) => void
}

export function GameScreen({
  room,
  match,
  session,
  guesses,
  matchResult,
  connectionLabel,
  rematchState,
  onGuessSubmitted,
  onMatchCompleted,
  onRequestRematch,
  onRespondRematch,
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
  const rematchRequester =
    room.players.find((player) => player.id === rematchState.requestedByPlayerId) ?? null
  const shouldShowRematchModal =
    rematchState.requestedByPlayerId !== null &&
    rematchState.requestedByPlayerId !== session.playerId &&
    (rematchState.status === 'incoming' ||
      rematchState.status === 'responding' ||
      rematchState.status === 'starting')

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
        <div className="input-panel__header">
          <div>
            <p className="eyebrow">Tahmin</p>
            <h2 id="guess-input-title">Aktif giriş</h2>
          </div>
          <dl className="evaluation-legend" aria-label="Renk açıklamaları">
            <div>
              <dt>
                <span
                  className="evaluation-legend__swatch evaluation-legend__swatch--correct"
                  aria-hidden="true"
                />
                Doğru yerde
              </dt>
            </div>
            <div>
              <dt>
                <span
                  className="evaluation-legend__swatch evaluation-legend__swatch--present"
                  aria-hidden="true"
                />
                Kelimede var
              </dt>
            </div>
            <div>
              <dt>
                <span
                  className="evaluation-legend__swatch evaluation-legend__swatch--absent"
                  aria-hidden="true"
                />
                Kelimede yok
              </dt>
            </div>
          </dl>
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
          rematchState={rematchState}
          onRequestRematch={onRequestRematch}
        />
      )}

      {shouldShowRematchModal && (
        <RematchDecisionModal
          requester={rematchRequester}
          rematchState={rematchState}
          onRespond={onRespondRematch}
        />
      )}
    </>
  )
}
