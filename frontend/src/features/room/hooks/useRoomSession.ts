import { useCallback, useEffect, useRef, useState } from 'react'
import { createGameHubClient } from '../../../services/gameHub'
import { getRoom, startMatch } from '../../../services/roomApi'
import { RoomStatus, type Match, type Room } from '../../../types/domain'
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
  const loadSequenceRef = useRef(0)

  const applyRoomSnapshot = useCallback((nextRoom: Room) => {
    setRoom(nextRoom)
    setCurrentMatch(selectCurrentMatch(nextRoom))
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
  }, [applyMatchStarted, applyRoomSnapshot, loadRoom, normalizedRoomCode])

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
    loadRoom,
    startMatch: handleStartMatch,
  }
}
