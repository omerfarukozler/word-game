using Microsoft.AspNetCore.Mvc;
using WordBattle.Application.Dtos.Requests;
using WordBattle.Application.Dtos.Responses;
using WordBattle.Application.Interfaces;

namespace WordBattle.Api.Controllers;

[ApiController]
[Route("matches")]
public sealed class MatchController(IMatchService matchService) : ControllerBase
{
    [HttpPost("{matchId:guid}/guesses", Name = "SubmitGuess")]
    [ProducesResponseType(typeof(SubmitGuessResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SubmitGuessResponse>> SubmitGuess(
        Guid matchId,
        [FromBody] SubmitGuessRequest request,
        CancellationToken cancellationToken)
    {
        var response = await matchService.SubmitGuessAsync(
            matchId,
            request,
            cancellationToken);

        return Ok(response);
    }
}
