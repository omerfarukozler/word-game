import { afterEach, describe, expect, it } from 'vitest'
import {
  clearPlayerSession,
  PLAYER_SESSION_STORAGE_KEY,
  readPlayerSession,
  writePlayerSession,
  type PlayerSession,
} from './playerSessionStorage'

const session: PlayerSession = {
  roomId: 'room-id',
  roomCode: 'abc123',
  playerId: 'player-id',
  playerToken: 'secret-token',
  nickname: 'Ada',
  isHost: true,
}

describe('playerSessionStorage', () => {
  afterEach(() => {
    window.sessionStorage.clear()
  })

  it('normalizes room code when writing and reading the session', () => {
    writePlayerSession(session)

    expect(readPlayerSession()).toEqual({
      ...session,
      roomCode: 'ABC123',
    })
  })

  it('clears malformed JSON instead of throwing', () => {
    window.sessionStorage.setItem(PLAYER_SESSION_STORAGE_KEY, '{not-json')

    expect(readPlayerSession()).toBeNull()
    expect(window.sessionStorage.getItem(PLAYER_SESSION_STORAGE_KEY)).toBeNull()
  })

  it('clears incompatible session shapes', () => {
    window.sessionStorage.setItem(
      PLAYER_SESSION_STORAGE_KEY,
      JSON.stringify({ roomCode: 'ABC123' }),
    )

    expect(readPlayerSession()).toBeNull()
    expect(window.sessionStorage.getItem(PLAYER_SESSION_STORAGE_KEY)).toBeNull()
  })

  it('removes a valid stored session', () => {
    writePlayerSession(session)
    clearPlayerSession()

    expect(readPlayerSession()).toBeNull()
  })
})
