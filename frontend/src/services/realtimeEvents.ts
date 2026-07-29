export const RealtimeEvents = {
  RoomUpdated: 'RoomUpdated',
  MatchStarted: 'MatchStarted',
  GuessSubmitted: 'GuessSubmitted',
  MatchCompleted: 'MatchCompleted',
  RematchRequested: 'RematchRequested',
  RematchRejected: 'RematchRejected',
} as const

export const HubMethods = {
  SubscribeToRoom: 'SubscribeToRoom',
  UnsubscribeFromRoom: 'UnsubscribeFromRoom',
} as const
