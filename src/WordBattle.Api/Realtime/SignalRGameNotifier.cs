using Microsoft.AspNetCore.SignalR;
using WordBattle.Api.Hubs;
using WordBattle.Application.Dtos.Notifications;
using WordBattle.Application.Dtos.Responses;
using WordBattle.Application.Interfaces;

namespace WordBattle.Api.Realtime;

public sealed class SignalRGameNotifier(IHubContext<GameHub> hubContext) : IGameNotifier
{
    private const string RoomUpdatedEventName = "RoomUpdated";
    private const string MatchStartedEventName = "MatchStarted";
    private const string GuessSubmittedEventName = "GuessSubmitted";
    private const string MatchCompletedEventName = "MatchCompleted";
    private const string RematchRequestedEventName = "RematchRequested";
    private const string RematchRejectedEventName = "RematchRejected";

    public Task RoomUpdatedAsync(
        string roomCode,
        RoomResponse room,
        CancellationToken cancellationToken = default)
    {
        var normalizedRoomCode = roomCode.Trim().ToUpperInvariant();

        return hubContext.Clients
            .Group(normalizedRoomCode)
            .SendAsync(RoomUpdatedEventName, room, cancellationToken);
    }

    public Task MatchStartedAsync(
        string roomCode,
        MatchResponse match,
        CancellationToken cancellationToken = default)
    {
        var normalizedRoomCode = roomCode.Trim().ToUpperInvariant();

        return hubContext.Clients
            .Group(normalizedRoomCode)
            .SendAsync(MatchStartedEventName, match, cancellationToken);
    }

    public Task GuessSubmittedAsync(
        string roomCode,
        GuessSubmittedNotification notification,
        CancellationToken cancellationToken = default)
    {
        var normalizedRoomCode = roomCode.Trim().ToUpperInvariant();

        return hubContext.Clients
            .Group(normalizedRoomCode)
            .SendAsync(GuessSubmittedEventName, notification, cancellationToken);
    }

    public Task MatchCompletedAsync(
        string roomCode,
        MatchCompletedNotification notification,
        CancellationToken cancellationToken = default)
    {
        var normalizedRoomCode = roomCode.Trim().ToUpperInvariant();

        return hubContext.Clients
            .Group(normalizedRoomCode)
            .SendAsync(MatchCompletedEventName, notification, cancellationToken);
    }

    public Task RematchRequestedAsync(
        string roomCode,
        RematchRequestedNotification notification,
        CancellationToken cancellationToken = default)
    {
        var normalizedRoomCode = roomCode.Trim().ToUpperInvariant();

        return hubContext.Clients
            .Group(normalizedRoomCode)
            .SendAsync(RematchRequestedEventName, notification, cancellationToken);
    }

    public Task RematchRejectedAsync(
        string roomCode,
        RematchRejectedNotification notification,
        CancellationToken cancellationToken = default)
    {
        var normalizedRoomCode = roomCode.Trim().ToUpperInvariant();

        return hubContext.Clients
            .Group(normalizedRoomCode)
            .SendAsync(RematchRejectedEventName, notification, cancellationToken);
    }
}
