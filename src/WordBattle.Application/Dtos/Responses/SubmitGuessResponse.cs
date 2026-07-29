namespace WordBattle.Application.Dtos.Responses;

public sealed class SubmitGuessResponse
{
    public Guid Id { get; set; }

    public Guid MatchId { get; set; }

    public Guid PlayerId { get; set; }

    public string Word { get; set; } = string.Empty;

    public DateTime SubmittedAt { get; set; }
}
