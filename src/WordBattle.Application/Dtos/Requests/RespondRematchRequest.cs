namespace WordBattle.Application.Dtos.Requests;

public sealed class RespondRematchRequest
{
    public string PlayerToken { get; set; } = string.Empty;

    public bool Accept { get; set; }
}
