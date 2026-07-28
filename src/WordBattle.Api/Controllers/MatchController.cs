using Microsoft.AspNetCore.Mvc;
using WordBattle.Application.Dtos.Requests;
using WordBattle.Application.Dtos.Responses;
using WordBattle.Application.Interfaces;

namespace WordBattle.Api.Controllers;

[ApiController]
[Route("matches")]
public sealed class MatchController(IMatchService matchService) : ControllerBase
{
    [HttpPost("{id:guid}/guess", Name = "SubmitMatchGuess")]
    [ProducesResponseType(typeof(GuessResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<GuessResponse>> Guess(
        Guid id,
        [FromBody] GuessRequest request,
        CancellationToken cancellationToken)
    {
        var response = await matchService.GuessAsync(id, request, cancellationToken);

        return Ok(response);
    }
}
