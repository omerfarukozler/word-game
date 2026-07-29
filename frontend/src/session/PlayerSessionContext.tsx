import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import {
  clearPlayerSession,
  readPlayerSession,
  type PlayerSession,
  writePlayerSession,
} from './playerSessionStorage'

interface PlayerSessionContextValue {
  session: PlayerSession | null
  setSession: (session: PlayerSession) => void
  clearSession: () => void
}

const PlayerSessionContext = createContext<PlayerSessionContextValue | null>(null)

export function PlayerSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<PlayerSession | null>(() =>
    readPlayerSession(),
  )

  const setSession = useCallback((nextSession: PlayerSession) => {
    writePlayerSession(nextSession)
    setSessionState(nextSession)
  }, [])

  const clearSession = useCallback(() => {
    clearPlayerSession()
    setSessionState(null)
  }, [])

  const value = useMemo(
    () => ({
      session,
      setSession,
      clearSession,
    }),
    [clearSession, session, setSession],
  )

  return (
    <PlayerSessionContext.Provider value={value}>
      {children}
    </PlayerSessionContext.Provider>
  )
}

export function usePlayerSession() {
  const context = useContext(PlayerSessionContext)

  if (!context) {
    throw new Error('usePlayerSession must be used within PlayerSessionProvider.')
  }

  return context
}
