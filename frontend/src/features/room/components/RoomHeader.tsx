import { useState } from 'react'
import type { Room } from '../../../types/domain'
import { InlineError } from '../../../components/InlineError'

interface RoomHeaderProps {
  room: Room
}

async function copyTextToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // Mobile browsers can reject Clipboard API on LAN http origins.
    }
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.top = '0'
  textarea.style.left = '-9999px'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()
  textarea.setSelectionRange(0, text.length)

  try {
    return document.execCommand('copy')
  } finally {
    document.body.removeChild(textarea)
  }
}

export function RoomHeader({ room }: RoomHeaderProps) {
  const [copyMessage, setCopyMessage] = useState<string | null>(null)
  const [copyError, setCopyError] = useState<string | null>(null)

  async function handleCopyRoomCode() {
    setCopyMessage(null)
    setCopyError(null)

    try {
      const copied = await copyTextToClipboard(room.code)

      if (!copied) {
        throw new Error('Room code could not be copied.')
      }

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
