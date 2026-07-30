const HERO_TILES = [
  { letter: 'W', tone: 'correct' },
  { letter: 'O', tone: 'present' },
  { letter: 'R', tone: 'neutral' },
  { letter: 'D', tone: 'absent' },
  { letter: 'S', tone: 'correct' },
] as const

export function HeroLetterTiles() {
  return (
    <div className="hero-letter-tiles" aria-hidden="true">
      {HERO_TILES.map((tile) => (
        <span
          className={`hero-letter-tile hero-letter-tile--${tile.tone}`}
          key={`${tile.letter}-${tile.tone}`}
        >
          {tile.letter}
        </span>
      ))}
    </div>
  )
}
