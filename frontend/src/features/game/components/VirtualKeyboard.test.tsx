import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { VirtualKeyboard } from './VirtualKeyboard'

describe('VirtualKeyboard', () => {
  it('handles letter presses on pointer down and shows tactile feedback', () => {
    const onLetter = vi.fn()

    render(
      <VirtualKeyboard
        keyboardState={new Map()}
        isDisabled={false}
        onLetter={onLetter}
        onBackspace={vi.fn()}
        onEnter={vi.fn()}
      />,
    )

    fireEvent.pointerDown(screen.getByRole('button', { name: /D harfi/i }))

    expect(onLetter).toHaveBeenCalledWith('D')
    expect(screen.getByText('D', { selector: '.keyboard-key__pop' })).toBeInTheDocument()
  })
})
