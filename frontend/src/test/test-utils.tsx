import { render, type RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { PlayerSessionProvider } from '../session/PlayerSessionContext'

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <BrowserRouter>
      <PlayerSessionProvider>{children}</PlayerSessionProvider>
    </BrowserRouter>
  )
}

export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return render(ui, { wrapper: Providers, ...options })
}
