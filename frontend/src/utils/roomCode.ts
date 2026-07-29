export function normalizeRoomCode(roomCode: string): string {
  return roomCode.trim().replace(/\s+/g, '').toUpperCase()
}

export function isRoomCodeLike(roomCode: string): boolean {
  return /^[A-Z0-9]{6}$/.test(normalizeRoomCode(roomCode))
}
