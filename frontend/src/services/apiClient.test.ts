import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildApiUrl } from './apiClient'

describe('apiClient URL configuration', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('uses the local API default when VITE_API_BASE_URL is missing', () => {
    vi.stubEnv('VITE_API_BASE_URL', '')

    expect(buildApiUrl('/rooms')).toBe('http://localhost:5050/rooms')
  })

  it('uses the configured API base URL without trailing slashes', () => {
    vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:6060/')

    expect(buildApiUrl('rooms/ABC123')).toBe('http://localhost:6060/rooms/ABC123')
  })
})
