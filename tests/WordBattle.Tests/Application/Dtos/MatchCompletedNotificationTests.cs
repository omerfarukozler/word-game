using WordBattle.Application.Dtos.Notifications;
using WordBattle.Domain.Enums;

namespace WordBattle.Tests.Application.Dtos;

public sealed class MatchCompletedNotificationTests
{
    [Theory]
    [InlineData("PlayerToken")]
    [InlineData("Room")]
    [InlineData("Match")]
    public void MatchCompletedNotification_ShouldNotExposeSensitiveOrEntityFields(
        string propertyName)
    {
        var property = typeof(MatchCompletedNotification).GetProperty(propertyName);

        Assert.Null(property);
    }

    [Fact]
    public void MatchCompletedNotification_ShouldSupportDrawPayload()
    {
        var notification = new MatchCompletedNotification
        {
            MatchId = Guid.NewGuid(),
            WinnerPlayerId = null,
            TargetWord = "İNCİR",
            CompletedAt = DateTime.UtcNow,
            CompletionReason = MatchCompletionReason.TimeExpired,
            IsDraw = true
        };

        Assert.Null(notification.WinnerPlayerId);
        Assert.Equal("İNCİR", notification.TargetWord);
        Assert.Equal(MatchCompletionReason.TimeExpired, notification.CompletionReason);
        Assert.True(notification.IsDraw);
    }
}
