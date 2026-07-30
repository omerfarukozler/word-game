import type { GuessLetterEvaluation, Guid, IsoDateTime } from '../../types/domain'

export interface GameGuess {
  id: Guid
  matchId: Guid
  playerId: Guid
  word: string
  attemptNumber: number
  evaluation: GuessLetterEvaluation[]
  submittedAt: IsoDateTime
  isCorrect?: boolean
}

export interface MatchResult {
  matchId: Guid
  winnerPlayerId: Guid
  completedAt: IsoDateTime
}
