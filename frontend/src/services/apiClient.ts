import { ApiError } from '../utils/problemDetails'

export interface ApiRequestOptions {
  signal?: AbortSignal
}

const JSON_CONTENT_TYPE = 'application/json'

function getApiBaseUrl(): string {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL

  if (!configuredBaseUrl) {
    throw new Error('VITE_API_BASE_URL is not configured.')
  }

  return configuredBaseUrl.replace(/\/+$/, '')
}

export function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${getApiBaseUrl()}${normalizedPath}`
}

async function parseResponse(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return undefined
  }

  const contentType = response.headers.get('content-type') ?? ''

  if (!contentType.includes(JSON_CONTENT_TYPE)) {
    return response.text()
  }

  return response.json()
}

async function request<TResponse>(
  method: 'GET' | 'POST',
  path: string,
  body?: unknown,
  options: ApiRequestOptions = {},
): Promise<TResponse> {
  const response = await fetch(buildApiUrl(path), {
    method,
    signal: options.signal,
    headers:
      body === undefined
        ? undefined
        : {
            'Content-Type': JSON_CONTENT_TYPE,
          },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  const parsedResponse = await parseResponse(response)

  if (!response.ok) {
    throw new ApiError(
      typeof parsedResponse === 'object' && parsedResponse !== null ? parsedResponse : {},
      response.status,
    )
  }

  return parsedResponse as TResponse
}

export const apiClient = {
  get<TResponse>(path: string, options?: ApiRequestOptions) {
    return request<TResponse>('GET', path, undefined, options)
  },
  post<TResponse, TRequest>(path: string, body: TRequest, options?: ApiRequestOptions) {
    return request<TResponse>('POST', path, body, options)
  },
}
