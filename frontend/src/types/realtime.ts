import type { GuessLetterEvaluation, Guid, IsoDateTime, Match, Room } from './domain'

export type RoomUpdatedNotification = Room
export type MatchStartedNotification = Match

export interface GuessSubmittedNotification {
  id: Guid
  matchId: Guid
  playerId: Guid
  word: string
  attemptNumber: number
  evaluation: GuessLetterEvaluation[]
  submittedAt: IsoDateTime
}

export interface MatchCompletedNotification {
  matchId: Guid
  winnerPlayerId: Guid
  completedAt: IsoDateTime
}

export interface RematchRequestedNotification {
  requestedByPlayerId: Guid
  requestedAt: IsoDateTime
}

export interface RematchRejectedNotification {
  requestedByPlayerId: Guid
  rejectedByPlayerId: Guid
  rejectedAt: IsoDateTime
}

export interface GameHubHandlers {
  roomUpdated: (payload: RoomUpdatedNotification) => void
  matchStarted: (payload: MatchStartedNotification) => void
  guessSubmitted: (payload: GuessSubmittedNotification) => void
  matchCompleted: (payload: MatchCompletedNotification) => void
  rematchRequested: (payload: RematchRequestedNotification) => void
  rematchRejected: (payload: RematchRejectedNotification) => void
}
