namespace WordBattle.Application.Dtos.Responses;

public sealed class RoomPlayerResponse
{
    public Guid Id { get; set; }

    public string Nickname { get; set; } = string.Empty;

    public int Score { get; set; }

    public bool IsReady { get; set; }

    public bool IsConnected { get; set; }

    public bool IsHost { get; set; }
}
