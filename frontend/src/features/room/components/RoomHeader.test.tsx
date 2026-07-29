import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { RoomStatus, type Room } from '../../../types/domain'
import { RoomHeader } from './RoomHeader'

const room: Room = {
  id: 'room-1',
  code: 'ABC123',
  status: RoomStatus.WaitingForPlayer,
  createdAt: '2026-07-29T18:00:00Z',
  closedAt: null,
  players: [],
  matches: [],
}

describe('RoomHeader', () => {
  let writeText: ReturnType<typeof vi.fn>

  beforeEach(() => {
    writeText = vi.fn()
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText,
      },
    })
  })

  it('copies the room code and shows feedback', async () => {
    writeText.mockResolvedValue(undefined)
    render(<RoomHeader room={room} />)

    fireEvent.click(screen.getByRole('button', { name: /oda kodunu kopyala/i }))

    expect(writeText).toHaveBeenCalledWith('ABC123')
    expect(await screen.findByText(/kod kopyalandı/i)).toBeInTheDocument()
  })

  it('shows a safe error when clipboard copy fails', async () => {
    writeText.mockRejectedValue(new Error('denied'))
    render(<RoomHeader room={room} />)

    fireEvent.click(screen.getByRole('button', { name: /oda kodunu kopyala/i }))

    expect(await screen.findByText(/kod kopyalanamadı/i)).toBeInTheDocument()
  })
})
