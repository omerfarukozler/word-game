namespace WordBattle.Application.Dtos.Responses;

public sealed class CreateRoomResponse
{
    public Guid RoomId { get; set; }

    public string Code { get; set; } = string.Empty;

    public Guid PlayerId { get; set; }

    public string PlayerToken { get; set; } = string.Empty;

    public bool IsHost { get; set; }
}
