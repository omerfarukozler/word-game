using WordBattle.Application.Dtos.Responses;
using WordBattle.Domain.Enums;

namespace WordBattle.Tests.Application.Dtos;

public sealed class SubmitGuessResponseTests
{
    [Theory]
    [InlineData("TargetWord")]
    [InlineData("PlayerToken")]
    [InlineData("Room")]
    [InlineData("Match")]
    public void SubmitGuessResponse_ShouldNotExposeSensitiveOrEntityFields(
        string propertyName)
    {
        var property = typeof(SubmitGuessResponse).GetProperty(propertyName);

        Assert.Null(property);
    }

    [Fact]
    public void SubmitGuessResponse_ShouldExposeCompletionResultWithoutSensitiveData()
    {
        var response = new SubmitGuessResponse
        {
            CompletionReason = MatchCompletionReason.AttemptLimit,
            IsDraw = false,
            IsMatchCompleted = true,
            WinnerPlayerId = Guid.NewGuid()
        };

        Assert.Equal(MatchCompletionReason.AttemptLimit, response.CompletionReason);
        Assert.False(response.IsDraw);
        Assert.True(response.IsMatchCompleted);
        Assert.NotNull(response.WinnerPlayerId);
    }
}
