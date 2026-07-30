import {
  GuessLetterStatus,
  type GuessLetterStatus as LetterStatus,
} from '../../../types/domain'
import type { GameGuess } from '../types'

export type KeyboardLetterState = 'unused' | 'absent' | 'present' | 'correct'

const statusPriority: Record<KeyboardLetterState, number> = {
  unused: 0,
  absent: 1,
  present: 2,
  correct: 3,
}

export function getTileStateFromStatus(status: LetterStatus): KeyboardLetterState {
  switch (status) {
    case GuessLetterStatus.Correct:
      return 'correct'
    case GuessLetterStatus.Present:
      return 'present'
    case GuessLetterStatus.Absent:
      return 'absent'
  }
}

export function buildKeyboardState(ownGuesses: GameGuess[]) {
  const state = new Map<string, KeyboardLetterState>()

  ownGuesses.forEach((guess) => {
    guess.evaluation.forEach((item) => {
      const nextState = getTileStateFromStatus(item.status)
      const previousState = state.get(item.letter) ?? 'unused'

      if (statusPriority[nextState] > statusPriority[previousState]) {
        state.set(item.letter, nextState)
      }
    })
  })

  return state
}
