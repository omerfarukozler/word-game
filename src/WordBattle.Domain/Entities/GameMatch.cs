using WordBattle.Domain.Enums;

namespace WordBattle.Domain.Entities;

public sealed class GameMatch
{
    public Guid Id { get; set; }

    public Guid RoomId { get; set; }

    public string TargetWord { get; set; } = string.Empty;

    public MatchStatus Status { get; set; }

    public Guid? WinnerPlayerId { get; set; }

    public DateTime? StartedAt { get; set; }

    public DateTime? ExpiresAt { get; set; }

    public DateTime? CompletedAt { get; set; }

    public MatchCompletionReason? CompletionReason { get; set; }

    public Room Room { get; set; } = null!;

    public ICollection<Guess> Guesses { get; set; } = [];
}
