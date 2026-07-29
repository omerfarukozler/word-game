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
        StartMatchRequest request,
        CancellationToken cancellationToken = default);

    Task<RematchRequestResponse> RequestRematchAsync(
        string code,
        RematchRequest request,
        CancellationToken cancellationToken = default);

    Task<RespondRematchResponse> RespondRematchAsync(
        string code,
        RespondRematchRequest request,
        CancellationToken cancellationToken = default);
}
