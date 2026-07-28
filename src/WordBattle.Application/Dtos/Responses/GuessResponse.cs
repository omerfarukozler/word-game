namespace WordBattle.Application.Dtos.Responses;

public sealed class GuessResponse
{
    public Guid Id { get; set; }

    public Guid MatchId { get; set; }

    public Guid PlayerId { get; set; }

    public string Word { get; set; } = string.Empty;

    public int AttemptNumber { get; set; }

    public DateTime CreatedAt { get; set; }
}
