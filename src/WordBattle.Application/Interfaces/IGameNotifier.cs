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
}
