import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getRoom,
  requestRematch,
  respondRematch,
  startMatch,
} from '../../../services/roomApi'
import { createGameHubClient } from '../../../services/gameHub'
import {
  MatchCompletionReason,
  MatchStatus,
  RoomStatus,
  type Match,
  type Room,
} from '../../../types/domain'
import type { GameHubHandlers } from '../../../types/realtime'
import type { PlayerSession } from '../../../session/playerSessionStorage'
import { useRoomSession } from './useRoomSession'

vi.mock('../../../services/roomApi', () => ({
  getRoom: vi.fn(),
  requestRematch: vi.fn(),
  respondRematch: vi.fn(),
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
    expiresAt: '2026-07-29T18:07:00Z',
    completedAt: null,
    completionReason: null,
    ...overrides,
  }
}

function completedMatch(overrides: Partial<Match> = {}): Match {
  return playingMatch({
    status: MatchStatus.Completed,
    winnerPlayerId: 'host-1',
    completedAt: '2026-07-29T18:07:00Z',
    completionReason: MatchCompletionReason.CorrectGuess,
    ...overrides,
  })
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

  it('handles GuessSubmitted events idempotently by guess id', async () => {
    vi.mocked(getRoom).mockResolvedValue(
      roomSnapshot({
        status: RoomStatus.Playing,
        matches: [playingMatch()],
      }),
    )
    const { result } = renderHook(() => useRoomSession('ABC123', session))

    await waitFor(() => {
      expect(result.current.currentMatch?.id).toBe('match-1')
    })

    act(() => {
      registeredHandlers.guessSubmitted?.({
        id: 'guess-1',
        matchId: 'match-1',
        playerId: 'host-1',
        word: 'ÇİĞDE',
        attemptNumber: 1,
        evaluation: [
          { position: 0, letter: 'Ç', status: 2 },
          { position: 1, letter: 'İ', status: 0 },
          { position: 2, letter: 'Ğ', status: 1 },
          { position: 3, letter: 'D', status: 0 },
          { position: 4, letter: 'E', status: 0 },
        ],
        submittedAt: '2026-07-29T18:06:00Z',
      })
      registeredHandlers.guessSubmitted?.({
        id: 'guess-1',
        matchId: 'match-1',
        playerId: 'host-1',
        word: 'ÇİĞDE',
        attemptNumber: 1,
        evaluation: [
          { position: 0, letter: 'Ç', status: 2 },
          { position: 1, letter: 'İ', status: 0 },
          { position: 2, letter: 'Ğ', status: 1 },
          { position: 3, letter: 'D', status: 0 },
          { position: 4, letter: 'E', status: 0 },
        ],
        submittedAt: '2026-07-29T18:06:00Z',
      })
    })

    expect(result.current.submittedGuesses).toHaveLength(1)
    expect(result.current.submittedGuesses[0]?.word).toBe('ÇİĞDE')
  })

  it('applies MatchCompleted notifications idempotently', async () => {
    vi.mocked(getRoom).mockResolvedValue(
      roomSnapshot({
        status: RoomStatus.Playing,
        matches: [playingMatch()],
      }),
    )
    const { result } = renderHook(() => useRoomSession('ABC123', session))

    await waitFor(() => {
      expect(result.current.currentMatch?.id).toBe('match-1')
    })

    act(() => {
      registeredHandlers.matchCompleted?.({
        matchId: 'match-1',
        winnerPlayerId: 'host-1',
        targetWord: 'İNCİR',
        completedAt: '2026-07-29T18:07:00Z',
        completionReason: MatchCompletionReason.CorrectGuess,
        isDraw: false,
      })
      registeredHandlers.matchCompleted?.({
        matchId: 'match-1',
        winnerPlayerId: 'host-1',
        targetWord: 'İNCİR',
        completedAt: '2026-07-29T18:07:00Z',
        completionReason: MatchCompletionReason.CorrectGuess,
        isDraw: false,
      })
    })

    expect(result.current.currentMatch?.status).toBe(MatchStatus.Completed)
    expect(result.current.matchResult).toEqual({
      matchId: 'match-1',
      winnerPlayerId: 'host-1',
      targetWord: 'İNCİR',
      completedAt: '2026-07-29T18:07:00Z',
      completionReason: MatchCompletionReason.CorrectGuess,
      isDraw: false,
    })
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

  it('requests rematch with player token and waits for the opponent', async () => {
    vi.mocked(getRoom).mockResolvedValue(
      roomSnapshot({
        status: RoomStatus.Ready,
        matches: [completedMatch()],
      }),
    )
    vi.mocked(requestRematch).mockResolvedValue({
      requestedByPlayerId: 'host-1',
      requestedAt: '2026-07-29T18:08:00Z',
    })
    const { result } = renderHook(() => useRoomSession('ABC123', session))

    await waitFor(() => {
      expect(result.current.matchResult?.matchId).toBe('match-1')
    })

    await act(async () => {
      await result.current.requestRematch()
    })

    expect(requestRematch).toHaveBeenCalledWith('ABC123', {
      playerToken: 'host-token',
    })
    expect(result.current.rematchState.status).toBe('waiting')
    expect(result.current.rematchState.message).toBe('Rakibin cevabı bekleniyor...')
  })

  it('opens a single incoming rematch state for duplicate RematchRequested events', async () => {
    vi.mocked(getRoom).mockResolvedValue(
      roomSnapshot({
        status: RoomStatus.Ready,
        matches: [completedMatch()],
      }),
    )
    const { result } = renderHook(() => useRoomSession('ABC123', session))

    await waitFor(() => {
      expect(result.current.matchResult?.matchId).toBe('match-1')
    })

    act(() => {
      registeredHandlers.rematchRequested?.({
        requestedByPlayerId: 'guest-1',
        requestedAt: '2026-07-29T18:08:00Z',
      })
      registeredHandlers.rematchRequested?.({
        requestedByPlayerId: 'guest-1',
        requestedAt: '2026-07-29T18:08:00Z',
      })
    })

    expect(result.current.rematchState.status).toBe('incoming')
    expect(result.current.rematchState.requestedByPlayerId).toBe('guest-1')
  })

  it('responds to rematch accept and applies backend match without reconnecting', async () => {
    vi.mocked(getRoom).mockResolvedValue(
      roomSnapshot({
        status: RoomStatus.Ready,
        matches: [completedMatch()],
      }),
    )
    vi.mocked(respondRematch).mockResolvedValue({
      accepted: true,
      match: playingMatch({ id: 'match-2', startedAt: '2026-07-29T18:09:00Z' }),
    })
    const { result } = renderHook(() => useRoomSession('ABC123', session))

    await waitFor(() => {
      expect(result.current.matchResult?.matchId).toBe('match-1')
    })

    act(() => {
      registeredHandlers.rematchRequested?.({
        requestedByPlayerId: 'guest-1',
        requestedAt: '2026-07-29T18:08:00Z',
      })
      registeredHandlers.guessSubmitted?.({
        id: 'guess-before-rematch',
        matchId: 'match-1',
        playerId: 'host-1',
        word: 'ÇİĞDE',
        attemptNumber: 1,
        evaluation: [
          { position: 0, letter: 'Ç', status: 2 },
          { position: 1, letter: 'İ', status: 0 },
          { position: 2, letter: 'Ğ', status: 1 },
          { position: 3, letter: 'D', status: 0 },
          { position: 4, letter: 'E', status: 0 },
        ],
        submittedAt: '2026-07-29T18:07:30Z',
      })
    })
    expect(result.current.submittedGuesses).toHaveLength(1)

    await act(async () => {
      await result.current.respondRematch(true)
    })

    expect(respondRematch).toHaveBeenCalledWith('ABC123', {
      playerToken: 'host-token',
      accept: true,
    })
    expect(result.current.currentMatch?.id).toBe('match-2')
    expect(result.current.matchResult).toBeNull()
    expect(result.current.submittedGuesses).toEqual([])
    expect(result.current.room?.id).toBe('room-1')
    expect(hubSubscribeToRoom).toHaveBeenCalledTimes(1)

    act(() => {
      registeredHandlers.matchStarted?.(
        playingMatch({ id: 'match-2', startedAt: '2026-07-29T18:09:00Z' }),
      )
    })

    expect(result.current.currentMatch?.id).toBe('match-2')
    expect(result.current.matchResult).toBeNull()
    expect(result.current.submittedGuesses).toEqual([])
    expect(result.current.room?.id).toBe('room-1')
    expect(result.current.rematchState.status).toBe('idle')
  })

  it('responds to rematch reject and keeps the completed match visible', async () => {
    vi.mocked(getRoom).mockResolvedValue(
      roomSnapshot({
        status: RoomStatus.Ready,
        matches: [completedMatch()],
      }),
    )
    vi.mocked(respondRematch).mockResolvedValue({
      accepted: false,
      match: null,
    })
    const { result } = renderHook(() => useRoomSession('ABC123', session))

    await waitFor(() => {
      expect(result.current.matchResult?.matchId).toBe('match-1')
    })

    act(() => {
      registeredHandlers.rematchRequested?.({
        requestedByPlayerId: 'guest-1',
        requestedAt: '2026-07-29T18:08:00Z',
      })
    })

    await act(async () => {
      await result.current.respondRematch(false)
    })

    expect(respondRematch).toHaveBeenCalledWith('ABC123', {
      playerToken: 'host-token',
      accept: false,
    })
    expect(result.current.currentMatch?.id).toBe('match-1')
    expect(result.current.matchResult?.matchId).toBe('match-1')
    expect(result.current.rematchState.status).toBe('idle')
  })

  it('handles duplicate RematchRejected events idempotently', async () => {
    vi.mocked(getRoom).mockResolvedValue(
      roomSnapshot({
        status: RoomStatus.Ready,
        matches: [completedMatch()],
      }),
    )
    const { result } = renderHook(() => useRoomSession('ABC123', session))

    await waitFor(() => {
      expect(result.current.matchResult?.matchId).toBe('match-1')
    })

    act(() => {
      registeredHandlers.rematchRequested?.({
        requestedByPlayerId: 'host-1',
        requestedAt: '2026-07-29T18:08:00Z',
      })
      registeredHandlers.rematchRejected?.({
        requestedByPlayerId: 'host-1',
        rejectedByPlayerId: 'guest-1',
        rejectedAt: '2026-07-29T18:08:30Z',
      })
      registeredHandlers.rematchRejected?.({
        requestedByPlayerId: 'host-1',
        rejectedByPlayerId: 'guest-1',
        rejectedAt: '2026-07-29T18:08:30Z',
      })
    })

    expect(result.current.rematchState.status).toBe('rejected')
    expect(result.current.rematchState.message).toBe('Rakibin isteği reddetti.')
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
