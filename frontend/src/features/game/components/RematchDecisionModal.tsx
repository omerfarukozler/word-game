import type { RoomPlayer } from '../../../types/domain'
import type { RematchState } from '../../room/hooks/useRoomSession'

interface RematchDecisionModalProps {
  requester: RoomPlayer | null
  rematchState: RematchState
  onRespond: (accept: boolean) => void
}

export function RematchDecisionModal({
  requester,
  rematchState,
  onRespond,
}: RematchDecisionModalProps) {
  const isResponding =
    rematchState.status === 'responding' || rematchState.status === 'starting'

  return (
    <div className="modal-backdrop" role="presentation">
      <section
        className="rematch-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rematch-modal-title"
        aria-describedby="rematch-modal-description"
      >
        <div>
          <p className="eyebrow">Tekrar maç</p>
          <h2 id="rematch-modal-title">Rakibin tekrar oynamak istiyor.</h2>
        </div>
        <p id="rematch-modal-description">
          {requester?.nickname ?? 'Rakibin'} aynı odada yeni bir maç başlatmak istiyor.
        </p>
        {rematchState.error && (
          <p className="inline-error" role="alert" aria-live="polite">
            {rematchState.error}
          </p>
        )}
        {rematchState.message && !rematchState.error && (
          <p className="copy-status" role="status" aria-live="polite">
            {rematchState.message}
          </p>
        )}
        <div className="rematch-modal__actions">
          <button
            className="button button--secondary"
            type="button"
            disabled={isResponding}
            onClick={() => onRespond(false)}
          >
            Reddet
          </button>
          <button
            className="button button--primary"
            type="button"
            disabled={isResponding}
            onClick={() => onRespond(true)}
          >
            Kabul Et
          </button>
        </div>
      </section>
    </div>
  )
}
