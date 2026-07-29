using WordBattle.Domain.Entities;

namespace WordBattle.Tests.Domain.Entities;

public sealed class RoomTests
{
    [Fact]
    public void Room_ShouldExposeNullableRematchRequestedByPlayerId()
    {
        var property = typeof(Room).GetProperty(nameof(Room.RematchRequestedByPlayerId));

        Assert.NotNull(property);
        Assert.Equal(typeof(Guid?), property.PropertyType);
    }

    [Fact]
    public void Room_ShouldExposeNullableRematchRequestedAt()
    {
        var property = typeof(Room).GetProperty(nameof(Room.RematchRequestedAt));

        Assert.NotNull(property);
        Assert.Equal(typeof(DateTime?), property.PropertyType);
    }

    [Fact]
    public void Room_ShouldNotExposeRematchRequestedByPlayerNavigation()
    {
        var property = typeof(Room).GetProperty("RematchRequestedByPlayer");

        Assert.Null(property);
    }
}
