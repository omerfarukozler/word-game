import type {
  GuessLetterEvaluation,
  Guid,
  IsoDateTime,
  Match,
  MatchCompletionReason,
  Room,
} from './domain'

export interface ProblemDetails {
  status?: number
  title?: string
  detail?: string
  type?: string
  instance?: string
  errors?: Record<string, string[]>
}

export interface CreateRoomRequest {
  nickname: string
}

export interface CreateRoomResponse {
  roomId: Guid
  code: string
  playerId: Guid
  playerToken: string
  isHost: boolean
}

export interface JoinRoomRequest {
  nickname: string
}

export interface JoinRoomResponse {
  roomId: Guid
  code: string
  playerId: Guid
  playerToken: string
}

export interface StartMatchRequest {
  playerToken: string
}

export interface SubmitGuessRequest {
  playerToken: string
  word: string
}

export interface SubmitGuessResponse {
  id: Guid
  matchId: Guid
  playerId: Guid
  word: string
  attemptNumber: number
  evaluation: GuessLetterEvaluation[]
  isCorrect: boolean
  isMatchCompleted: boolean
  winnerPlayerId: Guid | null
  completionReason: MatchCompletionReason | null
  isDraw: boolean
  submittedAt: IsoDateTime
}

export interface RematchRequest {
  playerToken: string
}

export interface RematchRequestResponse {
  requestedByPlayerId: Guid
  requestedAt: IsoDateTime
}

export interface RespondRematchRequest {
  playerToken: string
  accept: boolean
}

export interface RespondRematchResponse {
  accepted: boolean
  match: Match | null
}

export type RoomResponse = Room
export type MatchResponse = Match
