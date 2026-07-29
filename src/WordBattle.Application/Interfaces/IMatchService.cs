using WordBattle.Application.Dtos.Requests;
using WordBattle.Application.Dtos.Responses;

namespace WordBattle.Application.Interfaces;

public interface IMatchService
{
    Task<SubmitGuessResponse> SubmitGuessAsync(
        Guid matchId,
        SubmitGuessRequest request,
        CancellationToken cancellationToken = default);
}
