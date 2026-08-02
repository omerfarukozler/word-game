using WordBattle.Domain.Enums;

namespace WordBattle.Application.Dtos.Responses;

public sealed class MatchResponse
{
    public Guid Id { get; set; }

    public Guid RoomId { get; set; }

    public MatchStatus Status { get; set; }

    public Guid? WinnerPlayerId { get; set; }

    public DateTime? StartedAt { get; set; }

    public DateTime? ExpiresAt { get; set; }

    public DateTime? CompletedAt { get; set; }

    public MatchCompletionReason? CompletionReason { get; set; }
}
