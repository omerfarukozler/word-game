interface MatchTimerProps {
  remainingMilliseconds: number | null
}

function formatRemainingTime(remainingMilliseconds: number | null) {
  if (remainingMilliseconds === null) {
    return '--:--'
  }

  const totalSeconds = Math.max(0, Math.ceil(remainingMilliseconds / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

export function MatchTimer({ remainingMilliseconds }: MatchTimerProps) {
  const remainingSeconds =
    remainingMilliseconds === null
      ? null
      : Math.max(0, Math.ceil(remainingMilliseconds / 1000))
  const urgencyClass =
    remainingSeconds !== null && remainingSeconds <= 10
      ? 'match-timer--danger'
      : remainingSeconds !== null && remainingSeconds <= 30
        ? 'match-timer--warning'
        : ''

  return (
    <div
      className={`match-timer ${urgencyClass}`}
      aria-label="Maçta kalan süre"
      aria-live="off"
    >
      {formatRemainingTime(remainingMilliseconds)}
    </div>
  )
}
