namespace WordBattle.Domain.Entities;

public sealed class Guess
{
    public Guid Id { get; set; }

    public Guid MatchId { get; set; }

    public Guid PlayerId { get; set; }

    public string Word { get; set; } = string.Empty;

    public int AttemptNumber { get; set; }

    public DateTime CreatedAt { get; set; }

    public GameMatch Match { get; set; } = null!;
}
