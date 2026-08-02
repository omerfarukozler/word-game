import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { submitGuess } from '../../../services/matchApi'
import {
  GuessLetterStatus,
  MatchCompletionReason,
  MatchStatus,
  RoomStatus,
  type Match,
  type Room,
} from '../../../types/domain'
import { ApiError } from '../../../utils/problemDetails'
import type { PlayerSession } from '../../../session/playerSessionStorage'
import type { GameGuess } from '../types'
import { useGameSession } from './useGameSession'

vi.mock('../../../services/matchApi', () => ({
  submitGuess: vi.fn(),
}))

const session: PlayerSession = {
  roomId: 'room-1',
  roomCode: 'ABC123',
  playerId: 'player-1',
  playerToken: 'secret-token',
  nickname: 'Ada',
  isHost: true,
}

const room: Room = {
  id: 'room-1',
  code: 'ABC123',
  status: RoomStatus.Playing,
  createdAt: '2026-07-30T12:00:00Z',
  closedAt: null,
  players: [
    {
      id: 'player-1',
      nickname: 'Ada',
      score: 0,
      isReady: false,
      isConnected: false,
      isHost: true,
    },
    {
      id: 'player-2',
      nickname: 'Bora',
      score: 0,
      isReady: false,
      isConnected: false,
      isHost: false,
    },
  ],
  matches: [],
}

const match: Match = {
  id: 'match-1',
  roomId: 'room-1',
  status: MatchStatus.Playing,
  winnerPlayerId: null,
  startedAt: '2026-07-30T12:01:00Z',
  expiresAt: '2099-07-30T12:03:00Z',
  completedAt: null,
  completionReason: null,
}

function submittedGuess(attemptNumber: number): GameGuess {
  return {
    id: `guess-${attemptNumber}`,
    matchId: 'match-1',
    playerId: 'player-1',
    word: 'ABCDE',
    attemptNumber,
    evaluation: [
      { position: 0, letter: 'A', status: GuessLetterStatus.Absent },
      { position: 1, letter: 'B', status: GuessLetterStatus.Absent },
      { position: 2, letter: 'C', status: GuessLetterStatus.Absent },
      { position: 3, letter: 'D', status: GuessLetterStatus.Absent },
      { position: 4, letter: 'E', status: GuessLetterStatus.Absent },
    ],
    submittedAt: '2026-07-30T12:02:00Z',
  }
}

function renderGameSession(
  overrides: Partial<Parameters<typeof useGameSession>[0]> = {},
) {
  const onGuessSubmitted = vi.fn()
  const onMatchCompleted = vi.fn()
  const result = renderHook(() =>
    useGameSession({
      room,
      match,
      session,
      guesses: [],
      matchResult: null,
      onGuessSubmitted,
      onMatchCompleted,
      ...overrides,
    }),
  )

  return {
    ...result,
    onGuessSubmitted,
    onMatchCompleted,
  }
}

