import type { CSSProperties } from 'react'

export type LetterTileState =
  'empty' | 'filled' | 'submitting' | 'correct' | 'present' | 'absent' | 'masked'

interface LetterTileProps {
  letter?: string
  state: LetterTileState
  index: number
  label?: string
}

function getStatusLabel(state: LetterTileState): string {
  switch (state) {
    case 'correct':
      return 'doğru yerde'
    case 'present':
      return 'kelimede var fakat yanlış yerde'
    case 'absent':
      return 'kelimede yok'
    case 'filled':
      return 'yazıldı'
    case 'submitting':
      return 'gönderiliyor'
    case 'masked':
      return 'rakip tahmini gizli'
    default:
      return 'boş'
  }
}

export function LetterTile({ letter = '', state, index, label }: LetterTileProps) {
  const accessibleLabel =
    label ??
    (letter ? `${letter} harfi, ${getStatusLabel(state)}` : getStatusLabel(state))

  return (
    <span
      className={`letter-tile letter-tile--${state} game-letter-tile game-letter-tile--${state}`}
      style={{ '--tile-index': index } as CSSProperties}
      aria-label={accessibleLabel}
    >
      {letter}
    </span>
  )
}
