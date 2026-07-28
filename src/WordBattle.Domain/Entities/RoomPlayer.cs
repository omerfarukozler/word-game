namespace WordBattle.Domain.Entities;

public sealed class RoomPlayer
{
    public Guid Id { get; set; }

    public Guid RoomId { get; set; }

    public string Nickname { get; set; } = string.Empty;

    public string PlayerToken { get; set; } = string.Empty;

    public int Score { get; set; }

    public bool IsReady { get; set; }

    public bool IsConnected { get; set; }

    public bool IsHost { get; set; }

    public Room Room { get; set; } = null!;
}
