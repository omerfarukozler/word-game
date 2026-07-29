import { normalizeRoomCode } from '../utils/roomCode'

export const PLAYER_SESSION_STORAGE_KEY = 'word-battle.player-session'

export interface PlayerSession {
  roomId: string
  roomCode: string
  playerId: string
  playerToken: string
  nickname: string
  isHost: boolean
}

function isPlayerSession(value: unknown): value is PlayerSession {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    typeof candidate.roomId === 'string' &&
    typeof candidate.roomCode === 'string' &&
    typeof candidate.playerId === 'string' &&
    typeof candidate.playerToken === 'string' &&
    typeof candidate.nickname === 'string' &&
    typeof candidate.isHost === 'boolean'
  )
}

export function readPlayerSession(): PlayerSession | null {
  const rawSession = window.sessionStorage.getItem(PLAYER_SESSION_STORAGE_KEY)

  if (!rawSession) {
    return null
  }

  try {
    const parsedSession: unknown = JSON.parse(rawSession)

    if (!isPlayerSession(parsedSession)) {
      clearPlayerSession()
      return null
    }

    return {
      ...parsedSession,
      roomCode: normalizeRoomCode(parsedSession.roomCode),
    }
  } catch {
    clearPlayerSession()
    return null
  }
}

export function writePlayerSession(session: PlayerSession): void {
  window.sessionStorage.setItem(
    PLAYER_SESSION_STORAGE_KEY,
    JSON.stringify({
      ...session,
      roomCode: normalizeRoomCode(session.roomCode),
    }),
  )
}

export function clearPlayerSession(): void {
  window.sessionStorage.removeItem(PLAYER_SESSION_STORAGE_KEY)
}
