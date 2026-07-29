using Microsoft.AspNetCore.Mvc;
using WordBattle.Application.Dtos.Requests;
using WordBattle.Application.Dtos.Responses;
using WordBattle.Application.Interfaces;

namespace WordBattle.Api.Controllers;

[ApiController]
[Route("rooms")]
public sealed class RoomController(IRoomService roomService) : ControllerBase
{
    [HttpPost(Name = "CreateRoom")]
    [ProducesResponseType(typeof(CreateRoomResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<CreateRoomResponse>> Create(
        [FromBody] CreateRoomRequest request,
        CancellationToken cancellationToken)
    {
        var response = await roomService.CreateAsync(request, cancellationToken);

        return CreatedAtAction(nameof(Get), new { code = response.Code }, response);
    }

    [HttpPost("{code}/join", Name = "JoinRoom")]
    [ProducesResponseType(typeof(JoinRoomResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<JoinRoomResponse>> Join(
        string code,
        [FromBody] JoinRoomRequest request,
        CancellationToken cancellationToken)
    {
        var response = await roomService.JoinAsync(code, request, cancellationToken);

        return Ok(response);
    }

    [HttpGet("{code}", Name = "GetRoom")]
    [ProducesResponseType(typeof(RoomResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<RoomResponse>> Get(
        string code,
        CancellationToken cancellationToken)
    {
        var response = await roomService.GetAsync(code, cancellationToken);

        return Ok(response);
    }

    [HttpPost("{code}/start", Name = "StartRoomMatch")]
    [ProducesResponseType(typeof(MatchResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<MatchResponse>> Start(
        string code,
        [FromBody] StartMatchRequest request,
        CancellationToken cancellationToken)
    {
        var response = await roomService.StartAsync(code, request, cancellationToken);

        return Ok(response);
    }

    [HttpPost("{code}/rematch", Name = "CreateRoomRematch")]
    [ProducesResponseType(typeof(MatchResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<MatchResponse>> Rematch(
        string code,
        CancellationToken cancellationToken)
    {
        var response = await roomService.RematchAsync(code, cancellationToken);

        return Ok(response);
    }
}
