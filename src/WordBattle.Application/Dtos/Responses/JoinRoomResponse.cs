namespace WordBattle.Application.Dtos.Responses;

public sealed class JoinRoomResponse
{
    public Guid RoomId { get; set; }

    public string Code { get; set; } = string.Empty;

    public Guid PlayerId { get; set; }

    public string PlayerToken { get; set; } = string.Empty;
}
