import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreateRoomForm } from '../features/room/components/CreateRoomForm'
import { JoinRoomForm } from '../features/room/components/JoinRoomForm'
import {
  normalizeNickname,
  validateNickname,
  validateRoomCode,
} from '../features/room/utils/validation'
import { createRoom, joinRoom } from '../services/roomApi'
import { usePlayerSession } from '../session/PlayerSessionContext'
import { normalizeRoomCode } from '../utils/roomCode'
import { toFriendlyErrorMessage } from '../utils/problemDetails'

type SubmitAction = 'create' | 'join'

export function HomePage() {
  const navigate = useNavigate()
  const { setSession } = usePlayerSession()
  const [nickname, setNickname] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [submittingAction, setSubmittingAction] = useState<SubmitAction | null>(null)
  const [nicknameError, setNicknameError] = useState<string | null>(null)
  const [createError, setCreateError] = useState<string | null>(null)
  const [joinError, setJoinError] = useState<string | null>(null)

  const isSubmitting = submittingAction !== null

  function validateSharedNickname() {
    const nextNicknameError = validateNickname(nickname)
    setNicknameError(nextNicknameError)

    return nextNicknameError === null
  }

  async function handleCreateRoom() {
    if (isSubmitting || !validateSharedNickname()) {
      return
    }

    const normalizedNickname = normalizeNickname(nickname)
    setCreateError(null)
    setJoinError(null)
    setSubmittingAction('create')

    try {
      const response = await createRoom({ nickname: normalizedNickname })
      setSession({
        roomId: response.roomId,
        roomCode: response.code,
        playerId: response.playerId,
        playerToken: response.playerToken,
        nickname: normalizedNickname,
        isHost: true,
      })
      navigate(`/room/${response.code}`)
    } catch (error) {
      setCreateError(toFriendlyErrorMessage(error))
    } finally {
      setSubmittingAction(null)
    }
  }

  async function handleJoinRoom() {
    if (isSubmitting || !validateSharedNickname()) {
      return
    }

    const normalizedRoomCode = normalizeRoomCode(roomCode)
    const nextRoomCodeError = validateRoomCode(normalizedRoomCode)

    if (nextRoomCodeError) {
      setJoinError(nextRoomCodeError)
      return
    }

    const normalizedNickname = normalizeNickname(nickname)
    setCreateError(null)
    setJoinError(null)
    setSubmittingAction('join')

    try {
      const response = await joinRoom(normalizedRoomCode, {
        nickname: normalizedNickname,
      })
      setSession({
        roomId: response.roomId,
        roomCode: response.code,
        playerId: response.playerId,
        playerToken: response.playerToken,
        nickname: normalizedNickname,
        isHost: false,
      })
      navigate(`/room/${response.code}`)
    } catch (error) {
      setJoinError(toFriendlyErrorMessage(error))
    } finally {
      setSubmittingAction(null)
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
  }

  return (
    <main className="page-shell page-shell--split" aria-labelledby="home-title">
      <p className="eyebrow">Word Battle</p>
      <h1 id="home-title">Odanı kur, savaşı başlat</h1>
      <p className="lede">
        Beş harfli kelime düellosu için bir oda oluştur ya da arkadaşının koduyla katıl.
      </p>

      <form className="room-entry" aria-label="Oda giriş formu" onSubmit={handleSubmit}>
        <div className="field-group">
          <label className="field-label" htmlFor="nickname">
            Nickname
          </label>
          <input
            id="nickname"
            className="text-input"
            value={nickname}
            onChange={(event) => {
              setNickname(event.target.value)
              setNicknameError(null)
            }}
            autoComplete="nickname"
            aria-describedby={nicknameError ? 'nickname-error' : undefined}
          />
          {nicknameError && (
            <p
              className="inline-error"
              id="nickname-error"
              role="alert"
              aria-live="polite"
            >
              {nicknameError}
            </p>
          )}
        </div>

        <CreateRoomForm
          error={createError}
          isSubmitting={submittingAction === 'create'}
          isDisabled={isSubmitting}
          onSubmit={handleCreateRoom}
        />

        <div className="section-divider" role="separator">
          veya
        </div>

        <JoinRoomForm
          roomCode={roomCode}
          error={joinError}
          isSubmitting={submittingAction === 'join'}
          isDisabled={isSubmitting}
          onRoomCodeChange={(nextRoomCode) => {
            setRoomCode(normalizeRoomCode(nextRoomCode))
            setJoinError(null)
          }}
          onSubmit={handleJoinRoom}
        />
      </form>
    </main>
  )
}
