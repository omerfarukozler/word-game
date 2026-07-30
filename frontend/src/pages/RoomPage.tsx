import { useEffect } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { GameScreen } from '../features/game/components/GameScreen'
import { PlayerList } from '../features/room/components/PlayerList'
import { RoomHeader } from '../features/room/components/RoomHeader'
import { WaitingRoomPanel } from '../features/room/components/WaitingRoomPanel'
import { useRoomSession } from '../features/room/hooks/useRoomSession'
import { usePlayerSession } from '../session/PlayerSessionContext'
import { normalizeRoomCode } from '../utils/roomCode'

export function RoomPage() {
  const navigate = useNavigate()
  const { roomCode } = useParams()
  const { session, clearSession } = usePlayerSession()
  const normalizedRouteCode = normalizeRoomCode(roomCode ?? '')
  const sessionMatchesRoute =
    session !== null && normalizeRoomCode(session.roomCode) === normalizedRouteCode

  useEffect(() => {
    if (session && normalizedRouteCode && !sessionMatchesRoute) {
      clearSession()
      navigate('/', { replace: true })
    }
  }, [clearSession, navigate, normalizedRouteCode, session, sessionMatchesRoute])

  if (!normalizedRouteCode) {
    return <Navigate to="/" replace />
  }

  if (session && !sessionMatchesRoute) {
    return null
  }

  if (!session) {
    return (
      <main className="page-shell page-shell--narrow" aria-labelledby="room-title">
        <p className="eyebrow">Oturum gerekli</p>
        <h1 id="room-title">{normalizedRouteCode}</h1>
        <section className="status-panel status-panel--warning" role="status">
          <h2>Oyuncu oturumu bulunamadı</h2>
          <p>Bu odaya oyuncu olarak devam etmek için ana sayfadan katılmalısın.</p>
        </section>
        <Link className="button-link" to="/">
          Ana sayfaya dön
        </Link>
      </main>
    )
  }

  return <RoomPageContent roomCode={normalizedRouteCode} />
}

function RoomPageContent({ roomCode }: { roomCode: string }) {
  const { session } = usePlayerSession()
  const {
    room,
    currentMatch,
    isRoomLoading,
    roomError,
    connectionState,
    isStartingMatch,
    startError,
    submittedGuesses,
    matchResult,
    startMatch,
    recordSubmittedGuess,
    recordMatchCompleted,
  } = useRoomSession(roomCode, session!)
  const connectionLabel = getConnectionLabel(connectionState)

  return (
    <main className="page-shell room-page" aria-labelledby="room-title">
      {isRoomLoading && (
        <section
          className="status-panel"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <h1 id="room-title">Oda yükleniyor</h1>
          <p>Oda bilgileri backend’den alınıyor.</p>
        </section>
      )}

      {!isRoomLoading && roomError && (
        <section className="status-panel status-panel--warning" role="alert">
          <p className="eyebrow">Oda açılamadı</p>
          <h1 id="room-title">{roomCode}</h1>
          <p>{roomError}</p>
          <Link className="button-link" to="/">
            Ana sayfaya dön
          </Link>
        </section>
      )}

      {!isRoomLoading && room && (
        <>
          {currentMatch ? (
            <GameScreen
              room={room}
              match={currentMatch}
              session={session!}
              guesses={submittedGuesses}
              matchResult={matchResult}
              connectionLabel={connectionLabel}
              onGuessSubmitted={recordSubmittedGuess}
              onMatchCompleted={recordMatchCompleted}
            />
          ) : (
            <>
              <RoomHeader room={room} />
              <p className="connection-note" role="status" aria-live="polite">
                Gerçek zamanlı oda bağlantısı: {connectionLabel}
              </p>

              <div className="room-layout">
                <PlayerList players={room.players} currentPlayerId={session!.playerId} />
                <WaitingRoomPanel
                  room={room}
                  currentMatch={currentMatch}
                  isHost={session!.isHost}
                  isStartingMatch={isStartingMatch}
                  startError={startError}
                  onStartMatch={startMatch}
                />
              </div>
            </>
          )}
        </>
      )}
    </main>
  )
}

function getConnectionLabel(connectionState: string): string {
  switch (connectionState) {
    case 'connected':
      return 'bağlı'
    case 'connecting':
      return 'bağlanıyor'
    case 'reconnecting':
      return 'yeniden bağlanıyor'
    case 'error':
      return 'bağlantı kurulamadı'
    default:
      return 'hazırlanıyor'
  }
}
