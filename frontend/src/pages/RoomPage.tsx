import { Link, useParams } from 'react-router-dom'
import { usePlayerSession } from '../session/PlayerSessionContext'
import { normalizeRoomCode } from '../utils/roomCode'

export function RoomPage() {
  const { roomCode } = useParams()
  const { session } = usePlayerSession()
  const normalizedRouteCode = normalizeRoomCode(roomCode ?? '')
  const sessionMatchesRoute =
    session !== null && normalizeRoomCode(session.roomCode) === normalizedRouteCode

  return (
    <main className="page-shell page-shell--narrow" aria-labelledby="room-title">
      <p className="eyebrow">Oda</p>
      <h1 id="room-title">{normalizedRouteCode || 'Geçersiz oda kodu'}</h1>
      <p className="lede">
        Waiting room ve oyun ekranı Faz 9.3 ve Faz 9.4 kapsamında bağlanacak.
      </p>

      {!normalizedRouteCode && (
        <section className="status-panel status-panel--warning" role="status">
          <h2>Oda kodu eksik</h2>
          <p>Geçerli bir oda koduyla tekrar deneyin.</p>
        </section>
      )}

      {normalizedRouteCode && !sessionMatchesRoute && (
        <section className="status-panel status-panel--warning" role="status">
          <h2>Oturum doğrulanmadı</h2>
          <p>
            Bu route için saklanan oyuncu oturumu bulunamadı. Faz 9.3’te oda fetch akışı
            eklendiğinde session başka odaya körü körüne uygulanmayacak.
          </p>
        </section>
      )}

      {sessionMatchesRoute && (
        <section className="status-panel" role="status">
          <h2>Oturum bulundu</h2>
          <p>
            {session.nickname} için local session hazır. Player token DOM’da gösterilmez.
          </p>
        </section>
      )}

      <Link className="button-link" to="/">
        Ana sayfaya dön
      </Link>
    </main>
  )
}
