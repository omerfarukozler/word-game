import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MatchStatus, RoomStatus, type Room } from '../types/domain'
import {
  PLAYER_SESSION_STORAGE_KEY,
  type PlayerSession,
} from '../session/playerSessionStorage'
import { renderWithProviders } from '../test/test-utils'
import { ApiError } from '../utils/problemDetails'
import { getRoom, startMatch } from '../services/roomApi'
import { RoomPage } from './RoomPage'

vi.mock('../services/roomApi', () => ({
  getRoom: vi.fn(),
  startMatch: vi.fn(),
}))

vi.mock('../services/gameHub', () => ({
  createGameHubClient: () => ({
    connection: {},
    start: vi.fn(),
    stop: vi.fn().mockResolvedValue(undefined),
    subscribeToRoom: vi.fn().mockResolvedValue(undefined),
    unsubscribeFromRoom: vi.fn().mockResolvedValue(undefined),
    registerHandlers: vi.fn(() => vi.fn()),
    onReconnected: vi.fn(() => vi.fn()),
    setReconnectRoom: vi.fn(),
  }),
}))

const hostSession: PlayerSession = {
  roomId: 'room-1',
  roomCode: 'ABC123',
  playerId: 'host-1',
  playerToken: 'host-token',
  nickname: 'Ada',
  isHost: true,
}

function createRoomSnapshot(overrides: Partial<Room> = {}): Room {
  return {
    id: 'room-1',
    code: 'ABC123',
    status: RoomStatus.WaitingForPlayer,
    createdAt: '2026-07-29T18:00:00Z',
    closedAt: null,
    players: [
      {
        id: 'host-1',
        nickname: 'Ada',
        score: 0,
        isReady: false,
        isConnected: false,
        isHost: true,
      },
    ],
    matches: [],
    ...overrides,
  }
}

function writeSession(session: PlayerSession = hostSession) {
  window.sessionStorage.setItem(PLAYER_SESSION_STORAGE_KEY, JSON.stringify(session))
}

function renderRoomPage() {
  return renderWithProviders(
    <Routes>
      <Route path="/" element={<p>Home route</p>} />
      <Route path="/room/:roomCode" element={<RoomPage />} />
    </Routes>,
  )
}

