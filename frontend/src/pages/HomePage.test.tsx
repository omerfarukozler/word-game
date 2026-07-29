import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '../test/test-utils'
import { PLAYER_SESSION_STORAGE_KEY } from '../session/playerSessionStorage'
import { HomePage } from './HomePage'
import { createRoom, joinRoom } from '../services/roomApi'
import { ApiError } from '../utils/problemDetails'

vi.mock('../services/roomApi', () => ({
  createRoom: vi.fn(),
  joinRoom: vi.fn(),
}))

function LocationView() {
  const location = useLocation()

  return <p data-testid="location">{location.pathname}</p>
}

function renderHomePage() {
  return renderWithProviders(
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/room/:roomCode" element={<LocationView />} />
    </Routes>,
  )
}

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.sessionStorage.clear()
    window.history.pushState({}, '', '/')
  })

  it('renders the shared nickname input', () => {
    renderHomePage()

    expect(screen.getByLabelText(/nickname/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /oda oluştur/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /odaya katıl/i })).toBeInTheDocument()
  })

  it('creates a room, stores host session, and navigates to the room', async () => {
    vi.mocked(createRoom).mockResolvedValue({
      roomId: 'room-1',
      code: 'ABC123',
      playerId: 'player-1',
      playerToken: 'host-token',
      isHost: true,
    })
    const user = userEvent.setup()
    renderHomePage()

    await user.type(screen.getByLabelText(/nickname/i), '  Ada  ')
    await user.click(screen.getByRole('button', { name: /oda oluştur/i }))

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/room/ABC123')
    })
    expect(createRoom).toHaveBeenCalledWith({ nickname: 'Ada' })
    expect(
      JSON.parse(window.sessionStorage.getItem(PLAYER_SESSION_STORAGE_KEY)!),
    ).toMatchObject({
      roomId: 'room-1',
      roomCode: 'ABC123',
      playerId: 'player-1',
      nickname: 'Ada',
      isHost: true,
    })
  })

  it('normalizes room code, joins a room, and stores guest session', async () => {
    vi.mocked(joinRoom).mockResolvedValue({
      roomId: 'room-2',
      code: 'ZXCVBN',
      playerId: 'player-2',
      playerToken: 'guest-token',
    })
    const user = userEvent.setup()
    renderHomePage()

    await user.type(screen.getByLabelText(/nickname/i), 'Bora')
    await user.type(screen.getByLabelText(/oda kodu/i), ' zx cv bn ')
    await user.click(screen.getByRole('button', { name: /odaya katıl/i }))

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/room/ZXCVBN')
    })
    expect(joinRoom).toHaveBeenCalledWith('ZXCVBN', { nickname: 'Bora' })
    expect(
      JSON.parse(window.sessionStorage.getItem(PLAYER_SESSION_STORAGE_KEY)!),
    ).toMatchObject({
      roomId: 'room-2',
      roomCode: 'ZXCVBN',
      playerId: 'player-2',
      nickname: 'Bora',
      isHost: false,
    })
  })

  it('blocks duplicate create submits while loading', async () => {
    vi.mocked(createRoom).mockReturnValue(new Promise(() => undefined))
    const user = userEvent.setup()
    renderHomePage()

    await user.type(screen.getByLabelText(/nickname/i), 'Ada')
    await user.dblClick(screen.getByRole('button', { name: /oda oluştur/i }))

    expect(createRoom).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: /oda oluşturuluyor/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /odaya katıl/i })).toBeDisabled()
  })

  it('blocks duplicate join submits while loading', async () => {
    vi.mocked(joinRoom).mockReturnValue(new Promise(() => undefined))
    const user = userEvent.setup()
    renderHomePage()

    await user.type(screen.getByLabelText(/nickname/i), 'Bora')
    await user.type(screen.getByLabelText(/oda kodu/i), 'ABC123')
    await user.dblClick(screen.getByRole('button', { name: /odaya katıl/i }))

    expect(joinRoom).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: /odaya katılınıyor/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /oda oluştur/i })).toBeDisabled()
  })

  it('shows a friendly backend error near the join form', async () => {
    vi.mocked(joinRoom).mockRejectedValue(
      new ApiError(
        {
          status: 404,
          title: 'Not Found',
          detail: 'Room not found.',
        },
        404,
      ),
    )
    const user = userEvent.setup()
    renderHomePage()

    await user.type(screen.getByLabelText(/nickname/i), 'Bora')
    await user.type(screen.getByLabelText(/oda kodu/i), 'ABC123')
    await user.click(screen.getByRole('button', { name: /odaya katıl/i }))

    expect(await screen.findByText(/oda bulunamadı/i)).toBeInTheDocument()
  })
})
