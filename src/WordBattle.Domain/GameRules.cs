namespace WordBattle.Domain;

public static class GameRules
{
    public const int MaximumAttemptsPerPlayer = 6;

    public static readonly TimeSpan MatchDuration = TimeSpan.FromMinutes(2);
}
