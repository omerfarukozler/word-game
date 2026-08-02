export type Guid = string
export type IsoDateTime = string

export const RoomStatus = {
  WaitingForPlayer: 0,
  Ready: 1,
  Playing: 2,
  Closed: 3,
} as const

export type RoomStatus = (typeof RoomStatus)[keyof typeof RoomStatus]

export const MatchStatus = {
  Waiting: 0,
  Playing: 1,
  Completed: 2,
  Cancelled: 3,
} as const

export type MatchStatus = (typeof MatchStatus)[keyof typeof MatchStatus]

export const GuessLetterStatus = {
  Absent: 0,
  Present: 1,
  Correct: 2,
} as const

export type GuessLetterStatus = (typeof GuessLetterStatus)[keyof typeof GuessLetterStatus]

export const MatchCompletionReason = {
  CorrectGuess: 0,
  AttemptLimit: 1,
  TimeExpired: 2,
} as const

export type MatchCompletionReason =
  (typeof MatchCompletionReason)[keyof typeof MatchCompletionReason]

export interface RoomPlayer {
  id: Guid
  nickname: string
  score: number
  isReady: boolean
  isConnected: boolean
  isHost: boolean
}

export interface Match {
  id: Guid
  roomId: Guid
  status: MatchStatus
  winnerPlayerId: Guid | null
  startedAt: IsoDateTime | null
  expiresAt: IsoDateTime | null
  completedAt: IsoDateTime | null
  completionReason: MatchCompletionReason | null
}

export interface Room {
  id: Guid
  code: string
  status: RoomStatus
  createdAt: IsoDateTime
  closedAt: IsoDateTime | null
  players: RoomPlayer[]
  matches: Match[]
}

export interface GuessLetterEvaluation {
  position: number
  letter: string
  status: GuessLetterStatus
}
