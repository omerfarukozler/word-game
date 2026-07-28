using WordBattle.Application.Dtos.Requests;
using WordBattle.Application.Dtos.Responses;
using WordBattle.Application.Interfaces;

namespace WordBattle.Application.Services;

public sealed class MatchService : IMatchService
{
    public Task<GuessResponse> GuessAsync(
        Guid id,
        GuessRequest request,
        CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }
}
