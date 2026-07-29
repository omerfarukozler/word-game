using WordBattle.Application.Dtos.Notifications;
using WordBattle.Application.Dtos.Responses;

namespace WordBattle.Tests.Application.Dtos;

public sealed class RematchNotificationTests
{
    [Theory]
    [InlineData("PlayerToken")]
    [InlineData("TargetWord")]
    [InlineData("Room")]
    [InlineData("RoomPlayer")]
    [InlineData("GameMatch")]
    public void RematchRequestedNotification_ShouldNotExposeSensitiveOrEntityFields(
        string propertyName)
    {
        var property = typeof(RematchRequestedNotification).GetProperty(propertyName);

        Assert.Null(property);
    }

    [Theory]
    [InlineData("PlayerToken")]
    [InlineData("TargetWord")]
    [InlineData("Room")]
    [InlineData("RoomPlayer")]
    [InlineData("GameMatch")]
    public void RematchRejectedNotification_ShouldNotExposeSensitiveOrEntityFields(
        string propertyName)
    {
        var property = typeof(RematchRejectedNotification).GetProperty(propertyName);

        Assert.Null(property);
    }

    [Theory]
    [InlineData("PlayerToken")]
    [InlineData("TargetWord")]
    [InlineData("Room")]
    public void RematchRequestResponse_ShouldNotExposeSensitiveOrEntityFields(
        string propertyName)
    {
        var property = typeof(RematchRequestResponse).GetProperty(propertyName);

        Assert.Null(property);
    }
}
