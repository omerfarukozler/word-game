using Microsoft.AspNetCore.SignalR;

namespace WordBattle.Api.Hubs;

public sealed class GameHub : Hub
{
    public Task JoinRoom(string roomCode, CancellationToken cancellationToken = default)
    {
        roomCode = roomCode.Trim().ToUpperInvariant();

        return Groups.AddToGroupAsync(Context.ConnectionId, roomCode, cancellationToken);
    }

    public Task LeaveRoom(string roomCode, CancellationToken cancellationToken = default)
    {
        roomCode = roomCode.Trim().ToUpperInvariant();

        return Groups.RemoveFromGroupAsync(Context.ConnectionId, roomCode, cancellationToken);
    }
}
