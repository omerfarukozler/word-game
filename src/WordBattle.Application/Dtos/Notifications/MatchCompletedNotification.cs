using WordBattle.Domain.Enums;

namespace WordBattle.Application.Dtos.Notifications;

public sealed class MatchCompletedNotification
{
    public Guid MatchId { get; set; }

    public Guid? WinnerPlayerId { get; set; }

    public DateTime CompletedAt { get; set; }

    public MatchCompletionReason CompletionReason { get; set; }

    public bool IsDraw { get; set; }
}
