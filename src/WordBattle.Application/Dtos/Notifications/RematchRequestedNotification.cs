namespace WordBattle.Application.Dtos.Notifications;

public sealed class RematchRequestedNotification
{
    public Guid RequestedByPlayerId { get; set; }

    public DateTime RequestedAt { get; set; }
}
