using WordBattle.Application.Dtos.Notifications;

namespace WordBattle.Tests.Application.Dtos;

public sealed class GuessSubmittedNotificationTests
{
    [Theory]
    [InlineData("TargetWord")]
    [InlineData("PlayerToken")]
    [InlineData("WinnerPlayerId")]
    [InlineData("CompletedAt")]
    public void GuessSubmittedNotification_ShouldNotExposeSensitiveOrCompletionFields(
        string propertyName)
    {
        var property = typeof(GuessSubmittedNotification).GetProperty(propertyName);

        Assert.Null(property);
    }
}
