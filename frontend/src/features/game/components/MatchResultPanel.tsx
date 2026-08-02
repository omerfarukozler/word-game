import { MatchCompletionReason, type Room } from '../../../types/domain'
import type { RematchState } from '../../room/hooks/useRoomSession'
import type { MatchResult } from '../types'

interface MatchResultPanelProps {
  result: MatchResult
  room: Room
  currentPlayerId: string
  ownGuessCount: number
  opponentGuessCount: number
  rematchState: RematchState
  onRequestRematch: () => void
}

export function MatchResultPanel({
  result,
  room,
  currentPlayerId,
  ownGuessCount,
  opponentGuessCount,
  rematchState,
  onRequestRematch,
}: MatchResultPanelProps) {
  const winner = room.players.find((player) => player.id === result.winnerPlayerId)
  const didCurrentPlayerWin = result.winnerPlayerId === currentPlayerId
  const title = result.isDraw
    ? 'Süre doldu.'
    : result.completionReason === MatchCompletionReason.AttemptLimit &&
        !didCurrentPlayerWin
      ? 'Tahmin hakların bitti.'
      : didCurrentPlayerWin
        ? 'Kazandın!'
        : 'Bu tur rakibin kazandı.'
  const description = result.isDraw
    ? 'Bu tur berabere tamamlandı.'
    : result.completionReason === MatchCompletionReason.AttemptLimit &&
        didCurrentPlayerWin
      ? 'Rakibin 6 tahmin hakkını kullandı. Bu turu sen kazandın.'
      : result.completionReason === MatchCompletionReason.AttemptLimit
        ? 'Bu tur rakibin kazandı.'
        : didCurrentPlayerWin
          ? 'Kelimeyi rakibinden önce buldun.'
          : winner
            ? `${winner.nickname} bu turu kazandı.`
            : 'Kazanan oyuncu belirlendi.'
  const isRequestDisabled =
    rematchState.status === 'requesting' ||
    rematchState.status === 'waiting' ||
    rematchState.status === 'incoming' ||
    rematchState.status === 'responding' ||
    rematchState.status === 'starting'
  const rematchButtonLabel =
    rematchState.status === 'requesting' ? 'İstek gönderiliyor...' : 'Tekrar Oyna'

  return (
    <section className="game-panel match-result-panel" role="status" aria-live="polite">
      <div className="match-result-panel__summary">
        <div>
          <p className="eyebrow">Tur tamamlandı</p>
          <h2>{title}</h2>
        </div>
        <p>{description}</p>
      </div>
      <dl className="result-stats">
        <div>
          <dt>Kazanan</dt>
          <dd>{result.isDraw ? 'Berabere' : (winner?.nickname ?? 'Bilinmiyor')}</dd>
        </div>
        <div>
          <dt>Senin tahminin</dt>
          <dd>{ownGuessCount}</dd>
        </div>
        <div>
          <dt>Rakip tahmini</dt>
          <dd>{opponentGuessCount}</dd>
        </div>
        <div>
          <dt>Oda kodu</dt>
          <dd>{room.code}</dd>
        </div>
      </dl>
      <div className="match-result-panel__actions">
        <div>
          <p>Aynı odada yeni bir karşılaşma başlat.</p>
          {(rematchState.message || rematchState.error) && (
            <p
              className={
                rematchState.error
                  ? 'match-result-panel__feedback match-result-panel__feedback--error'
                  : 'match-result-panel__feedback'
              }
              role="status"
              aria-live="polite"
            >
              {rematchState.error ?? rematchState.message}
            </p>
          )}
        </div>
        <button
          className="button button--primary"
          type="button"
          disabled={isRequestDisabled}
          onClick={onRequestRematch}
        >
          {rematchButtonLabel}
        </button>
      </div>
    </section>
  )
}
