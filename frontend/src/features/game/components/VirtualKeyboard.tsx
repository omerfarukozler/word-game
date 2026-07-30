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
              onClick={onEnter}
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
                onClick={() => onLetter(letter)}
              >
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
              onClick={onBackspace}
            >
              Sil
            </button>
          )}
        </div>
      ))}
    </section>
  )
}
