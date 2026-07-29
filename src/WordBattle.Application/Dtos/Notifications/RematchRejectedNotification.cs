namespace WordBattle.Application.Dtos.Notifications;

public sealed class RematchRejectedNotification
{
    public Guid RequestedByPlayerId { get; set; }

    public Guid RejectedByPlayerId { get; set; }

    public DateTime RejectedAt { get; set; }
}
