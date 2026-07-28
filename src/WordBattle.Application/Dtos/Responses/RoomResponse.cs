using WordBattle.Domain.Enums;

namespace WordBattle.Application.Dtos.Responses;

public sealed class RoomResponse
{
    public Guid Id { get; set; }

    public string Code { get; set; } = string.Empty;

    public RoomStatus Status { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? ClosedAt { get; set; }

    public IReadOnlyCollection<RoomPlayerResponse> Players { get; set; } = [];

    public IReadOnlyCollection<MatchResponse> Matches { get; set; } = [];
}
