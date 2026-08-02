using WordBattle.Domain;
using WordBattle.Domain.Entities;
using WordBattle.Domain.Enums;

namespace WordBattle.Tests.Domain.Entities;

public sealed class GameMatchTests
{
    [Fact]
    public void GameMatch_ShouldExposeDeadlineAndCompletionReason()
    {
        var expiresAt = DateTime.UtcNow.Add(GameRules.MatchDuration);
        var match = new GameMatch
        {
            ExpiresAt = expiresAt,
            CompletionReason = MatchCompletionReason.TimeExpired
        };

        Assert.Equal(expiresAt, match.ExpiresAt);
        Assert.Equal(MatchCompletionReason.TimeExpired, match.CompletionReason);
    }

    [Fact]
    public void GameRules_ShouldDefineAttemptLimitAndMatchDuration()
    {
        Assert.Equal(6, GameRules.MaximumAttemptsPerPlayer);
        Assert.Equal(TimeSpan.FromMinutes(2), GameRules.MatchDuration);
    }
}
