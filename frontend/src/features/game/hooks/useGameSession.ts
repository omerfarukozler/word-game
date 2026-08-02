import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { submitGuess } from '../../../services/matchApi'
import { MatchStatus, type Match, type Room } from '../../../types/domain'
import type {
  MatchCompletedNotification,
  GuessSubmittedNotification,
} from '../../../types/realtime'
import type { PlayerSession } from '../../../session/playerSessionStorage'
import { toFriendlyErrorMessage } from '../../../utils/problemDetails'
import { CURRENT_WORD_LENGTH, MAX_GUESS_ATTEMPTS } from '../constants/gameRules'
import type { GameGuess, MatchResult } from '../types'
import { splitGuessesByPlayer } from '../utils/guessSelectors'
import { buildKeyboardState } from '../utils/keyboardState'
import { normalizeGuessLetter, normalizeGuessWord } from '../utils/normalizeGuess'

interface UseGameSessionOptions {
  room: Room
  match: Match
  session: PlayerSession
  guesses: GameGuess[]
  matchResult: MatchResult | null
  onGuessSubmitted: (guess: GuessSubmittedNotification) => void
  onMatchCompleted: (notification: MatchCompletedNotification) => void
}

function isTypingInFormElement(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return Boolean(target.closest('input, textarea, select, [contenteditable="true"]'))
}

function getRemainingMilliseconds(expiresAt: string | null) {
  if (!expiresAt) {
    return null
  }

  return Math.max(0, new Date(expiresAt).getTime() - Date.now())
}