describe('RoomPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.sessionStorage.clear()
    window.history.pushState({}, '', '/room/ABC123')
  })

  it('shows a safe message when there is no session', () => {
    renderRoomPage()

    expect(screen.getByText(/oyuncu oturumu bulunamadı/i)).toBeInTheDocument()
  })

  it('clears mismatched session and navigates home safely', async () => {
    writeSession({ ...hostSession, roomCode: 'OTHER1' })
    renderRoomPage()

    await waitFor(() => {
      expect(window.location.pathname).toBe('/')
    })
    expect(window.sessionStorage.getItem(PLAYER_SESSION_STORAGE_KEY)).toBeNull()
  })

  it('renders loading state while fetching the room', () => {
    writeSession()
    vi.mocked(getRoom).mockReturnValue(new Promise(() => undefined))

    renderRoomPage()

    expect(screen.getByText(/oda yükleniyor/i)).toBeInTheDocument()
  })

  it('renders host waiting message for a single-player room', async () => {
    writeSession()
    vi.mocked(getRoom).mockResolvedValue(createRoomSnapshot())

    renderRoomPage()

    expect(await screen.findByRole('heading', { name: 'ABC123' })).toBeInTheDocument()
    expect(
      await screen.findByRole('heading', { name: 'İkinci oyuncu bekleniyor' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Ada')).toBeInTheDocument()
    expect(screen.getByText('Sen')).toBeInTheDocument()
    expect(screen.getByText('Host')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /maçı başlat/i })).not.toBeInTheDocument()
  })

  it('renders a friendly room fetch error', async () => {
    writeSession()
    vi.mocked(getRoom).mockRejectedValue(
      new ApiError(
        {
          status: 404,
          title: 'Not Found',
          detail: 'Room not found.',
        },
        404,
      ),
    )

    renderRoomPage()

    expect(await screen.findByRole('alert')).toHaveTextContent(/oda bulunamadı/i)
  })

  it('renders host start button when two players are ready and no match exists', async () => {
    writeSession()
    vi.mocked(getRoom).mockResolvedValue(
      createRoomSnapshot({
        status: RoomStatus.Ready,
        players: [
          ...createRoomSnapshot().players,
          {
            id: 'guest-1',
            nickname: 'Bora',
            score: 0,
            isReady: false,
            isConnected: false,
            isHost: false,
          },
        ],
      }),
    )

    renderRoomPage()

    expect(
      await screen.findByRole('button', { name: /maçı başlat/i }),
    ).toBeInTheDocument()
  })

  it('does not render start button for guests', async () => {
    writeSession({ ...hostSession, playerId: 'guest-1', isHost: false })
    vi.mocked(getRoom).mockResolvedValue(
      createRoomSnapshot({
        status: RoomStatus.Ready,
        players: [
          ...createRoomSnapshot().players,
          {
            id: 'guest-1',
            nickname: 'Bora',
            score: 0,
            isReady: false,
            isConnected: false,
            isHost: false,
          },
        ],
      }),
    )

    renderRoomPage()

    expect(
      await screen.findByText(/oda sahibinin maçı başlatması bekleniyor/i),
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /maçı başlat/i })).not.toBeInTheDocument()
  })

  it('does not render start button when a previous match exists', async () => {
    writeSession()
    vi.mocked(getRoom).mockResolvedValue(
      createRoomSnapshot({
        status: RoomStatus.Ready,
        players: [
          ...createRoomSnapshot().players,
          {
            id: 'guest-1',
            nickname: 'Bora',
            score: 0,
            isReady: false,
            isConnected: false,
            isHost: false,
          },
        ],
        matches: [
          {
            id: 'match-1',
            roomId: 'room-1',
            status: 2,
            winnerPlayerId: 'host-1',
            startedAt: '2026-07-29T18:00:00Z',
            completedAt: '2026-07-29T18:01:00Z',
          },
        ],
      }),
    )

    renderRoomPage()

    expect(await screen.findByText(/tur tamamlandı/i)).toBeInTheDocument()
    expect(screen.getByText(/aynı odada yeni bir karşılaşma/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /maçı başlat/i })).not.toBeInTheDocument()
  })

  it('renders the match started placeholder without guess controls', async () => {
    writeSession()
    vi.mocked(getRoom).mockResolvedValue(
      createRoomSnapshot({
        status: RoomStatus.Playing,
        matches: [
          {
            id: 'match-1',
            roomId: 'room-1',
            status: MatchStatus.Playing,
            winnerPlayerId: null,
            startedAt: '2026-07-29T18:00:00Z',
            completedAt: null,
          },
        ],
      }),
    )

    renderRoomPage()

    expect(
      await screen.findByRole('heading', { name: /kelime savaşı/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('grid', { name: /kendi tahmin tahtan/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /tahmini gönder/i })).toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: /tahmin/i })).not.toBeInTheDocument()
  })

  it('sends player token in the start body and blocks duplicate start clicks', async () => {
    writeSession()
    vi.mocked(getRoom).mockResolvedValue(
      createRoomSnapshot({
        status: RoomStatus.Ready,
        players: [
          ...createRoomSnapshot().players,
          {
            id: 'guest-1',
            nickname: 'Bora',
            score: 0,
            isReady: false,
            isConnected: false,
            isHost: false,
          },
        ],
      }),
    )
    vi.mocked(startMatch).mockReturnValue(new Promise(() => undefined))
    const user = userEvent.setup()

    renderRoomPage()

    await user.dblClick(await screen.findByRole('button', { name: /maçı başlat/i }))

    expect(startMatch).toHaveBeenCalledTimes(1)
    expect(startMatch).toHaveBeenCalledWith('ABC123', { playerToken: 'host-token' })
    expect(screen.getByRole('button', { name: /maç başlatılıyor/i })).toBeDisabled()
  })
})
