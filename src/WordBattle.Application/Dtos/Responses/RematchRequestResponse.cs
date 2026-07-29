namespace WordBattle.Application.Dtos.Responses;

public sealed class RematchRequestResponse
{
    public Guid RequestedByPlayerId { get; set; }

    public DateTime RequestedAt { get; set; }
}
