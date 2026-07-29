import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getRoom, startMatch } from '../../../services/roomApi'
import { createGameHubClient } from '../../../services/gameHub'
import { MatchStatus, RoomStatus, type Match, type Room } from '../../../types/domain'
import type { GameHubHandlers } from '../../../types/realtime'
import type { PlayerSession } from '../../../session/playerSessionStorage'
import { useRoomSession } from './useRoomSession'

vi.mock('../../../services/roomApi', () => ({
  getRoom: vi.fn(),
  startMatch: vi.fn(),
}))

const unsubscribeHandlers = vi.fn()
const unsubscribeReconnect = vi.fn()
const hubSubscribeToRoom = vi.fn()
const hubUnsubscribeFromRoom = vi.fn()
const hubStop = vi.fn()
const hubSetReconnectRoom = vi.fn()
let registeredHandlers: Partial<GameHubHandlers> = {}
let reconnectHandler: (() => void) | null = null

vi.mock('../../../services/gameHub', () => ({
  createGameHubClient: vi.fn(() => ({
    connection: {},
    start: vi.fn(),
    stop: hubStop,
    subscribeToRoom: hubSubscribeToRoom,
    unsubscribeFromRoom: hubUnsubscribeFromRoom,
    registerHandlers: vi.fn((handlers: Partial<GameHubHandlers>) => {
      registeredHandlers = handlers
      return unsubscribeHandlers
    }),
    onReconnected: vi.fn((handler: () => void) => {
      reconnectHandler = handler
      return unsubscribeReconnect
    }),
    setReconnectRoom: hubSetReconnectRoom,
  })),
}))

const session: PlayerSession = {
  roomId: 'room-1',
  roomCode: 'ABC123',
  playerId: 'host-1',
  playerToken: 'host-token',
  nickname: 'Ada',
  isHost: true,
}

function roomSnapshot(overrides: Partial<Room> = {}): Room {
  return {
    id: 'room-1',
    code: 'ABC123',
    status: RoomStatus.WaitingForPlayer,
    createdAt: '2026-07-29T18:00:00Z',
    closedAt: null,
    players: [
      {
        id: 'host-1',
        nickname: 'Ada',
        score: 0,
        isReady: false,
        isConnected: false,
        isHost: true,
      },
    ],
    matches: [],
    ...overrides,
  }
}

function playingMatch(overrides: Partial<Match> = {}): Match {
  return {
    id: 'match-1',
    roomId: 'room-1',
    status: MatchStatus.Playing,
    winnerPlayerId: null,
    startedAt: '2026-07-29T18:05:00Z',
    completedAt: null,
    ...overrides,
  }
}

describe('useRoomSession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    registeredHandlers = {}
    reconnectHandler = null
    hubSubscribeToRoom.mockResolvedValue(undefined)
    hubUnsubscribeFromRoom.mockResolvedValue(undefined)
    hubStop.mockResolvedValue(undefined)
  })

  it('loads the room snapshot and subscribes to the room group', async () => {
    vi.mocked(getRoom).mockResolvedValue(roomSnapshot())

    const { result } = renderHook(() => useRoomSession('abc123', session))

    await waitFor(() => {
      expect(result.current.room?.code).toBe('ABC123')
    })
    expect(hubSubscribeToRoom).toHaveBeenCalledWith('ABC123')
    expect(createGameHubClient).toHaveBeenCalledTimes(1)
  })

  it('applies RoomUpdated as the room source of truth', async () => {
    vi.mocked(getRoom).mockResolvedValue(roomSnapshot())
    const { result } = renderHook(() => useRoomSession('ABC123', session))

    await waitFor(() => {
      expect(result.current.room).not.toBeNull()
    })

    act(() => {
      registeredHandlers.roomUpdated?.(
        roomSnapshot({
          status: RoomStatus.Ready,
          players: [
            ...roomSnapshot().players,
            {
              id: 'guest-1',
              nickname: 'Bora',
              score: 0,
              isReady: false,
              isConnected: false,
              isHost: false,
            },
          ],
        }),
      )
    })

    expect(result.current.room?.players).toHaveLength(2)
    expect(result.current.room?.status).toBe(RoomStatus.Ready)
  })

  it('handles duplicate MatchStarted events idempotently by match id', async () => {
    vi.mocked(getRoom).mockResolvedValue(roomSnapshot())
    const { result } = renderHook(() => useRoomSession('ABC123', session))

    await waitFor(() => {
      expect(result.current.room).not.toBeNull()
    })

    act(() => {
      registeredHandlers.matchStarted?.(playingMatch())
      registeredHandlers.matchStarted?.(playingMatch())
    })

    expect(result.current.currentMatch?.id).toBe('match-1')
    expect(result.current.room?.matches).toHaveLength(1)
    expect(result.current.room?.status).toBe(RoomStatus.Playing)
  })

  it('refreshes the room snapshot after reconnect', async () => {
    vi.mocked(getRoom)
      .mockResolvedValueOnce(roomSnapshot())
      .mockResolvedValueOnce(roomSnapshot({ status: RoomStatus.Ready }))

    const { result } = renderHook(() => useRoomSession('ABC123', session))

    await waitFor(() => {
      expect(result.current.room?.status).toBe(RoomStatus.WaitingForPlayer)
    })

    act(() => {
      reconnectHandler?.()
    })

    await waitFor(() => {
      expect(result.current.room?.status).toBe(RoomStatus.Ready)
    })
    expect(getRoom).toHaveBeenCalledTimes(2)
  })

  it('starts match with player token in the request body', async () => {
    vi.mocked(getRoom).mockResolvedValue(roomSnapshot())
    vi.mocked(startMatch).mockResolvedValue(playingMatch())
    const { result } = renderHook(() => useRoomSession('ABC123', session))

    await waitFor(() => {
      expect(result.current.room).not.toBeNull()
    })

    await act(async () => {
      await result.current.startMatch()
    })

    expect(startMatch).toHaveBeenCalledWith('ABC123', { playerToken: 'host-token' })
    expect(result.current.currentMatch?.id).toBe('match-1')
  })

  it('removes handlers, unsubscribes, and stops the hub on cleanup', async () => {
    vi.mocked(getRoom).mockResolvedValue(roomSnapshot())
    const { unmount } = renderHook(() => useRoomSession('ABC123', session))

    unmount()

    expect(unsubscribeHandlers).toHaveBeenCalled()
    expect(unsubscribeReconnect).toHaveBeenCalled()
    expect(hubSetReconnectRoom).toHaveBeenCalledWith(null)
    expect(hubUnsubscribeFromRoom).toHaveBeenCalledWith('ABC123')
  })
})
