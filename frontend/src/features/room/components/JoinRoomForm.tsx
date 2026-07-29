import { InlineError } from '../../../components/InlineError'
import { LoadingButton } from '../../../components/LoadingButton'

interface JoinRoomFormProps {
  roomCode: string
  error: string | null
  isSubmitting: boolean
  isDisabled: boolean
  onRoomCodeChange: (roomCode: string) => void
  onSubmit: () => void
}

export function JoinRoomForm({
  roomCode,
  error,
  isSubmitting,
  isDisabled,
  onRoomCodeChange,
  onSubmit,
}: JoinRoomFormProps) {
  return (
    <section className="action-section" aria-labelledby="join-room-title">
      <h2 id="join-room-title">Odaya katıl</h2>
      <p>Paylaşılan oda kodunu gir ve bekleme odasına geç.</p>
      <label className="field-label" htmlFor="room-code">
        Oda kodu
      </label>
      <input
        id="room-code"
        className="text-input text-input--code"
        value={roomCode}
        onChange={(event) => onRoomCodeChange(event.target.value)}
        autoComplete="off"
        spellCheck={false}
        autoCapitalize="characters"
        inputMode="text"
        aria-describedby={error ? 'join-room-error' : undefined}
      />
      <InlineError id="join-room-error" message={error} />
      <LoadingButton
        type="button"
        className="button button--secondary"
        isLoading={isSubmitting}
        loadingLabel="Odaya katılınıyor"
        disabled={isDisabled}
        onClick={onSubmit}
      >
        Odaya Katıl
      </LoadingButton>
    </section>
  )
}
