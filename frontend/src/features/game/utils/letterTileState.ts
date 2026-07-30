import {
  GuessLetterStatus,
  type GuessLetterStatus as LetterStatus,
} from '../../../types/domain'
import type { LetterTileState } from '../components/LetterTile'

export function getLetterTileState(status: LetterStatus): LetterTileState {
  switch (status) {
    case GuessLetterStatus.Correct:
      return 'correct'
    case GuessLetterStatus.Present:
      return 'present'
    case GuessLetterStatus.Absent:
      return 'absent'
  }
}
