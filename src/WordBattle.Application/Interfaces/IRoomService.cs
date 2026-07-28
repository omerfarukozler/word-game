using WordBattle.Application.Dtos.Requests;
using WordBattle.Application.Dtos.Responses;

namespace WordBattle.Application.Interfaces;

public interface IRoomService
{
    Task<CreateRoomResponse> CreateAsync(
        CreateRoomRequest request,
        CancellationToken cancellationToken = default);

    Task<JoinRoomResponse> JoinAsync(
        string code,
        JoinRoomRequest request,
        CancellationToken cancellationToken = default);

    Task<RoomResponse> GetAsync(
        string code,
        CancellationToken cancellationToken = default);

    Task<MatchResponse> StartAsync(
        string code,
        CancellationToken cancellationToken = default);

    Task<MatchResponse> RematchAsync(
        string code,
        CancellationToken cancellationToken = default);
}
