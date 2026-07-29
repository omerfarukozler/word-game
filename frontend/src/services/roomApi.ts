import type {
  CreateRoomRequest,
  CreateRoomResponse,
  JoinRoomRequest,
  JoinRoomResponse,
  MatchResponse,
  RematchRequest,
  RematchRequestResponse,
  RespondRematchRequest,
  RespondRematchResponse,
  RoomResponse,
  StartMatchRequest,
} from '../types/api'
import { normalizeRoomCode } from '../utils/roomCode'
import { apiClient, type ApiRequestOptions } from './apiClient'

export function createRoom(request: CreateRoomRequest, options?: ApiRequestOptions) {
  return apiClient.post<CreateRoomResponse, CreateRoomRequest>('/rooms', request, options)
}

export function joinRoom(
  roomCode: string,
  request: JoinRoomRequest,
  options?: ApiRequestOptions,
) {
  return apiClient.post<JoinRoomResponse, JoinRoomRequest>(
    `/rooms/${encodeURIComponent(normalizeRoomCode(roomCode))}/join`,
    request,
    options,
  )
}

export function getRoom(roomCode: string, options?: ApiRequestOptions) {
  return apiClient.get<RoomResponse>(
    `/rooms/${encodeURIComponent(normalizeRoomCode(roomCode))}`,
    options,
  )
}

export function startMatch(
  roomCode: string,
  request: StartMatchRequest,
  options?: ApiRequestOptions,
) {
  return apiClient.post<MatchResponse, StartMatchRequest>(
    `/rooms/${encodeURIComponent(normalizeRoomCode(roomCode))}/start`,
    request,
    options,
  )
}

export function requestRematch(
  roomCode: string,
  request: RematchRequest,
  options?: ApiRequestOptions,
) {
  return apiClient.post<RematchRequestResponse, RematchRequest>(
    `/rooms/${encodeURIComponent(normalizeRoomCode(roomCode))}/rematch/request`,
    request,
    options,
  )
}

export function respondRematch(
  roomCode: string,
  request: RespondRematchRequest,
  options?: ApiRequestOptions,
) {
  return apiClient.post<RespondRematchResponse, RespondRematchRequest>(
    `/rooms/${encodeURIComponent(normalizeRoomCode(roomCode))}/rematch/respond`,
    request,
    options,
  )
}
