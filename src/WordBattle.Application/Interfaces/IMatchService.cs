using WordBattle.Application.Dtos.Requests;
using WordBattle.Application.Dtos.Responses;

namespace WordBattle.Application.Interfaces;

public interface IMatchService
{
    Task<GuessResponse> GuessAsync(
        Guid id,
        GuessRequest request,
        CancellationToken cancellationToken = default);
}
