import type { ComponentProps } from 'react'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import {
  GuessLetterStatus,
  MatchCompletionReason,
  MatchStatus,
  RoomStatus,
  type Match,
  type Room,
} from '../../../types/domain'
import type { PlayerSession } from '../../../session/playerSessionStorage'
import type { GameGuess } from '../types'
import { GameScreen } from './GameScreen'

vi.mock('../../../services/matchApi', () => ({
  submitGuess: vi.fn(),
}))

const session: PlayerSession = {
  roomId: 'room-1',
  roomCode: 'ABC123',
  playerId: 'player-1',
  playerToken: 'secret-token',
  nickname: 'Ada',
  isHost: true,
}

const room: Room = {
  id: 'room-1',
  code: 'ABC123',
  status: RoomStatus.Playing,
  createdAt: '2026-07-30T12:00:00Z',
  closedAt: null,
  players: [
    {
      id: 'player-1',
      nickname: 'Ada',
      score: 0,
      isReady: false,
      isConnected: false,
      isHost: true,
    },
    {
      id: 'player-2',
      nickname: 'Bora',
      score: 0,
      isReady: false,
      isConnected: false,
      isHost: false,
    },
  ],
  matches: [],
}

const match: Match = {
  id: 'match-1',
  roomId: 'room-1',
  status: MatchStatus.Playing,
  winnerPlayerId: null,
  startedAt: '2026-07-30T12:01:00Z',
  expiresAt: '2099-07-30T12:03:00Z',
  completedAt: null,
  completionReason: null,
}

const guesses: GameGuess[] = [
  {
    id: 'guess-1',
    matchId: 'match-1',
    playerId: 'player-1',
    word: 'ÇİĞDE',
    attemptNumber: 1,
    evaluation: [
      { position: 0, letter: 'Ç', status: GuessLetterStatus.Correct },
      { position: 1, letter: 'İ', status: GuessLetterStatus.Present },
      { position: 2, letter: 'Ğ', status: GuessLetterStatus.Absent },
      { position: 3, letter: 'D', status: GuessLetterStatus.Absent },
      { position: 4, letter: 'E', status: GuessLetterStatus.Absent },
    ],
    submittedAt: '2026-07-30T12:02:00Z',
  },
  {
    id: 'guess-2',
    matchId: 'match-1',
    playerId: 'player-2',
    word: 'ARMUT',
    attemptNumber: 1,
    evaluation: [
      { position: 0, letter: 'A', status: GuessLetterStatus.Absent },
      { position: 1, letter: 'R', status: GuessLetterStatus.Absent },
      { position: 2, letter: 'M', status: GuessLetterStatus.Absent },
      { position: 3, letter: 'U', status: GuessLetterStatus.Absent },
      { position: 4, letter: 'T', status: GuessLetterStatus.Absent },
    ],
    submittedAt: '2026-07-30T12:02:05Z',
  },
]

function renderGameScreen(overrides: Partial<ComponentProps<typeof GameScreen>> = {}) {
  return render(
    <GameScreen
      room={room}
      match={match}
      session={session}
      guesses={guesses}
      matchResult={null}
      connectionLabel="bağlı"
      rematchState={{
        status: 'idle',
        requestedByPlayerId: null,
        requestedAt: null,
        rejectedAt: null,
        message: null,
        error: null,
      }}
      onGuessSubmitted={vi.fn()}
      onMatchCompleted={vi.fn()}
      onRequestRematch={vi.fn()}
      onRespondRematch={vi.fn()}
      {...overrides}
    />,
  )
}

describe('GameScreen', () => {
  it('shows own guesses but masks opponent words', () => {
    renderGameScreen()

    const ownTile = screen.getByLabelText(/Ç harfi, 1. pozisyon/i)

    expect(ownTile).toBeInTheDocument()
    expect(ownTile).toHaveClass('letter-tile--correct')
    expect(screen.queryByText('ARMUT')).not.toBeInTheDocument()
    const opponentTile = screen.getByLabelText(
      /rakip 1. tahmininin 1. kutusu, kelimede yok/i,
    )

    expect(screen.getByText(/1\. tahmin/i)).toBeInTheDocument()
    expect(
      screen.getByRole('listitem', { name: /rakip 1\. tahmini/i }),
    ).toBeInTheDocument()
    expect(opponentTile).toBeInTheDocument()
    expect(opponentTile).toHaveClass('letter-tile--absent')
    expect(opponentTile).toHaveClass('game-letter-tile--absent')
    expect(opponentTile).toHaveTextContent('')
  })

  it('shows compact evaluation legend in the input panel', () => {
    renderGameScreen()

    const legend = screen.getByLabelText(/renk açıklamaları/i)

    expect(within(legend).getByText(/doğru yerde/i)).toBeInTheDocument()
    expect(within(legend).getByText(/kelimede var/i)).toBeInTheDocument()
    expect(within(legend).getByText(/kelimede yok/i)).toBeInTheDocument()
  })

  it('renders six own board attempt rows', () => {
    renderGameScreen()

    expect(screen.getByLabelText(/aktif tahmin satırı/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/6. tahmin hakkının 1. kutusu boş/i)).toBeInTheDocument()
  })

  it('shows winner result with rematch controls', () => {
    renderGameScreen({
      match: {
        ...match,
        status: MatchStatus.Completed,
        winnerPlayerId: 'player-2',
        completedAt: '2026-07-30T12:03:00Z',
        completionReason: MatchCompletionReason.CorrectGuess,
      },
      matchResult: {
        matchId: 'match-1',
        winnerPlayerId: 'player-2',
        targetWord: 'BİLEK',
        completedAt: '2026-07-30T12:03:00Z',
        completionReason: MatchCompletionReason.CorrectGuess,
        isDraw: false,
      },
    })

    const result = screen.getByRole('status', { name: '' })
    expect(within(result).getByText(/bu tur rakibin kazandı/i)).toBeInTheDocument()
    expect(screen.getByText(/Bora bu turu kazandı/i)).toBeInTheDocument()
    expect(within(result).getByText(/kazanan/i)).toBeInTheDocument()
    expect(within(result).getByText(/senin tahminin/i)).toBeInTheDocument()
    expect(within(result).getByText(/rakip tahmini/i)).toBeInTheDocument()
    expect(within(result).getByText(/oda kodu/i)).toBeInTheDocument()
    expect(within(result).getByText(/kelime/i)).toBeInTheDocument()
    expect(within(result).getByText('BİLEK')).toBeInTheDocument()
    expect(within(result).getByText('ABC123')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /tekrar oyna/i })).toBeInTheDocument()
  })

  it('shows incoming rematch modal without hiding the result panel', () => {
    renderGameScreen({
      match: {
        ...match,
        status: MatchStatus.Completed,
        winnerPlayerId: 'player-1',
        completedAt: '2026-07-30T12:03:00Z',
        completionReason: MatchCompletionReason.CorrectGuess,
      },
      matchResult: {
        matchId: 'match-1',
        winnerPlayerId: 'player-1',
        targetWord: 'BİLEK',
        completedAt: '2026-07-30T12:03:00Z',
        completionReason: MatchCompletionReason.CorrectGuess,
        isDraw: false,
      },
      rematchState: {
        status: 'incoming',
        requestedByPlayerId: 'player-2',
        requestedAt: '2026-07-30T12:04:00Z',
        rejectedAt: null,
        message: 'Rakibin tekrar oynamak istiyor.',
        error: null,
      },
    })

    expect(
      screen.getByRole('dialog', { name: /rakibin tekrar oynamak istiyor/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /kabul et/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reddet/i })).toBeInTheDocument()
  })
})
