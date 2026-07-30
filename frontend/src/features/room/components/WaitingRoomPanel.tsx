import { InlineError } from '../../../components/InlineError'
import { LoadingButton } from '../../../components/LoadingButton'
import { MatchStatus, RoomStatus, type Match, type Room } from '../../../types/domain'

interface WaitingRoomPanelProps {
  room: Room
  currentMatch: Match | null
  isHost: boolean
  isStartingMatch: boolean
  startError: string | null
  onStartMatch: () => void
}

function getRoomStatusLabel(status: RoomStatus): string {
  switch (status) {
    case RoomStatus.WaitingForPlayer:
      return 'İkinci oyuncu bekleniyor'
    case RoomStatus.Ready:
      return 'Maça hazır'
    case RoomStatus.Playing:
      return 'Maç başladı'
    case RoomStatus.Closed:
      return 'Oda kapalı'
  }
}

export function WaitingRoomPanel({
  room,
  currentMatch,
  isHost,
  isStartingMatch,
  startError,
  onStartMatch,
}: WaitingRoomPanelProps) {
  const hasAnyMatch = room.matches.length > 0
  const hasActiveMatch = room.matches.some(
    (match) =>
      match.status === MatchStatus.Waiting || match.status === MatchStatus.Playing,
  )
  const canStartFirstMatch =
    isHost &&
    room.status === RoomStatus.Ready &&
    room.players.length === 2 &&
    !hasAnyMatch &&
    !hasActiveMatch

  if (
    currentMatch?.status === MatchStatus.Playing ||
    room.status === RoomStatus.Playing
  ) {
    return (
      <section
        className="status-panel status-panel--success match-ready-panel"
        role="status"
      >
        <div className="mini-loader" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <h2>Maç başladı</h2>
        <p>Oyun alanına hazırlanıyorsunuz.</p>
      </section>
    )
  }

  if (currentMatch?.status === MatchStatus.Completed) {
    return (
      <section className="status-panel" role="status">
        <h2>Maç tamamlandı</h2>
        <p>Tekrar oynama seçenekleri sonraki görünümde sunulacak.</p>
      </section>
    )
  }

  return (
    <section className="status-panel waiting-panel" aria-labelledby="waiting-title">
      <div>
        <p className="eyebrow">Durum</p>
        <h2 id="waiting-title">{getRoomStatusLabel(room.status)}</h2>
      </div>

      {!isHost && (
        <div className="status-callout">
          <strong>Oda sahibinin maçı başlatması bekleniyor.</strong>
          <span>Hazır olduğunda oyun alanına birlikte geçeceksiniz.</span>
        </div>
      )}
      {isHost && room.players.length < 2 && (
        <div className="status-callout status-callout--accent">
          <strong>Rakibin bekleniyor.</strong>
          <span>Oda kodunu arkadaşınla paylaş.</span>
        </div>
      )}
      {isHost && hasAnyMatch && (
        <div className="status-callout">
          <strong>İlk maç oynandı.</strong>
          <span>Yeni maç rematch akışıyla başlatılacak.</span>
        </div>
      )}
      {canStartFirstMatch && (
        <div className="status-callout status-callout--success">
          <strong>Her şey hazır.</strong>
          <span>Maçı başlatabilirsin.</span>
        </div>
      )}

      <InlineError id="start-match-error" message={startError} />

      {canStartFirstMatch && (
        <LoadingButton
          type="button"
          className="button button--primary"
          isLoading={isStartingMatch}
          loadingLabel="Maç başlatılıyor"
          aria-describedby={startError ? 'start-match-error' : undefined}
          onClick={onStartMatch}
        >
          Maçı Başlat
        </LoadingButton>
      )}
    </section>
  )
}
