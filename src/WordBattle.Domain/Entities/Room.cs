using WordBattle.Domain.Enums;

namespace WordBattle.Domain.Entities;

public sealed class Room
{
    public Guid Id { get; set; }

    public string Code { get; set; } = string.Empty;

    public RoomStatus Status { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? ClosedAt { get; set; }

    public Guid? RematchRequestedByPlayerId { get; set; }

    public DateTime? RematchRequestedAt { get; set; }

    public ICollection<RoomPlayer> Players { get; set; } = [];

    public ICollection<GameMatch> Matches { get; set; } = [];
}
