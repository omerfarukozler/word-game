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
      <section className="status-panel status-panel--success" role="status">
        <h2>Maç başladı</h2>
        <p>İlk tahminini yapmak için oyun alanı açılıyor.</p>
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

      {!isHost && <p>Oda sahibinin maçı başlatması bekleniyor.</p>}
      {isHost && room.players.length < 2 && <p>İkinci oyuncu bekleniyor.</p>}
      {isHost && hasAnyMatch && (
        <p>Bu odada ilk maç oynandı. Yeni maç rematch akışıyla başlatılacak.</p>
      )}
      {canStartFirstMatch && <p>İki oyuncu hazır. İlk maçı başlatabilirsin.</p>}

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
