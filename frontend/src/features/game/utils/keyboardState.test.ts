import { describe, expect, it } from 'vitest'
import {
  GuessLetterStatus,
  type GuessLetterStatus as LetterStatus,
} from '../../../types/domain'
import type { GameGuess } from '../types'
import { VIRTUAL_KEYBOARD_ROWS } from '../constants/gameRules'
import { buildKeyboardState } from './keyboardState'

function guess(id: string, letter: string, status: LetterStatus): GameGuess {
  return {
    id,
    matchId: 'match-1',
    playerId: 'player-1',
    word: letter.repeat(5),
    attemptNumber: Number(id.replace('guess-', '')),
    evaluation: [{ position: 0, letter, status }],
    submittedAt: '2026-07-30T12:00:00Z',
  }
}

describe('buildKeyboardState', () => {
  it('uses a Turkish Q keyboard layout', () => {
    expect(VIRTUAL_KEYBOARD_ROWS[0]).toEqual([
      'Q',
      'W',
      'E',
      'R',
      'T',
      'Y',
      'U',
      'I',
      'O',
      'P',
      'Ğ',
      'Ü',
    ])
  })

  it('keeps the highest priority letter state', () => {
    const state = buildKeyboardState([
      guess('guess-1', 'A', GuessLetterStatus.Absent),
      guess('guess-2', 'A', GuessLetterStatus.Present),
      guess('guess-3', 'A', GuessLetterStatus.Correct),
      guess('guess-4', 'B', GuessLetterStatus.Absent),
    ])

    expect(state.get('A')).toBe('correct')
    expect(state.get('B')).toBe('absent')
  })
})
