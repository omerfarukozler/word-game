import { normalizeRoomCode } from '../../../utils/roomCode'

const MIN_NICKNAME_LENGTH = 2
const MAX_NICKNAME_LENGTH = 32

export function normalizeNickname(nickname: string): string {
  return nickname.trim()
}

export function validateNickname(nickname: string): string | null {
  const normalizedNickname = normalizeNickname(nickname)

  if (!normalizedNickname) {
    return 'Nickname gerekli.'
  }

  if (normalizedNickname.length < MIN_NICKNAME_LENGTH) {
    return 'Nickname en az 2 karakter olmalı.'
  }

  if (normalizedNickname.length > MAX_NICKNAME_LENGTH) {
    return 'Nickname en fazla 32 karakter olabilir.'
  }

  return null
}

export function validateRoomCode(roomCode: string): string | null {
  if (!normalizeRoomCode(roomCode)) {
    return 'Oda kodu gerekli.'
  }

  return null
}
