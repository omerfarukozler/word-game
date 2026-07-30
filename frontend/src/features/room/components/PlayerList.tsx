import type { RoomPlayer } from '../../../types/domain'

interface PlayerListProps {
  players: RoomPlayer[]
  currentPlayerId: string
}

export function PlayerList({ players, currentPlayerId }: PlayerListProps) {
  return (
    <section className="status-panel" aria-labelledby="players-title">
      <p className="eyebrow">Lobi</p>
      <h2 id="players-title">Oyuncular</h2>
      <ul className="player-list">
        {players.map((player) => (
          <li className="player-list__item" key={player.id}>
            <span className="player-list__avatar" aria-hidden="true">
              {player.nickname.trim().charAt(0).toUpperCase() || '?'}
            </span>
            <span className="player-list__identity">
              <span className="player-list__name">{player.nickname}</span>
            </span>
            <span className="player-list__badges">
              {player.id === currentPlayerId && <span className="badge">Sen</span>}
              {player.isHost && <span className="badge badge--host">Host</span>}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
