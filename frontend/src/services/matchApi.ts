import type { SubmitGuessRequest, SubmitGuessResponse } from '../types/api'
import type { Guid } from '../types/domain'
import { apiClient, type ApiRequestOptions } from './apiClient'

export function submitGuess(
  matchId: Guid,
  request: SubmitGuessRequest,
  options?: ApiRequestOptions,
) {
  return apiClient.post<SubmitGuessResponse, SubmitGuessRequest>(
    `/matches/${encodeURIComponent(matchId)}/guesses`,
    request,
    options,
  )
}
