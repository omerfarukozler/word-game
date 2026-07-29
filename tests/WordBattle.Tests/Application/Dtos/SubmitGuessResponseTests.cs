using WordBattle.Application.Dtos.Responses;

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
}
