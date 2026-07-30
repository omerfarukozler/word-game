import { useCallback, useEffect, useRef, useState } from 'react'
import type { SubmitGuessResponse } from '../../../types/api'
import type {
  GuessSubmittedNotification,
  MatchCompletedNotification,
} from '../../../types/realtime'
import type { GameGuess, MatchResult } from '../../game/types'
import { createGameHubClient } from '../../../services/gameHub'
import { getRoom, startMatch } from '../../../services/roomApi'
import { MatchStatus, RoomStatus, type Match, type Room } from '../../../types/domain'
import type { PlayerSession } from '../../../session/playerSessionStorage'
import { upsertById } from '../../../utils/dedupe'
import { toFriendlyErrorMessage } from '../../../utils/problemDetails'
import { normalizeRoomCode } from '../../../utils/roomCode'
import { selectCurrentMatch } from '../utils/selectCurrentMatch'

type ConnectionState = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'error'

interface LoadRoomOptions {
  signal?: AbortSignal
  silent?: boolean
}

export function useRoomSession(roomCode: string, playerSession: PlayerSession) {
  const normalizedRoomCode = normalizeRoomCode(roomCode)
  const [room, setRoom] = useState<Room | null>(null)
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null)
  const [isRoomLoading, setIsRoomLoading] = useState(true)
  const [roomError, setRoomError] = useState<string | null>(null)
  const [connectionState, setConnectionState] = useState<ConnectionState>('idle')
  const [startError, setStartError] = useState<string | null>(null)
  const [isStartingMatch, setIsStartingMatch] = useState(false)
  const [submittedGuesses, setSubmittedGuesses] = useState<GameGuess[]>([])
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null)
  const loadSequenceRef = useRef(0)

  const applyRoomSnapshot = useCallback((nextRoom: Room) => {
    const nextCurrentMatch = selectCurrentMatch(nextRoom)
    setRoom(nextRoom)
    setCurrentMatch(nextCurrentMatch)
    setMatchResult(
      nextCurrentMatch?.status === MatchStatus.Completed &&
        nextCurrentMatch.winnerPlayerId &&
        nextCurrentMatch.completedAt
        ? {
            matchId: nextCurrentMatch.id,
            winnerPlayerId: nextCurrentMatch.winnerPlayerId,
            completedAt: nextCurrentMatch.completedAt,
          }
        : null,
    )
  }, [])

  const recordSubmittedGuess = useCallback(
    (guess: GuessSubmittedNotification | SubmitGuessResponse) => {
      const isCorrect = 'isCorrect' in guess ? guess.isCorrect : undefined

      setSubmittedGuesses((previousGuesses) => {
        const nextGuess: GameGuess = {
          id: guess.id,
          matchId: guess.matchId,
          playerId: guess.playerId,
          word: guess.word,
          attemptNumber: guess.attemptNumber,
          evaluation: guess.evaluation,
          submittedAt: guess.submittedAt,
          isCorrect,
        }
        const existingIndex = previousGuesses.findIndex(
          (item) => item.id === nextGuess.id,
        )

        if (existingIndex === -1) {
          return [...previousGuesses, nextGuess].sort(
            (left, right) => left.attemptNumber - right.attemptNumber,
          )
        }

        return previousGuesses.map((item, index) =>
          index === existingIndex ? { ...item, ...nextGuess } : item,
        )
      })
    },
    [],
  )

  const recordMatchCompleted = useCallback((notification: MatchCompletedNotification) => {
    setMatchResult((previousResult) => {
      if (previousResult?.matchId === notification.matchId) {
        return previousResult
      }

      return notification
    })
    setCurrentMatch((previousMatch) => {
      if (!previousMatch || previousMatch.id !== notification.matchId) {
        return previousMatch
      }

      return {
        ...previousMatch,
        status: MatchStatus.Completed,
        winnerPlayerId: notification.winnerPlayerId,
        completedAt: notification.completedAt,
      }
    })
    setRoom((previousRoom) => {
      if (!previousRoom) {
        return previousRoom
      }

      return {
        ...previousRoom,
        status: RoomStatus.Ready,
        matches: previousRoom.matches.map((match) =>
          match.id === notification.matchId
            ? {
                ...match,
                status: MatchStatus.Completed,
                winnerPlayerId: notification.winnerPlayerId,
                completedAt: notification.completedAt,
              }
            : match,
        ),
      }
    })
  }, [])

  const applyMatchStarted = useCallback((match: Match) => {
    setCurrentMatch((previousMatch) => {
      if (previousMatch?.id === match.id) {
        return match
      }

      return match
    })
    setRoom((previousRoom) => {
      if (!previousRoom) {
        return previousRoom
      }

      return {
        ...previousRoom,
        status: RoomStatus.Playing,
        matches: upsertById(previousRoom.matches, match),
      }
    })
    setIsStartingMatch(false)
    setStartError(null)
    setSubmittedGuesses((previousGuesses) =>
      previousGuesses.filter((guess) => guess.matchId === match.id),
    )
    setMatchResult(null)
  }, [])

  const loadRoom = useCallback(
    async ({ signal, silent = false }: LoadRoomOptions = {}) => {
      const requestSequence = loadSequenceRef.current + 1
      loadSequenceRef.current = requestSequence

      if (!silent) {
        setIsRoomLoading(true)
      }
      setRoomError(null)

      try {
        const nextRoom = await getRoom(normalizedRoomCode, { signal })

        if (requestSequence === loadSequenceRef.current) {
          applyRoomSnapshot(nextRoom)
        }
      } catch (error) {
        if (signal?.aborted) {
          return
        }

        if (requestSequence === loadSequenceRef.current) {
          setRoomError(toFriendlyErrorMessage(error))
        }
      } finally {
        if (requestSequence === loadSequenceRef.current && !silent) {
          setIsRoomLoading(false)
        }
      }
    },
    [applyRoomSnapshot, normalizedRoomCode],
  )

  useEffect(() => {
    const abortController = new AbortController()
    void Promise.resolve().then(() => loadRoom({ signal: abortController.signal }))

    return () => {
      abortController.abort()
    }
  }, [loadRoom])

  useEffect(() => {
    const hubClient = createGameHubClient()
    let isActive = true

    const unregisterHandlers = hubClient.registerHandlers({
      roomUpdated: (nextRoom) => {
        applyRoomSnapshot(nextRoom)
      },
      matchStarted: (match) => {
        applyMatchStarted(match)
      },
      guessSubmitted: (guess) => {
        recordSubmittedGuess(guess)
      },
      matchCompleted: (notification) => {
        recordMatchCompleted(notification)
      },
    })

    const unregisterReconnectHandler = hubClient.onReconnected(() => {
      if (isActive) {
        setConnectionState('connected')
        void loadRoom({ silent: true })
      }
    })

    async function connect() {
      setConnectionState('connecting')

      try {
        await hubClient.subscribeToRoom(normalizedRoomCode)

        if (isActive) {
          setConnectionState('connected')
        }
      } catch {
        if (isActive) {
          setConnectionState('error')
        }
      }
    }

    void connect()

    return () => {
      isActive = false
      unregisterHandlers()
      unregisterReconnectHandler()
      hubClient.setReconnectRoom(null)
      void hubClient
        .unsubscribeFromRoom(normalizedRoomCode)
        .catch(() => undefined)
        .finally(() => {
          void hubClient.stop().catch(() => undefined)
        })
    }
  }, [
    applyMatchStarted,
    applyRoomSnapshot,
    loadRoom,
    normalizedRoomCode,
    recordMatchCompleted,
    recordSubmittedGuess,
  ])

  const handleStartMatch = useCallback(async () => {
    if (isStartingMatch) {
      return
    }

    setIsStartingMatch(true)
    setStartError(null)

    try {
      const match = await startMatch(normalizedRoomCode, {
        playerToken: playerSession.playerToken,
      })
      applyMatchStarted(match)
    } catch (error) {
      setStartError(toFriendlyErrorMessage(error))
    } finally {
      setIsStartingMatch(false)
    }
  }, [applyMatchStarted, isStartingMatch, normalizedRoomCode, playerSession.playerToken])

  return {
    room,
    currentMatch,
    isRoomLoading,
    roomError,
    connectionState,
    isStartingMatch,
    startError,
    submittedGuesses,
    matchResult,
    loadRoom,
    startMatch: handleStartMatch,
    recordSubmittedGuess,
    recordMatchCompleted,
  }
}
