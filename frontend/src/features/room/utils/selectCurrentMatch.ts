import { MatchStatus, type Match, type Room } from '../../../types/domain'

function getSortableDate(match: Match): number {
  const date = match.startedAt ?? match.completedAt

  return date ? new Date(date).getTime() : 0
}

export function selectCurrentMatch(room: Room): Match | null {
  const playingMatch = room.matches
    .filter((match) => match.status === MatchStatus.Playing)
    .sort((left, right) => getSortableDate(right) - getSortableDate(left))[0]

  if (playingMatch) {
    return playingMatch
  }

  return (
    room.matches
      .filter((match) => match.status === MatchStatus.Completed)
      .sort((left, right) => getSortableDate(right) - getSortableDate(left))[0] ?? null
  )
}
