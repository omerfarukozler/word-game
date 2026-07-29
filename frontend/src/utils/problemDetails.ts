import type { ProblemDetails } from '../types/api'

const friendlyDetailByBackendMessage = new Map<string, string>([
  ['Room not found.', 'Oda bulunamadı. Kodu kontrol edip tekrar deneyin.'],
  ['Room is full.', 'Bu oda dolu. Yeni bir oda oluşturun veya farklı bir kod deneyin.'],
  [
    'Room is closed.',
    'Bu oda kapalı. Yeni bir oda oluşturun veya farklı bir kod deneyin.',
  ],
  ['Game has already started.', 'Bu odada oyun başlamış. Yeni bir oda oluşturun.'],
  [
    'Nickname is already in use in this room.',
    'Bu odada bu nickname kullanılıyor. Farklı bir nickname seçin.',
  ],
  ['Invalid player token.', 'Oyuncu oturumu geçersiz. Odaya yeniden katılın.'],
  ['Room code is required.', 'Oda kodu gerekli. Kodu kontrol edip tekrar deneyin.'],
  [
    'The room is waiting for another player.',
    'Maçı başlatmak için ikinci oyuncunun katılması gerekiyor.',
  ],
  ['A match is already in progress.', 'Bu odada maç zaten başlamış.'],
  [
    'A new match must be started through the rematch flow.',
    'Bu odada ilk maç tamamlandı. Tekrar oynama akışı sonraki fazda eklenecek.',
  ],
])

export class ApiError extends Error {
  readonly status: number
  readonly title: string
  readonly detail?: string

  constructor(problem: ProblemDetails, fallbackStatus: number) {
    super(problem.detail ?? problem.title ?? 'API request failed')
    this.name = 'ApiError'
    this.status = problem.status ?? fallbackStatus
    this.title = problem.title ?? 'Request failed'
    this.detail = problem.detail
  }
}

export function toFriendlyErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.detail && friendlyDetailByBackendMessage.has(error.detail)) {
      return friendlyDetailByBackendMessage.get(error.detail)!
    }

    if (error.status === 404) {
      return 'İstenen kaynak bulunamadı.'
    }

    if (error.status >= 500) {
      return 'Sunucuda beklenmeyen bir hata oluştu.'
    }

    return 'İstek tamamlanamadı. Bilgileri kontrol edip tekrar deneyin.'
  }

  if (error instanceof TypeError) {
    return 'Sunucuya ulaşılamıyor. Bağlantınızı ve API adresini kontrol edin.'
  }

  return 'Beklenmeyen bir hata oluştu.'
}