export function useGameSession({
  room,
  match,
  session,
  guesses,
  matchResult,
  onGuessSubmitted,
  onMatchCompleted,
}: UseGameSessionOptions) {
  const [currentGuess, setCurrentGuess] = useState('')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitMessage, setSubmitMessage] = useState<string | null>(null)
  const [isSubmittingGuess, setIsSubmittingGuess] = useState(false)
  const [remainingMilliseconds, setRemainingMilliseconds] = useState<number | null>(() =>
    getRemainingMilliseconds(match.expiresAt),
  )
  const [shakeToken, setShakeToken] = useState(0)
  const previousMatchIdRef = useRef(match.id)
  const isSubmittingGuessRef = useRef(false)

  const isCompleted = match.status === MatchStatus.Completed || matchResult !== null
  const isTimeExpired =
    !isCompleted && remainingMilliseconds !== null && remainingMilliseconds <= 0

  useEffect(() => {
    if (previousMatchIdRef.current === match.id) {
      return
    }

    previousMatchIdRef.current = match.id
    setCurrentGuess('')
    setSubmitError(null)
    setSubmitMessage(null)
    setIsSubmittingGuess(false)
    isSubmittingGuessRef.current = false
    setShakeToken(0)
  }, [match.id])

  useEffect(() => {
    function updateRemainingMilliseconds() {
      setRemainingMilliseconds(getRemainingMilliseconds(match.expiresAt))
    }

    updateRemainingMilliseconds()
    const intervalId = window.setInterval(updateRemainingMilliseconds, 1000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [match.expiresAt])

  const { ownGuesses, opponentGuesses } = useMemo(
    () =>
      splitGuessesByPlayer(
        guesses.filter((guess) => guess.matchId === match.id),
        session.playerId,
      ),
    [guesses, match.id, session.playerId],
  )
  const keyboardState = useMemo(() => buildKeyboardState(ownGuesses), [ownGuesses])
  const hasRemainingGuesses = ownGuesses.length < MAX_GUESS_ATTEMPTS

  const opponent = room.players.find((player) => player.id !== session.playerId) ?? null

  const appendLetter = useCallback(
    (letter: string) => {
      if (
        !hasRemainingGuesses ||
        isCompleted ||
        isTimeExpired ||
        isSubmittingGuessRef.current
      ) {
        return
      }

      const normalizedLetter = normalizeGuessLetter(letter)

      if (!normalizedLetter) {
        return
      }

      setCurrentGuess((previousGuess) => {
        setSubmitError(null)

        if (previousGuess.length >= CURRENT_WORD_LENGTH) {
          return previousGuess
        }

        return `${previousGuess}${normalizedLetter}`
      })
    },
    [hasRemainingGuesses, isCompleted, isTimeExpired],
  )

  const removeLetter = useCallback(() => {
    if (isCompleted || isTimeExpired || isSubmittingGuessRef.current) {
      return
    }

    setSubmitError(null)
    setCurrentGuess((previousGuess) => previousGuess.slice(0, -1))
  }, [isCompleted, isTimeExpired])

  const triggerInvalidGuess = useCallback((message: string) => {
    setSubmitError(message)
    setShakeToken((previousToken) => previousToken + 1)
  }, [])

  const submitCurrentGuess = useCallback(async () => {
    if (isCompleted || isSubmittingGuessRef.current) {
      return
    }

    if (isTimeExpired) {
      triggerInvalidGuess('Süre doldu, sonuç bekleniyor...')
      return
    }

    if (!hasRemainingGuesses) {
      triggerInvalidGuess(`${MAX_GUESS_ATTEMPTS} tahmin hakkını kullandın.`)
      return
    }

    const normalizedWord = normalizeGuessWord(currentGuess)

    if (normalizedWord.length !== CURRENT_WORD_LENGTH) {
      triggerInvalidGuess(`Tahmin ${CURRENT_WORD_LENGTH} harf olmalıdır.`)
      return
    }

    isSubmittingGuessRef.current = true
    setIsSubmittingGuess(true)
    setSubmitError(null)
    setSubmitMessage(null)

    try {
      const response = await submitGuess(match.id, {
        playerToken: session.playerToken,
        word: normalizedWord,
      })

      onGuessSubmitted({
        id: response.id,
        matchId: response.matchId,
        playerId: response.playerId,
        word: response.word,
        attemptNumber: response.attemptNumber,
        evaluation: response.evaluation,
        submittedAt: response.submittedAt,
      })
      setCurrentGuess('')
      setSubmitMessage(response.isCorrect ? 'Doğru tahmin!' : 'Tahmin gönderildi.')

      if (
        response.isMatchCompleted &&
        response.completionReason !== null &&
        response.submittedAt
      ) {
        onMatchCompleted({
          matchId: response.matchId,
          winnerPlayerId: response.winnerPlayerId,
          targetWord: response.targetWord,
          completedAt: response.submittedAt,
          completionReason: response.completionReason,
          isDraw: response.isDraw,
        })
      }
    } catch (error) {
      triggerInvalidGuess(toFriendlyErrorMessage(error))
    } finally {
      isSubmittingGuessRef.current = false
      setIsSubmittingGuess(false)
    }
  }, [
    currentGuess,
    hasRemainingGuesses,
    isCompleted,
    isTimeExpired,
    match.id,
    onGuessSubmitted,
    onMatchCompleted,
    session.playerToken,
    triggerInvalidGuess,
  ])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (
        isTypingInFormElement(event.target) ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey
      ) {
        return
      }

      if (event.key === 'Enter') {
        event.preventDefault()
        void submitCurrentGuess()
        return
      }

      if (event.key === 'Backspace') {
        event.preventDefault()
        removeLetter()
        return
      }

      if (event.key.length === 1) {
        const normalizedLetter = normalizeGuessLetter(event.key)

        if (normalizedLetter) {
          event.preventDefault()
          appendLetter(normalizedLetter)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [appendLetter, removeLetter, submitCurrentGuess])

  return {
    currentGuess,
    ownGuesses,
    opponent,
    opponentGuesses,
    keyboardState,
    hasRemainingGuesses,
    isCompleted,
    isTimeExpired,
    remainingMilliseconds,
    isSubmittingGuess,
    submitError,
    submitMessage,
    shakeToken,
    appendLetter,
    removeLetter,
    submitCurrentGuess,
  }
}
