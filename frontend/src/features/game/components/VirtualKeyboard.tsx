import { useState } from 'react'
import { VIRTUAL_KEYBOARD_ROWS } from '../constants/gameRules'
import type { KeyboardLetterState } from '../utils/keyboardState'

interface VirtualKeyboardProps {
  keyboardState: Map<string, KeyboardLetterState>
  isDisabled: boolean
  onLetter: (letter: string) => void
  onBackspace: () => void
  onEnter: () => void
}

export function VirtualKeyboard({
  keyboardState,
  isDisabled,
  onLetter,
  onBackspace,
  onEnter,
}: VirtualKeyboardProps) {
  const [pressedKey, setPressedKey] = useState<string | null>(null)

  function handleKeyPress(key: string, action: () => void) {
    if (isDisabled) {
      return
    }

    setPressedKey(key)
    action()
    window.setTimeout(() => {
      setPressedKey((currentKey) => (currentKey === key ? null : currentKey))
    }, 140)
  }

  return (
    <section className="virtual-keyboard" aria-label="Sanal klavye">
      {VIRTUAL_KEYBOARD_ROWS.map((row, rowIndex) => (
        <div className="keyboard-row" key={`row-${rowIndex}`}>
          {rowIndex === 2 && (
            <button
              type="button"
              className="keyboard-key keyboard-key--wide"
              disabled={isDisabled}
              aria-label="Tahmini gönder"
              onPointerDown={(event) => {
                event.preventDefault()
                handleKeyPress('Enter', onEnter)
              }}
            >
              Enter
            </button>
          )}
          {row.map((letter) => {
            const state = keyboardState.get(letter) ?? 'unused'

            return (
              <button
                type="button"
                className={`keyboard-key keyboard-key--${state}`}
                disabled={isDisabled}
                aria-label={`${letter} harfi`}
                key={letter}
                data-pressed={pressedKey === letter ? true : undefined}
                onPointerDown={(event) => {
                  event.preventDefault()
                  handleKeyPress(letter, () => onLetter(letter))
                }}
              >
                {pressedKey === letter && (
                  <span className="keyboard-key__pop" aria-hidden="true">
                    {letter}
                  </span>
                )}
                {letter}
              </button>
            )
          })}
          {rowIndex === 2 && (
            <button
              type="button"
              className="keyboard-key keyboard-key--wide"
              disabled={isDisabled}
              aria-label="Son harfi sil"
              onPointerDown={(event) => {
                event.preventDefault()
                handleKeyPress('Sil', onBackspace)
              }}
            >
              Sil
            </button>
          )}
        </div>
      ))}
    </section>
  )
}
