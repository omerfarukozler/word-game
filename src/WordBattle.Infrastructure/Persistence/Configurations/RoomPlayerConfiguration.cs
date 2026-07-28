using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WordBattle.Domain.Entities;

namespace WordBattle.Infrastructure.Persistence.Configurations;

public sealed class RoomPlayerConfiguration : IEntityTypeConfiguration<RoomPlayer>
{
    public void Configure(EntityTypeBuilder<RoomPlayer> builder)
    {
        builder.ToTable("RoomPlayers");

        builder.HasKey(player => player.Id);

        builder.Property(player => player.Nickname)
            .IsRequired()
            .HasMaxLength(32);

        builder.Property(player => player.PlayerToken)
            .IsRequired()
            .HasMaxLength(128);

        builder.Property(player => player.Score)
            .IsRequired();

        builder.Property(player => player.IsReady)
            .IsRequired();

        builder.Property(player => player.IsConnected)
            .IsRequired();

        builder.Property(player => player.IsHost)
            .IsRequired();

        builder.HasIndex(player => player.PlayerToken);
    }
}
