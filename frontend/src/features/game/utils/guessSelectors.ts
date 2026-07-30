import type { Guid } from '../../../types/domain'
import type { GameGuess } from '../types'

export function sortGuessesByAttempt(guesses: GameGuess[]): GameGuess[] {
  return [...guesses].sort((left, right) => {
    if (left.attemptNumber !== right.attemptNumber) {
      return left.attemptNumber - right.attemptNumber
    }

    return left.submittedAt.localeCompare(right.submittedAt)
  })
}

export function splitGuessesByPlayer(guesses: GameGuess[], currentPlayerId: Guid) {
  const sortedGuesses = sortGuessesByAttempt(guesses)

  return {
    ownGuesses: sortedGuesses.filter((guess) => guess.playerId === currentPlayerId),
    opponentGuesses: sortedGuesses.filter((guess) => guess.playerId !== currentPlayerId),
  }
}

export function upsertOneGuess(guesses: GameGuess[], nextGuess: GameGuess): GameGuess[] {
  const existingIndex = guesses.findIndex((guess) => guess.id === nextGuess.id)

  if (existingIndex === -1) {
    return sortGuessesByAttempt([...guesses, nextGuess])
  }

  return sortGuessesByAttempt(
    guesses.map((guess, index) => (index === existingIndex ? nextGuess : guess)),
  )
}
