using WordBattle.Application.Dtos.Notifications;
using WordBattle.Application.Dtos.Responses;

namespace WordBattle.Application.Interfaces;

public interface IGameNotifier
{
    Task RoomUpdatedAsync(
        string roomCode,
        RoomResponse room,
        CancellationToken cancellationToken = default);

    Task MatchStartedAsync(
        string roomCode,
        MatchResponse match,
        CancellationToken cancellationToken = default);

    Task GuessSubmittedAsync(
        string roomCode,
        GuessSubmittedNotification notification,
        CancellationToken cancellationToken = default);

    Task MatchCompletedAsync(
        string roomCode,
        MatchCompletedNotification notification,
        CancellationToken cancellationToken = default);

    Task RematchRequestedAsync(
        string roomCode,
        RematchRequestedNotification notification,
        CancellationToken cancellationToken = default);

    Task RematchRejectedAsync(
        string roomCode,
        RematchRejectedNotification notification,
        CancellationToken cancellationToken = default);
}
