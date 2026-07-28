using Microsoft.AspNetCore.SignalR;

namespace WordBattle.Api.Hubs;

public sealed class GameHub : Hub
{
    public Task JoinRoom(string roomCode)
    {
        roomCode = roomCode.Trim().ToUpperInvariant();

        return Groups.AddToGroupAsync(Context.ConnectionId, roomCode, Context.ConnectionAborted);
    }

    public Task LeaveRoom(string roomCode)
    {
        roomCode = roomCode.Trim().ToUpperInvariant();

        return Groups.RemoveFromGroupAsync(Context.ConnectionId, roomCode, Context.ConnectionAborted);
    }
}