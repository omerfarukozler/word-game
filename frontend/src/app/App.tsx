import { PlayerSessionProvider } from '../session/PlayerSessionContext'
import { AppRouter } from './AppRouter'

export function App() {
  return (
    <PlayerSessionProvider>
      <AppRouter />
    </PlayerSessionProvider>
  )
}
