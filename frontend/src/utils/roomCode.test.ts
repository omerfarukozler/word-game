import { describe, expect, it } from 'vitest'
import { isRoomCodeLike, normalizeRoomCode } from './roomCode'

describe('roomCode utilities', () => {
  it('trims and uppercases room codes', () => {
    expect(normalizeRoomCode(' ab12cd ')).toBe('AB12CD')
  })

  it('validates normalized six-character codes', () => {
    expect(isRoomCodeLike(' ab12cd ')).toBe(true)
    expect(isRoomCodeLike('abc')).toBe(false)
  })
})
