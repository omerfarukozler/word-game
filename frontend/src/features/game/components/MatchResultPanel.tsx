import type { Room } from '../../../types/domain'
import type { MatchResult } from '../types'

interface MatchResultPanelProps {
  result: MatchResult
  room: Room
  currentPlayerId: string
  ownGuessCount: number
  opponentGuessCount: number
}

export function MatchResultPanel({
  result,
  room,
  currentPlayerId,
  ownGuessCount,
  opponentGuessCount,
}: MatchResultPanelProps) {
  const winner = room.players.find((player) => player.id === result.winnerPlayerId)
  const didCurrentPlayerWin = result.winnerPlayerId === currentPlayerId

  return (
    <section className="game-panel match-result-panel" role="status" aria-live="polite">
      <p className="eyebrow">Tur tamamlandı</p>
      <h2>{didCurrentPlayerWin ? 'Kazandın!' : 'Bu tur rakibin kazandı.'}</h2>
      <p>
        {didCurrentPlayerWin
          ? 'Kelimeyi rakibinden önce buldun.'
          : winner
            ? `${winner.nickname} bu turu kazandı.`
            : 'Kazanan oyuncu belirlendi.'}
      </p>
      <dl className="result-stats">
        <div>
          <dt>Kazanan</dt>
          <dd>{winner?.nickname ?? 'Bilinmiyor'}</dd>
        </div>
        <div>
          <dt>Senin tahminin</dt>
          <dd>{ownGuessCount}</dd>
        </div>
        <div>
          <dt>Rakip tahmini</dt>
          <dd>{opponentGuessCount}</dd>
        </div>
        <div>
          <dt>Oda kodu</dt>
          <dd>{room.code}</dd>
        </div>
      </dl>
      <p>Aynı odada yeni bir karşılaşma başlatabileceksiniz.</p>
    </section>
  )
}
