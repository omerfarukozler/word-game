namespace WordBattle.Application.Dtos.Requests;

public sealed class SubmitGuessRequest
{
    public string PlayerToken { get; set; } = string.Empty;

    public string Word { get; set; } = string.Empty;
}
