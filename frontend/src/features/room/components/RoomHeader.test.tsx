import { fireEvent, render, screen, waitFor } from '@testing-library/react'
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
  let execCommand: ReturnType<typeof vi.fn>

  beforeEach(() => {
    writeText = vi.fn()
    execCommand = vi.fn()
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText,
      },
    })
    Object.defineProperty(document, 'execCommand', {
      configurable: true,
      value: execCommand,
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
    execCommand.mockReturnValue(false)
    render(<RoomHeader room={room} />)

    fireEvent.click(screen.getByRole('button', { name: /oda kodunu kopyala/i }))

    expect(await screen.findByText(/kod kopyalanamadı/i)).toBeInTheDocument()
  })

  it('falls back to textarea copy when Clipboard API fails', async () => {
    writeText.mockRejectedValue(new Error('insecure origin'))
    execCommand.mockReturnValue(true)
    render(<RoomHeader room={room} />)

    fireEvent.click(screen.getByRole('button', { name: /oda kodunu kopyala/i }))

    await waitFor(() => {
      expect(execCommand).toHaveBeenCalledWith('copy')
    })
    expect(await screen.findByText(/kod kopyalandı/i)).toBeInTheDocument()
  })
})
