import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr'
import type { GameHubHandlers } from '../types/realtime'
import { normalizeRoomCode } from '../utils/roomCode'
import { HubMethods, RealtimeEvents } from './realtimeEvents'

export interface GameHubClient {
  readonly connection: HubConnection
  start: () => Promise<void>
  stop: () => Promise<void>
  subscribeToRoom: (roomCode: string) => Promise<void>
  unsubscribeFromRoom: (roomCode: string) => Promise<void>
  registerHandlers: (handlers: Partial<GameHubHandlers>) => () => void
  setReconnectRoom: (roomCode: string | null) => void
}

function getHubUrl(): string {
  const baseUrl = import.meta.env.VITE_API_BASE_URL

  if (!baseUrl) {
    throw new Error('VITE_API_BASE_URL is not configured.')
  }

  return `${baseUrl.replace(/\/+$/, '')}/hubs/game`
}

export function createGameHubClient(): GameHubClient {
  let reconnectRoomCode: string | null = null

  const connection = new HubConnectionBuilder()
    .withUrl(getHubUrl())
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Warning)
    .build()

  connection.onreconnected(() => {
    if (reconnectRoomCode) {
      void connection.invoke(HubMethods.SubscribeToRoom, reconnectRoomCode)
    }
  })

  async function start() {
    if (
      connection.state === HubConnectionState.Connected ||
      connection.state === HubConnectionState.Connecting ||
      connection.state === HubConnectionState.Reconnecting
    ) {
      return
    }

    await connection.start()
  }

  async function stop() {
    if (connection.state === HubConnectionState.Disconnected) {
      return
    }

    await connection.stop()
  }

  async function subscribeToRoom(roomCode: string) {
    const normalizedRoomCode = normalizeRoomCode(roomCode)
    reconnectRoomCode = normalizedRoomCode
    await start()
    await connection.invoke(HubMethods.SubscribeToRoom, normalizedRoomCode)
  }

  async function unsubscribeFromRoom(roomCode: string) {
    const normalizedRoomCode = normalizeRoomCode(roomCode)

    if (reconnectRoomCode === normalizedRoomCode) {
      reconnectRoomCode = null
    }

    if (connection.state !== HubConnectionState.Connected) {
      return
    }

    await connection.invoke(HubMethods.UnsubscribeFromRoom, normalizedRoomCode)
  }

  function registerHandlers(handlers: Partial<GameHubHandlers>) {
    if (handlers.roomUpdated) {
      connection.on(RealtimeEvents.RoomUpdated, handlers.roomUpdated)
    }
    if (handlers.matchStarted) {
      connection.on(RealtimeEvents.MatchStarted, handlers.matchStarted)
    }
    if (handlers.guessSubmitted) {
      connection.on(RealtimeEvents.GuessSubmitted, handlers.guessSubmitted)
    }
    if (handlers.matchCompleted) {
      connection.on(RealtimeEvents.MatchCompleted, handlers.matchCompleted)
    }
    if (handlers.rematchRequested) {
      connection.on(RealtimeEvents.RematchRequested, handlers.rematchRequested)
    }
    if (handlers.rematchRejected) {
      connection.on(RealtimeEvents.RematchRejected, handlers.rematchRejected)
    }

    return () => {
      if (handlers.roomUpdated) {
        connection.off(RealtimeEvents.RoomUpdated, handlers.roomUpdated)
      }
      if (handlers.matchStarted) {
        connection.off(RealtimeEvents.MatchStarted, handlers.matchStarted)
      }
      if (handlers.guessSubmitted) {
        connection.off(RealtimeEvents.GuessSubmitted, handlers.guessSubmitted)
      }
      if (handlers.matchCompleted) {
        connection.off(RealtimeEvents.MatchCompleted, handlers.matchCompleted)
      }
      if (handlers.rematchRequested) {
        connection.off(RealtimeEvents.RematchRequested, handlers.rematchRequested)
      }
      if (handlers.rematchRejected) {
        connection.off(RealtimeEvents.RematchRejected, handlers.rematchRejected)
      }
    }
  }

  return {
    connection,
    start,
    stop,
    subscribeToRoom,
    unsubscribeFromRoom,
    registerHandlers,
    setReconnectRoom(roomCode) {
      reconnectRoomCode = roomCode ? normalizeRoomCode(roomCode) : null
    },
  }
}
