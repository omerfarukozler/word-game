import { Link, Navigate, Route, Routes } from 'react-router-dom'
import { HomePage } from '../pages/HomePage'
import { RoomPage } from '../pages/RoomPage'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/room/:roomCode" element={<RoomPage />} />
      <Route
        path="/not-found"
        element={
          <main
            className="page-shell page-shell--narrow"
            aria-labelledby="not-found-title"
          >
            <p className="eyebrow">Word Battle</p>
            <h1 id="not-found-title">Sayfa bulunamadı</h1>
            <p className="lede">Bu adres için bir oyun odası veya sayfa yok.</p>
            <Link className="button-link" to="/">
              Ana sayfaya dön
            </Link>
          </main>
        }
      />
      <Route path="*" element={<Navigate to="/not-found" replace />} />
    </Routes>
  )
}