describe('useGameSession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('handles physical keyboard letters, Turkish normalization, backspace, and max length', () => {
    const { result } = renderGameSession()

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'i' }))
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ş' }))
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }))
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'b' }))
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'c' }))
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'd' }))
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace' }))
    })

    expect(result.current.currentGuess).toBe('İŞAB')
  })

  it('does not submit incomplete guesses', async () => {
    const { result } = renderGameSession()

    act(() => {
      result.current.appendLetter('A')
    })
    await act(async () => {
      await result.current.submitCurrentGuess()
    })

    expect(submitGuess).not.toHaveBeenCalled()
    expect(result.current.submitError).toBe('Tahmin 5 harf olmalıdır.')
  })

  it('submits player token in the body and clears the active guess on success', async () => {
    vi.mocked(submitGuess).mockResolvedValue({
      id: 'guess-1',
      matchId: 'match-1',
      playerId: 'player-1',
      word: 'ÇİĞDE',
      attemptNumber: 1,
      evaluation: [
        { position: 0, letter: 'Ç', status: GuessLetterStatus.Correct },
        { position: 1, letter: 'İ', status: GuessLetterStatus.Absent },
        { position: 2, letter: 'Ğ', status: GuessLetterStatus.Present },
        { position: 3, letter: 'D', status: GuessLetterStatus.Absent },
        { position: 4, letter: 'E', status: GuessLetterStatus.Absent },
      ],
      isCorrect: false,
      isMatchCompleted: false,
      winnerPlayerId: null,
      completionReason: null,
      isDraw: false,
      submittedAt: '2026-07-30T12:02:00Z',
    })
    const { result, onGuessSubmitted } = renderGameSession()

    act(() => {
      ;['ç', 'i', 'ğ', 'd', 'e'].forEach(result.current.appendLetter)
    })
    await act(async () => {
      await result.current.submitCurrentGuess()
    })

    expect(submitGuess).toHaveBeenCalledWith('match-1', {
      playerToken: 'secret-token',
      word: 'ÇİĞDE',
    })
    expect(result.current.currentGuess).toBe('')
    expect(onGuessSubmitted).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'guess-1' }),
    )
  })

  it('blocks duplicate submit calls while a request is in flight', async () => {
    vi.mocked(submitGuess).mockReturnValue(new Promise(() => undefined))
    const { result } = renderGameSession()

    act(() => {
      ;['A', 'B', 'C', 'D', 'E'].forEach(result.current.appendLetter)
    })
    await act(async () => {
      void result.current.submitCurrentGuess()
      void result.current.submitCurrentGuess()
    })

    expect(submitGuess).toHaveBeenCalledTimes(1)
  })

  it('keeps the active guess when backend rejects the word', async () => {
    vi.mocked(submitGuess).mockRejectedValue(
      new ApiError(
        {
          status: 400,
          title: 'Bad Request',
          detail: 'The guessed word is not in the word list.',
        },
        400,
      ),
    )
    const { result } = renderGameSession()

    act(() => {
      ;['A', 'B', 'C', 'D', 'E'].forEach(result.current.appendLetter)
    })
    await act(async () => {
      await result.current.submitCurrentGuess()
    })

    expect(result.current.currentGuess).toBe('ABCDE')
    expect(result.current.submitError).toMatch(/kelime kabul edilmedi/i)
  })

  it('does not accept input after match completion', () => {
    const { result } = renderGameSession({
      match: { ...match, status: MatchStatus.Completed },
      matchResult: {
        matchId: 'match-1',
        winnerPlayerId: 'player-2',
        completedAt: '2026-07-30T12:03:00Z',
        completionReason: MatchCompletionReason.CorrectGuess,
        isDraw: false,
      },
    })

    act(() => {
      result.current.appendLetter('A')
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'A' }))
    })

    expect(result.current.currentGuess).toBe('')
    expect(submitGuess).not.toHaveBeenCalled()
  })

  it('locks input at zero and waits for backend completion', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-30T12:03:00Z'))

    try {
      const { result } = renderGameSession({
        match: { ...match, expiresAt: '2026-07-30T12:03:00Z' },
      })

      act(() => {
        result.current.appendLetter('A')
      })
      await act(async () => {
        await result.current.submitCurrentGuess()
      })

      expect(result.current.remainingMilliseconds).toBe(0)
      expect(result.current.isTimeExpired).toBe(true)
      expect(result.current.currentGuess).toBe('')
      expect(result.current.submitError).toBe('Süre doldu, sonuç bekleniyor...')
      expect(submitGuess).not.toHaveBeenCalled()
    } finally {
      vi.useRealTimers()
    }
  })

  it('blocks input and submit after six own guesses', async () => {
    const { result } = renderGameSession({
      guesses: Array.from({ length: 6 }, (_, index) => submittedGuess(index + 1)),
    })

    act(() => {
      result.current.appendLetter('A')
    })
    await act(async () => {
      await result.current.submitCurrentGuess()
    })

    expect(result.current.hasRemainingGuesses).toBe(false)
    expect(result.current.currentGuess).toBe('')
    expect(result.current.submitError).toBe('6 tahmin hakkını kullandın.')
    expect(submitGuess).not.toHaveBeenCalled()
  })
})
