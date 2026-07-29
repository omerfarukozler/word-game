import { LoadingButton } from '../../../components/LoadingButton'
import { InlineError } from '../../../components/InlineError'

interface CreateRoomFormProps {
  error: string | null
  isSubmitting: boolean
  isDisabled: boolean
  onSubmit: () => void
}

export function CreateRoomForm({
  error,
  isSubmitting,
  isDisabled,
  onSubmit,
}: CreateRoomFormProps) {
  return (
    <section className="action-section" aria-labelledby="create-room-title">
      <h2 id="create-room-title">Yeni oda oluştur</h2>
      <p>Bir oda aç, kodu arkadaşınla paylaş ve ilk maçı başlat.</p>
      <InlineError id="create-room-error" message={error} />
      <LoadingButton
        type="button"
        className="button button--primary"
        isLoading={isSubmitting}
        loadingLabel="Oda oluşturuluyor"
        disabled={isDisabled}
        aria-describedby={error ? 'create-room-error' : undefined}
        onClick={onSubmit}
      >
        Oda Oluştur
      </LoadingButton>
    </section>
  )
}
