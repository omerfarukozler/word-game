import type { Match, Room, RoomPlayer } from '../../../types/domain'

interface GameHeaderProps {
  room: Room
  match: Match
  players: RoomPlayer[]
  connectionLabel: string
}

export function GameHeader({ room, players, connectionLabel }: GameHeaderProps) {
  return (
    <header className="game-header">
      <div>
        <p className="brand-mark">Word Battle</p>
        <p className="eyebrow">Oda {room.code}</p>
        <h1 id="room-title">Kelime savaşı</h1>
      </div>
      <div className="game-header__meta" aria-label="Oyuncular">
        {players.map((player) => (
          <span className="badge" key={player.id}>
            {player.nickname}
            {player.isHost ? ' · Host' : ''}
          </span>
        ))}
        <span className="connection-note">Bağlantı: {connectionLabel}</span>
      </div>
    </header>
  )
}
