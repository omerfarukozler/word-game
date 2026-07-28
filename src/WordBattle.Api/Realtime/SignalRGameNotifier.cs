using Microsoft.AspNetCore.SignalR;
using WordBattle.Api.Hubs;
using WordBattle.Application.Dtos.Responses;
using WordBattle.Application.Interfaces;

namespace WordBattle.Api.Realtime;

public sealed class SignalRGameNotifier(IHubContext<GameHub> hubContext) : IGameNotifier
{
    private const string RoomUpdatedEventName = "RoomUpdated";

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
}
