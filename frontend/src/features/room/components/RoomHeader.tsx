import { useState } from 'react'
import type { Room } from '../../../types/domain'
import { InlineError } from '../../../components/InlineError'

interface RoomHeaderProps {
  room: Room
}

export function RoomHeader({ room }: RoomHeaderProps) {
  const [copyMessage, setCopyMessage] = useState<string | null>(null)
  const [copyError, setCopyError] = useState<string | null>(null)

  async function handleCopyRoomCode() {
    setCopyMessage(null)
    setCopyError(null)

    try {
      await navigator.clipboard.writeText(room.code)
      setCopyMessage('Kod kopyalandı')
    } catch {
      setCopyError('Kod kopyalanamadı. Kodu elle seçip paylaşabilirsiniz.')
    }
  }

  return (
    <header className="room-header">
      <div className="room-header__content">
        <p className="eyebrow">Oda kodu</p>
        <h1 className="room-code">{room.code}</h1>
        <p className="room-header__hint">Bu kodu arkadaşınla paylaş.</p>
      </div>
      <div className="room-header__actions">
        <button
          type="button"
          className="button button--ghost"
          aria-label={`Oda kodunu kopyala: ${room.code}`}
          onClick={handleCopyRoomCode}
        >
          Kopyala
        </button>
        <p className="copy-status" role="status" aria-live="polite">
          {copyMessage}
        </p>
        <InlineError message={copyError} />
      </div>
    </header>
  )
}
