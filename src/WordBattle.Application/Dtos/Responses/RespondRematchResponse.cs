namespace WordBattle.Application.Dtos.Responses;

public sealed class RespondRematchResponse
{
    public bool Accepted { get; set; }

    public MatchResponse? Match { get; set; }
}
