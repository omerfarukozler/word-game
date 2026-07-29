using WordBattle.Application.Dtos.Notifications;

namespace WordBattle.Tests.Application.Dtos;

public sealed class MatchCompletedNotificationTests
{
    [Theory]
    [InlineData("TargetWord")]
    [InlineData("PlayerToken")]
    [InlineData("Room")]
    [InlineData("Match")]
    public void MatchCompletedNotification_ShouldNotExposeSensitiveOrEntityFields(
        string propertyName)
    {
        var property = typeof(MatchCompletedNotification).GetProperty(propertyName);

        Assert.Null(property);
    }
}
